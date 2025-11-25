"use client"
// Example component showing how to use the toast system
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast-provider"
import { createToast } from "@/lib/toast-helpers"

export function ExampleToastUsage() {
  const { addToast } = useToast()

  const showSuccessToast = () => {
    addToast(createToast.success("Your memory has been saved successfully!"))
  }

  const showErrorToast = () => {
    addToast(
      createToast.error("Failed to upload file. Please try again.", "Upload Error", {
        label: "Retry",
        onClick: () => console.log("Retrying upload..."),
      }),
    )
  }

  const showUploadSuccess = () => {
    addToast(createToast.uploadSuccess(3))
  }

  const showNetworkError = () => {
    addToast(
      createToast.networkError(() => {
        console.log("Retrying connection...")
        addToast(createToast.info("Retrying connection..."))
      }),
    )
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Toast Examples</h3>
      <div className="flex flex-wrap gap-2">
        <Button onClick={showSuccessToast} className="bg-green-600 hover:bg-green-700">
          Success Toast
        </Button>
        <Button onClick={showErrorToast} className="bg-red-600 hover:bg-red-700">
          Error Toast
        </Button>
        <Button onClick={showUploadSuccess} className="bg-blue-600 hover:bg-blue-700">
          Upload Success
        </Button>
        <Button onClick={showNetworkError} className="bg-orange-600 hover:bg-orange-700">
          Network Error
        </Button>
      </div>
    </div>
  )
}
