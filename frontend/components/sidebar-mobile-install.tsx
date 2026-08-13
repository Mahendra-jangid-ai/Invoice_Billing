'use client'

import { useState } from 'react'
import { Download, Share, Smartphone } from 'lucide-react'
import { usePwaInstall } from '@/lib/use-pwa-install'
import { cn } from '@/lib/utils'

export function SidebarMobileInstall({ onClose }: { onClose?: () => void }) {
  const { canInstall, canPrompt, install, isIos, isInstalled } = usePwaInstall()
  const [showIosHint, setShowIosHint] = useState(false)
  const [showAndroidHint, setShowAndroidHint] = useState(false)

  if (isInstalled) return null

  const handleInstall = async () => {
    if (canPrompt) {
      const outcome = await install()
      if (outcome === 'accepted') onClose?.()
      return
    }

    if (isIos) {
      setShowIosHint((v) => !v)
      return
    }

    setShowAndroidHint((v) => !v)
  }

  return (
    <div className="border-t border-slate-100 px-3 py-4 md:hidden">
      <p className="mb-2 px-3 text-xs font-medium text-slate-400">Get the app</p>

      <button
        type="button"
        onClick={handleInstall}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors',
          canPrompt
            ? 'bg-[#2563EB] text-white shadow-sm active:bg-blue-700'
            : 'border border-blue-200 bg-blue-50 text-[#2563EB] active:bg-blue-100',
        )}
      >
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            canPrompt ? 'bg-white/20' : 'bg-white',
          )}
        >
          {canPrompt ? <Download className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
        </span>
        <span className="text-left">
          Install App
          {!canPrompt && !isIos && (
            <span className="mt-0.5 block text-[11px] font-normal opacity-80">Tap for steps</span>
          )}
        </span>
      </button>

      {showIosHint && (
        <div className="mt-2 flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs leading-relaxed text-blue-800">
          <Share className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            In Safari, tap <strong>Share</strong>, then choose <strong>Add to Home Screen</strong>.
          </span>
        </div>
      )}

      {showAndroidHint && !canPrompt && (
        <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
          Open Chrome menu <strong>⋮</strong> and tap <strong>Install app</strong> or{' '}
          <strong>Add to Home screen</strong>.
        </div>
      )}
    </div>
  )
}
