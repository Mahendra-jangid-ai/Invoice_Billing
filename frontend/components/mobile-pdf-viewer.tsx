'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { pdf, type DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import { Loader2, X } from 'lucide-react'

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
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

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
      setBlobUrl(null)
      setLoading(false)
      setError(false)
      return
    }

    let cancelled = false
    let objectUrl: string | null = null

    const prepare = async () => {
      setLoading(true)
      setError(false)
      try {
        const blob = await pdf(pdfDocument).toBlob()
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
        setLoading(false)
      } catch {
        if (!cancelled) {
          setLoading(false)
          setError(true)
        }
      }
    }

    void prepare()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [open, pdfDocument])

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

      <div className="relative min-h-0 flex-1 bg-slate-100">
        {loading && (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Opening invoice…
          </div>
        )}
        {!loading && error && (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
            Could not open preview. Use Download to save the PDF.
          </div>
        )}
        {!loading && !error && blobUrl && (
          <iframe
            src={blobUrl}
            title={fileName}
            className="absolute inset-0 h-full w-full border-0 bg-white"
          />
        )}
      </div>
    </div>,
    document.body,
  )
}
