'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Info,
  Loader2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export type AlertType = 'info' | 'success' | 'warning' | 'error'

interface ConfirmOptions {
  title?: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
}

interface AlertOptions {
  title?: string
  description: string
  okText?: string
  type?: AlertType
  onClose?: () => void
}

type DialogState =
  | ({ mode: 'confirm' } & ConfirmOptions)
  | ({ mode: 'alert' } & AlertOptions)

interface FeedbackContextValue {
  confirm: (options: ConfirmOptions) => void
  alert: (options: AlertOptions) => void
  info: (options: Omit<AlertOptions, 'type'>) => void
  success: (options: Omit<AlertOptions, 'type'>) => void
  warning: (options: Omit<AlertOptions, 'type'>) => void
  error: (options: Omit<AlertOptions, 'type'>) => void
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

const ALERT_META: Record<
  AlertType,
  { icon: typeof Info; iconClass: string; bgClass: string; defaultTitle: string }
> = {
  info: {
    icon: Info,
    iconClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    defaultTitle: 'Information',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
    defaultTitle: 'Success',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    defaultTitle: 'Warning',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-red-600',
    bgClass: 'bg-red-50',
    defaultTitle: 'Error',
  },
}

function FeedbackDialog({
  dialog,
  loading,
  onClose,
  onConfirm,
}: {
  dialog: DialogState
  loading: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const isConfirm = dialog.mode === 'confirm'
  const alertType = dialog.mode === 'alert' ? (dialog.type ?? 'info') : 'warning'
  const meta = ALERT_META[alertType]
  const Icon = isConfirm ? CircleAlert : meta.icon

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        onClick={isConfirm ? undefined : onClose}
        aria-label="Close dialog"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl animate-scale-in"
      >
        <div className="flex gap-3 p-5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isConfirm ? 'bg-amber-50' : meta.bgClass
            }`}
          >
            <Icon className={`h-5 w-5 ${isConfirm ? 'text-amber-600' : meta.iconClass}`} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900">
              {dialog.title ||
                (isConfirm ? 'Are you sure?' : meta.defaultTitle)}
            </h3>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-500">
              {dialog.description}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-3">
          {isConfirm ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="min-w-[72px]"
              >
                {dialog.cancelText || 'No'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={onConfirm}
                disabled={loading}
                className="min-w-[72px]"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  dialog.confirmText || 'Yes'
                )}
              </Button>
            </>
          ) : (
            <Button type="button" onClick={onClose} className="min-w-[88px]">
              {dialog.okText || 'OK'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [loading, setLoading] = useState(false)

  const close = useCallback(() => {
    if (loading) return
    const onClose = dialog?.mode === 'alert' ? dialog.onClose : undefined
    setDialog(null)
    onClose?.()
  }, [dialog, loading])

  const confirm = useCallback((options: ConfirmOptions) => {
    setDialog({ mode: 'confirm', ...options })
  }, [])

  const alert = useCallback((options: AlertOptions) => {
    setDialog({ mode: 'alert', type: 'info', ...options })
  }, [])

  const info = useCallback((options: Omit<AlertOptions, 'type'>) => {
    setDialog({ mode: 'alert', type: 'info', ...options })
  }, [])

  const success = useCallback((options: Omit<AlertOptions, 'type'>) => {
    setDialog({ mode: 'alert', type: 'success', ...options })
  }, [])

  const warning = useCallback((options: Omit<AlertOptions, 'type'>) => {
    setDialog({ mode: 'alert', type: 'warning', ...options })
  }, [])

  const error = useCallback((options: Omit<AlertOptions, 'type'>) => {
    setDialog({ mode: 'alert', type: 'error', ...options })
  }, [])

  const handleConfirm = async () => {
    if (!dialog || dialog.mode !== 'confirm') return
    setLoading(true)
    try {
      await dialog.onConfirm()
      setDialog(null)
    } finally {
      setLoading(false)
    }
  }

  const value: FeedbackContextValue = {
    confirm,
    alert,
    info,
    success,
    warning,
    error,
  }

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {dialog && (
        <FeedbackDialog
          dialog={dialog}
          loading={loading}
          onClose={close}
          onConfirm={handleConfirm}
        />
      )}
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error('useFeedback must be used within ConfirmProvider')
  }
  return context
}

export function useConfirm() {
  const { confirm } = useFeedback()
  return { confirm }
}
