'use client'

import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePwaInstall } from '@/lib/use-pwa-install'

export function PwaInstallPrompt() {
  const { canInstall, canPrompt, install, isIos } = usePwaInstall()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('pwa-install-dismissed') === '1') {
      setDismissed(true)
    }
  }, [])

  const dismiss = () => {
    sessionStorage.setItem('pwa-install-dismissed', '1')
    setDismissed(true)
  }

  const handleInstall = async () => {
    const outcome = await install()
    if (outcome === 'accepted') dismiss()
  }

  if (dismissed || !canInstall) return null

  return (
    <div className="pwa-install-anchor fixed inset-x-4 z-[55] md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-xl shadow-slate-200/60">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Install Billing Studio</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {isIos
                ? 'Tap Share in Safari, then choose "Add to Home Screen" to open like an app.'
                : 'Add to your home screen and use it like a native app — without the browser bar.'}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {canPrompt ? (
          <Button onClick={handleInstall} className="mt-3 h-10 w-full gap-2">
            <Download className="h-4 w-4" />
            Install app
          </Button>
        ) : (
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
            <Share className="h-3.5 w-3.5" />
            Share → Add to Home Screen
          </div>
        )}
      </div>
    </div>
  )
}
