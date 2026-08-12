'use client'

import { AlertCircle, X } from 'lucide-react'

interface ApiErrorBannerProps {
  message: string | null
  onDismiss?: () => void
}

export function ApiErrorBanner({ message, onDismiss }: ApiErrorBannerProps) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md p-1 text-red-600 hover:bg-red-100"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
