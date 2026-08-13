'use client'

import { X } from 'lucide-react'

export function MobilePdfViewer({
  url,
  fileName,
  open,
  onClose,
}: {
  url: string | null | undefined
  fileName: string
  open: boolean
  onClose: () => void
}) {
  if (!open || !url) return null

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{fileName}</p>
          <p className="text-xs text-slate-500">Invoice preview</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm active:bg-slate-50"
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </button>
      </header>
      <iframe
        src={url}
        title={fileName}
        className="min-h-0 flex-1 w-full border-0 bg-slate-100"
      />
    </div>
  )
}
