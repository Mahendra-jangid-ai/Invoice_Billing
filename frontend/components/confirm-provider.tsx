'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmOptions {
  title?: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => void
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)

  const confirm = useCallback((nextOptions: ConfirmOptions) => {
    setOptions(nextOptions)
    setOpen(true)
  }, [])

  const close = () => {
    if (loading) return
    setOpen(false)
    setOptions(null)
  }

  const handleConfirm = async () => {
    if (!options) return
    setLoading(true)
    try {
      await options.onConfirm()
      setOpen(false)
      setOptions(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            onClick={close}
            aria-label="Close dialog"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-description"
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl animate-scale-in"
          >
            <div className="flex gap-3 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <h3 id="confirm-title" className="text-base font-semibold text-slate-900">
                  {options.title || 'Are you sure?'}
                </h3>
                <p id="confirm-description" className="mt-1 text-sm leading-relaxed text-slate-500">
                  {options.description}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-3">
              <Button type="button" variant="outline" onClick={close} disabled={loading} className="min-w-[72px]">
                {options.cancelText || 'No'}
              </Button>
              <Button type="button" variant="destructive" onClick={handleConfirm} disabled={loading} className="min-w-[72px]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (options.confirmText || 'Yes')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return context
}
