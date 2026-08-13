'use client'

import { useEffect, useState } from 'react'
import { PDFViewer, type DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import { X } from 'lucide-react'

export function MobilePdfViewer({
  url,
  blob,
  fileName,
  open,
  onClose,
  pdfDocument,
}: {
  url?: string | null
  blob?: Blob | null
  fileName: string
  open: boolean
  onClose: () => void
  pdfDocument?: ReactElement<DocumentProps>
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open || pdfDocument || !blob) {
      setObjectUrl(null)
      return
    }

    const nextUrl = URL.createObjectURL(blob)
    setObjectUrl(nextUrl)

    return () => {
      URL.revokeObjectURL(nextUrl)
    }
  }, [open, blob, pdfDocument])

  if (!open) return null

  const embedUrl = pdfDocument ? null : objectUrl || url

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

      <div className="min-h-0 flex-1 bg-slate-100">
        {pdfDocument ? (
          <PDFViewer
            width="100%"
            height="100%"
            showToolbar={false}
            style={{ width: '100%', height: '100%', border: 'none' }}
          >
            {pdfDocument}
          </PDFViewer>
        ) : embedUrl ? (
          <embed
            src={embedUrl}
            type="application/pdf"
            title={fileName}
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Preparing preview…
          </div>
        )}
      </div>
    </div>
  )
}
