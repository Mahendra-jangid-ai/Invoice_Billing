'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PDFViewer, type DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import { X } from 'lucide-react'

export function MobilePdfViewer({
  pdfDocument,
  fileName,
  open,
  onClose,
}: {
  pdfDocument: ReactElement<DocumentProps>
  fileName: string
  open: boolean
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-white"
      style={{ height: '100dvh', width: '100vw' }}
    >
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 pt-[max(0.25rem,env(safe-area-inset-top))]">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{fileName}</p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 active:bg-slate-200"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div
        className="min-h-0 flex-1 overflow-hidden bg-white"
        style={{ height: 'calc(100dvh - 3rem - env(safe-area-inset-top, 0px))' }}
      >
        <PDFViewer
          width="100%"
          height="100%"
          showToolbar={false}
          style={{ width: '100%', height: '100%', border: 'none' }}
        >
          {pdfDocument}
        </PDFViewer>
      </div>
    </div>,
    document.body,
  )
}
