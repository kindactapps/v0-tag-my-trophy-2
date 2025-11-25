"use client"

import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "warning" | "success"
  onConfirm: () => void
  onCancel?: () => void
  isLoading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationDialogProps) {
  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const handleConfirm = () => {
    onConfirm()
  }

  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <XCircle className="w-6 h-6 text-red-600" />
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-orange-600" />
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />
      default:
        return <Info className="w-6 h-6 text-blue-600" />
    }
  }

  const getButtonVariant = () => {
    switch (variant) {
      case "destructive":
        return "destructive"
      case "warning":
        return "default"
      case "success":
        return "default"
      default:
        return "default"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={getButtonVariant()}
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : variant === "warning"
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : variant === "success"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
            }
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
