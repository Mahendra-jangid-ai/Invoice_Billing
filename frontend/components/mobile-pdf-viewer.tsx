'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PDFViewer, type DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import { Loader2, X } from 'lucide-react'

export function MobilePdfViewer({
  blob,
  url,
  pdfDocument,
  fileName,
  open,
  onClose,
}: {
  blob?: Blob | null
  url?: string | null
  pdfDocument?: ReactElement<DocumentProps>
  fileName: string
  open: boolean
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [useReactPdf, setUseReactPdf] = useState(false)

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

  useEffect(() => {
    if (!open) {
      setObjectUrl(null)
      setUseReactPdf(false)
      return
    }

    if (blob) {
      const nextUrl = URL.createObjectURL(blob)
      setObjectUrl(nextUrl)
      setUseReactPdf(false)
      return () => {
        URL.revokeObjectURL(nextUrl)
      }
    }

    if (url) {
      setObjectUrl(url)
      setUseReactPdf(false)
      return
    }

    if (pdfDocument) {
      setUseReactPdf(true)
    }
  }, [open, blob, url, pdfDocument])

  if (!open || !mounted) return null

  const viewerHeight = typeof window !== 'undefined' ? Math.max(window.innerHeight - 64, 400) : 600

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-white"
      style={{ height: '100dvh', width: '100vw' }}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
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

      <div className="relative min-h-0 flex-1 bg-slate-100">
        {useReactPdf && pdfDocument ? (
          <PDFViewer
            width="100%"
            height={Math.max(viewerHeight, 400)}
            showToolbar={false}
            style={{ width: '100%', height: '100%', border: 'none' }}
          >
            {pdfDocument}
          </PDFViewer>
        ) : objectUrl ? (
          <iframe
            src={objectUrl}
            title={fileName}
            className="absolute inset-0 h-full w-full border-0 bg-white"
          />
        ) : (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparing preview…
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
