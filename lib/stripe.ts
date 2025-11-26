import Stripe from "stripe"

// SINGLE SOURCE OF TRUTH for Stripe API version
// All files must import and use this constant to ensure consistency
export const STRIPE_API_VERSION = "2024-06-20" as const

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[Stripe] STRIPE_SECRET_KEY not found - Stripe functionality will be limited")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: STRIPE_API_VERSION,
  typescript: true,
})

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  apiVersion: STRIPE_API_VERSION,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  currency: "usd",
  paymentMethods: ["card", "apple_pay", "google_pay"],
} as const

// Stripe Price ID for the standard plan (one-time payment)
export const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID || "price_standard_test"
export const STRIPE_ANNUAL_HOSTING_PRICE_ID =
  process.env.STRIPE_SUBSCRIPTION_PRICE_ID ||
  process.env.NEXT_PUBLIC_STRIPE_ANNUAL_HOSTING_PRICE_ID ||
  "price_annual_hosting_test"

export interface CreatePaymentIntentParams {
  amount: number
  currency?: string
  metadata?: Record<string, string>
  customerEmail?: string
  customerName?: string
  shippingAddress?: {
    line1: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

export async function createPaymentIntent({
  amount,
  currency = "usd",
  metadata = {},
  customerEmail,
  customerName,
  shippingAddress,
}: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
  try {
    let customer: Stripe.Customer | undefined

    if (customerEmail) {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          address: shippingAddress,
        })
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      customer: customer?.id,
      setup_future_usage: "off_session", // Save payment method for future charges
      receipt_email: customerEmail,
      shipping: shippingAddress
        ? {
            name: customerName || "Customer",
            address: shippingAddress,
          }
        : undefined,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return paymentIntent
  } catch (error) {
    console.error("Error creating payment intent:", error)
    throw new Error("Failed to create payment intent")
  }
}

export async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    console.error("Error retrieving payment intent:", error)
    throw new Error("Failed to retrieve payment intent")
  }
}

export async function createCustomer({
  email,
  name,
  phone,
  address,
}: {
  email: string
  name?: string
  phone?: string
  address?: Stripe.AddressParam
}): Promise<Stripe.Customer> {
  try {
    return await stripe.customers.create({
      email,
      name,
      phone,
      address,
    })
  } catch (error) {
    console.error("Error creating customer:", error)
    throw new Error("Failed to create customer")
  }
}

export async function processRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: "duplicate" | "fraudulent" | "requested_by_customer",
): Promise<Stripe.Refund> {
  try {
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason,
    })
  } catch (error) {
    console.error("Error processing refund:", error)
    throw new Error("Failed to process refund")
  }
}

export function constructWebhookEvent(body: string, signature: string): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret)
  } catch (error) {
    console.error("Error constructing webhook event:", error)
    throw new Error("Invalid webhook signature")
  }
}

export async function createSubscription({
  customerId,
  priceId,
  trialPeriodDays,
  metadata = {},
}: {
  customerId: string
  priceId: string
  trialPeriodDays?: number
  metadata?: Record<string, string>
}): Promise<Stripe.Subscription> {
  try {
    return await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: trialPeriodDays,
      metadata,
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
    })
  } catch (error) {
    console.error("Error creating subscription:", error)
    throw new Error("Failed to create subscription")
  }
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd = true,
): Promise<Stripe.Subscription> {
  try {
    if (cancelAtPeriodEnd) {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
    } else {
      return await stripe.subscriptions.cancel(subscriptionId)
    }
  } catch (error) {
    console.error("Error canceling subscription:", error)
    throw new Error("Failed to cancel subscription")
  }
}

export async function retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch (error) {
    console.error("Error retrieving subscription:", error)
    throw new Error("Failed to retrieve subscription")
  }
}

export async function updateSubscription(
  subscriptionId: string,
  params: Stripe.SubscriptionUpdateParams,
): Promise<Stripe.Subscription> {
  try {
    return await stripe.subscriptions.update(subscriptionId, params)
  } catch (error) {
    console.error("Error updating subscription:", error)
    throw new Error("Failed to update subscription")
  }
}

export async function listCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 100,
    })
    return subscriptions.data
  } catch (error) {
    console.error("Error listing customer subscriptions:", error)
    throw new Error("Failed to list customer subscriptions")
  }
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  try {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
  } catch (error) {
    console.error("Error creating billing portal session:", error)
    throw new Error("Failed to create billing portal session")
  }
}
