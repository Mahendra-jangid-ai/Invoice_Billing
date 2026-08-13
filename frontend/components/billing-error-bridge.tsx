'use client'

import { useEffect, useRef } from 'react'
import { useBilling } from '@/lib/context'
import { useFeedback } from '@/components/confirm-provider'

export function BillingErrorBridge() {
  const { error, clearError } = useBilling()
  const { error: showError } = useFeedback()
  const lastShown = useRef<string | null>(null)

  useEffect(() => {
    if (!error) {
      lastShown.current = null
      return
    }
    if (error === lastShown.current) return

    lastShown.current = error
    showError({
      title: 'Something went wrong',
      description: error,
      onClose: clearError,
    })
  }, [error, clearError, showError])

  return null
}
