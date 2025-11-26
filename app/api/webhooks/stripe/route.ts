import { type NextRequest, NextResponse } from "next/server"
import { stripe, constructWebhookEvent, STRIPE_ANNUAL_HOSTING_PRICE_ID } from "@/lib/stripe"
import { headers } from "next/headers"
import { OrderService } from "@/lib/order-service"
import { NotificationService } from "@/lib/notification-service"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    const event = constructWebhookEvent(body, signature)

    const orderService = OrderService.getInstance()
    const notificationService = NotificationService.getInstance()
    const supabase = await createClient()

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object
        console.log("Payment succeeded:", paymentIntent.id)

        const {
          plan,
          planName,
          customerEmail,
          customerName,
          customization,
          subtotal,
          tax,
          total,
          type,
          createSubscription: shouldCreateSubscription,
        } = paymentIntent.metadata

        try {
          const order = await orderService.createOrder({
            paymentIntentId: paymentIntent.id,
            customerEmail,
            customerName,
            plan,
            planName,
            subtotal,
            tax,
            total,
            customization,
            shippingAddress: {
              line1: paymentIntent.shipping?.address?.line1 || "",
              city: paymentIntent.shipping?.address?.city || "",
              state: paymentIntent.shipping?.address?.state || "",
              postal_code: paymentIntent.shipping?.address?.postal_code || "",
              country: paymentIntent.shipping?.address?.country || "US",
            },
          })

          if (shouldCreateSubscription === "true" && type === "initial_purchase") {
            try {
              const stripeCustomerId = paymentIntent.customer as string

              if (!stripeCustomerId) {
                throw new Error("No customer ID found on payment intent")
              }

              const subscription = await stripe.subscriptions.create({
                customer: stripeCustomerId,
                items: [{ price: STRIPE_ANNUAL_HOSTING_PRICE_ID }],
                trial_period_days: 365,
                default_payment_method: paymentIntent.payment_method as string,
                metadata: {
                  orderId: order.id,
                  customerEmail,
                  customerName,
                },
              })

              const { data: profile } = await supabase.from("profiles").select("id").eq("email", customerEmail).single()

              if (profile) {
                await supabase.from("subscriptions").insert({
                  user_id: profile.id,
                  order_id: order.id,
                  stripe_subscription_id: subscription.id,
                  stripe_customer_id: stripeCustomerId,
                  stripe_price_id: STRIPE_ANNUAL_HOSTING_PRICE_ID,
                  status: subscription.status,
                  current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                  metadata: {
                    plan: planName,
                    orderId: order.id,
                  },
                })

                console.log("✅ Subscription created with 1-year trial:", subscription.id)
              }
            } catch (subError) {
              console.error("Failed to create subscription:", subError)
              await notificationService.sendAdminAlert("support_request", {
                type: "subscription_creation_failed",
                orderId: order.id,
                customerEmail,
                error: subError instanceof Error ? subError.message : "Unknown error",
              })
            }
          }

          await notificationService.sendOrderNotification(customerEmail, "order_confirmed", {
            orderNumber: order.orderNumber,
            message: `Your ${planName} order has been confirmed and your QR experience is ready!`,
            metadata: {
              qrSlug: order.qrSlug,
              plan: planName,
            },
          })

          await notificationService.sendAdminAlert("new_order", {
            orderNumber: order.orderNumber,
            customerEmail,
            plan: planName,
            total,
            paymentIntentId: paymentIntent.id,
          })

          console.log("✅ Post-purchase automation completed for order:", order.orderNumber)
        } catch (error) {
          console.error("Failed to process successful payment:", error)

          await notificationService.sendAdminAlert("support_request", {
            type: "order_creation_failed",
            paymentIntentId: paymentIntent.id,
            customerEmail,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }

        break
      }

      case "customer.subscription.created": {
        const subscription = event.data.object
        console.log("✅ Subscription created:", {
          id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        })

        await supabase.from("subscription_events").insert({
          subscription_id: subscription.id,
          event_type: "created",
          stripe_event_id: event.id,
          event_data: subscription,
        })

        break
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object
        console.log("⚠️ Subscription trial ending soon:", {
          id: subscription.id,
          customer: subscription.customer,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          days_until_billing: subscription.trial_end
            ? Math.ceil((subscription.trial_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
            : 0,
        })

        await supabase.from("subscription_events").insert({
          subscription_id: subscription.id,
          event_type: "trial_will_end",
          stripe_event_id: event.id,
          event_data: subscription,
        })

        const { data: subscription_data } = await supabase
          .from("subscriptions")
          .select("*, profiles(email)")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (subscription_data) {
          await notificationService.sendAdminAlert("subscription_trial_ending", {
            subscriptionId: subscription.id,
            customerEmail: subscription_data.profiles?.email,
            trialEndDate: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          })
        }

        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object
        console.log("🔄 Subscription updated:", {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
        })

        const { data: existingSubscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (existingSubscription) {
          await supabase
            .from("subscriptions")
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            })
            .eq("stripe_subscription_id", subscription.id)
        }

        await supabase.from("subscription_events").insert({
          subscription_id: subscription.id,
          event_type: "updated",
          stripe_event_id: event.id,
          event_data: subscription,
        })

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object
        console.log("❌ Subscription deleted:", {
          id: subscription.id,
          customer: subscription.customer,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        })

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        await supabase.from("subscription_events").insert({
          subscription_id: subscription.id,
          event_type: "deleted",
          stripe_event_id: event.id,
          event_data: subscription,
        })

        const { data: subscription_data } = await supabase
          .from("subscriptions")
          .select("*, profiles(email)")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (subscription_data) {
          await notificationService.sendAdminAlert("subscription_canceled", {
            subscriptionId: subscription.id,
            customerEmail: subscription_data.profiles?.email,
            canceledAt: new Date().toISOString(),
          })
        }

        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object
        const isSubscriptionRenewal = invoice.billing_reason === "subscription_cycle"

        console.log("💰 Invoice payment succeeded:", {
          id: invoice.id,
          subscription: invoice.subscription,
          billing_reason: invoice.billing_reason,
          is_renewal: isSubscriptionRenewal,
          amount: invoice.amount_paid / 100,
        })

        if (invoice.subscription) {
          await supabase.from("subscription_events").insert({
            subscription_id: invoice.subscription as string,
            event_type: "payment_succeeded",
            stripe_event_id: event.id,
            event_data: {
              ...invoice,
              is_renewal: isSubscriptionRenewal,
            },
          })

          if (isSubscriptionRenewal) {
            const { data: subscription_data } = await supabase
              .from("subscriptions")
              .select("*, profiles(email)")
              .eq("stripe_subscription_id", invoice.subscription)
              .single()

            if (subscription_data) {
              await notificationService.sendAdminAlert("subscription_renewed", {
                subscriptionId: invoice.subscription as string,
                customerEmail: subscription_data.profiles?.email,
                invoiceId: invoice.id,
                amount: invoice.amount_paid / 100,
                renewalDate: new Date().toISOString(),
              })
            }
          }
        }

        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object
        console.log("❌ Invoice payment failed:", {
          id: invoice.id,
          subscription: invoice.subscription,
          amount: invoice.amount_due / 100,
          attempt_count: invoice.attempt_count,
          next_payment_attempt: invoice.next_payment_attempt
            ? new Date(invoice.next_payment_attempt * 1000).toISOString()
            : null,
        })

        if (invoice.subscription) {
          await supabase.from("subscription_events").insert({
            subscription_id: invoice.subscription as string,
            event_type: "payment_failed",
            stripe_event_id: event.id,
            event_data: invoice,
          })

          const { data: subscription_data } = await supabase
            .from("subscriptions")
            .select("*, profiles(email)")
            .eq("stripe_subscription_id", invoice.subscription)
            .single()

          if (subscription_data) {
            await notificationService.sendAdminAlert("subscription_payment_failed", {
              subscriptionId: invoice.subscription as string,
              customerEmail: subscription_data.profiles?.email,
              invoiceId: invoice.id,
              amount: invoice.amount_due / 100,
              attemptCount: invoice.attempt_count,
              nextAttempt: invoice.next_payment_attempt
                ? new Date(invoice.next_payment_attempt * 1000).toISOString()
                : null,
            })
          }
        }

        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object
        console.log("Payment failed:", paymentIntent.id)

        const { customerEmail, customerName } = paymentIntent.metadata

        await notificationService.sendAdminAlert("payment_failed", {
          paymentIntentId: paymentIntent.id,
          customerEmail,
          customerName,
          amount: paymentIntent.amount,
          failureReason: paymentIntent.last_payment_error?.message || "Unknown",
        })

        break
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object
        console.log("Payment canceled:", paymentIntent.id)

        const { customerEmail } = paymentIntent.metadata

        await notificationService.sendAdminAlert("support_request", {
          type: "payment_canceled",
          paymentIntentId: paymentIntent.id,
          customerEmail,
          amount: paymentIntent.amount,
        })

        break
      }

      case "charge.dispute.created": {
        const dispute = event.data.object
        console.log("Dispute created:", dispute.id)

        await notificationService.sendAdminAlert("dispute_created", {
          disputeId: dispute.id,
          chargeId: dispute.charge,
          amount: dispute.amount,
          reason: dispute.reason,
          status: dispute.status,
          evidence_due_by: dispute.evidence_details?.due_by,
        })

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
  }
}
