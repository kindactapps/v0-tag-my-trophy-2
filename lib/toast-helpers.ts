// Helper functions for common toast notifications
import type { Toast } from "@/components/ui/toast-provider"

export const createToast = {
  success: (message: string, title?: string, action?: Toast["action"]): Omit<Toast, "id"> => ({
    type: "success",
    title,
    message,
    action,
    duration: 5000,
  }),

  error: (message: string, title?: string, action?: Toast["action"]): Omit<Toast, "id"> => ({
    type: "error",
    title,
    message,
    action,
    duration: 7000, // Longer duration for errors
  }),

  warning: (message: string, title?: string, action?: Toast["action"]): Omit<Toast, "id"> => ({
    type: "warning",
    title,
    message,
    action,
    duration: 6000,
  }),

  info: (message: string, title?: string, action?: Toast["action"]): Omit<Toast, "id"> => ({
    type: "info",
    title,
    message,
    action,
    duration: 4000,
  }),

  // Specific toast types for common scenarios
  uploadSuccess: (fileCount: number): Omit<Toast, "id"> => ({
    type: "success",
    title: "Upload Complete!",
    message: `Successfully uploaded ${fileCount} ${fileCount === 1 ? "file" : "files"} to your story.`,
    duration: 5000,
  }),

  uploadError: (error: string, onRetry?: () => void): Omit<Toast, "id"> => ({
    type: "error",
    title: "Upload Failed",
    message: error,
    action: onRetry ? { label: "Try Again", onClick: onRetry } : undefined,
    duration: 8000,
  }),

  loginSuccess: (username?: string): Omit<Toast, "id"> => ({
    type: "success",
    title: "Welcome back!",
    message: username ? `Good to see you again, ${username}.` : "You're now signed in to your account.",
    duration: 4000,
  }),

  accountCreated: (username: string): Omit<Toast, "id"> => ({
    type: "success",
    title: "Account Created!",
    message: `Welcome to Tag My Trophy, ${username}! Your story space is ready.`,
    duration: 6000,
  }),

  profileUpdated: (): Omit<Toast, "id"> => ({
    type: "success",
    title: "Profile Updated",
    message: "Your changes have been saved successfully.",
    duration: 4000,
  }),

  qrGenerated: (onDownload?: () => void): Omit<Toast, "id"> => ({
    type: "success",
    title: "QR Code Ready!",
    message: "Your QR code has been generated and is ready to share.",
    action: onDownload ? { label: "Download", onClick: onDownload } : undefined,
    duration: 6000,
  }),

  networkError: (onRetry?: () => void): Omit<Toast, "id"> => ({
    type: "error",
    title: "Connection Problem",
    message: "Please check your internet connection and try again.",
    action: onRetry ? { label: "Retry", onClick: onRetry } : undefined,
    duration: 8000,
  }),

  paymentSuccess: (plan: string): Omit<Toast, "id"> => ({
    type: "success",
    title: "Payment Successful!",
    message: `Welcome to Tag My Trophy ${plan}! Your new features are now active.`,
    duration: 6000,
  }),

  paymentError: (onRetry?: () => void): Omit<Toast, "id"> => ({
    type: "error",
    title: "Payment Failed",
    message: "There was an issue processing your payment. Please try again.",
    action: onRetry ? { label: "Try Again", onClick: onRetry } : undefined,
    duration: 8000,
  }),

  commentAdded: (): Omit<Toast, "id"> => ({
    type: "success",
    message: "Thank you for sharing your thoughts! Your comment has been posted.",
    duration: 4000,
  }),

  inviteSent: (email: string): Omit<Toast, "id"> => ({
    type: "success",
    title: "Invitation Sent!",
    message: `${email} will receive an email to join your memory collection.`,
    duration: 5000,
  }),

  storageWarning: (percentage: number): Omit<Toast, "id"> => ({
    type: "warning",
    title: "Storage Almost Full",
    message: `You've used ${percentage}% of your storage. Consider upgrading for more space.`,
    duration: 8000,
  }),
}
