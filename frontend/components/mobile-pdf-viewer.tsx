'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export function MobilePdfViewer({
  url,
  blob,
  fileName,
  open,
  onClose,
}: {
  url?: string | null
  blob?: Blob | null
  fileName: string
  open: boolean
  onClose: () => void
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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

  useEffect(() => {
    if (!open) {
      setPreviewUrl(null)
      return
    }

    if (!blob && !url) {
      setPreviewUrl(null)
      return
    }

    let objectUrl: string | null = null
    let cancelled = false

    if (blob) {
      const reader = new FileReader()
      reader.onload = () => {
        if (!cancelled) setPreviewUrl(reader.result as string)
      }
      reader.onerror = () => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setPreviewUrl(objectUrl)
      }
      reader.readAsDataURL(blob)
    } else if (url) {
      setPreviewUrl(url)
    }

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [open, blob, url])

  if (!open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
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
        {previewUrl ? (
          <iframe
            src={previewUrl}
            title={fileName}
            className="h-full w-full border-0 bg-white"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Preparing preview…
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
