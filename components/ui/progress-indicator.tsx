"use client"

import type React from "react"

import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressStep {
  id: string
  label: string
  status: "completed" | "current" | "pending" | "error"
  icon?: React.ComponentType<{ className?: string }>
}

interface ProgressIndicatorProps {
  steps: ProgressStep[]
  className?: string
}

export function ProgressIndicator({ steps, className }: ProgressIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const Icon = step.icon || Clock
        const isLast = index === steps.length - 1

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn("flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors", {
                  "bg-green-100 border-green-500 text-green-700": step.status === "completed",
                  "bg-blue-100 border-blue-500 text-blue-700": step.status === "current",
                  "bg-gray-100 border-gray-300 text-gray-500": step.status === "pending",
                  "bg-red-100 border-red-500 text-red-700": step.status === "error",
                })}
              >
                {step.status === "completed" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : step.status === "error" ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={cn("mt-2 text-xs font-medium text-center", {
                  "text-green-700": step.status === "completed",
                  "text-blue-700": step.status === "current",
                  "text-gray-500": step.status === "pending",
                  "text-red-700": step.status === "error",
                })}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn("flex-1 h-0.5 mx-4 transition-colors", {
                  "bg-green-500": step.status === "completed",
                  "bg-gray-300": step.status !== "completed",
                })}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
