'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { pdf, type DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import { Loader2, X } from 'lucide-react'

type PdfJsModule = typeof import('pdfjs-dist')

let pdfJsPromise: Promise<PdfJsModule> | null = null

function loadPdfJs(): Promise<PdfJsModule> {
  if (!pdfJsPromise) {
    pdfJsPromise = import('pdfjs-dist').then((pdfjs) => {
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
      }
      return pdfjs
    })
  }
  return pdfJsPromise
}

function PdfCanvasPages({ blob }: { blob: Blob }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
  const [rendering, setRendering] = useState(true)

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    if (!container) return

    const render = async () => {
      setRendering(true)
      setError(false)
      container.innerHTML = ''

      try {
        const pdfjs = await loadPdfJs()
        const data = await blob.arrayBuffer()
        const doc = await pdfjs.getDocument({ data }).promise
        if (cancelled) return

        const containerWidth = Math.max(container.clientWidth - 8, 280)
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

        for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
          if (cancelled) return

          const page = await doc.getPage(pageNum)
          const baseViewport = page.getViewport({ scale: 1 })
          const scale = containerWidth / baseViewport.width
          const viewport = page.getViewport({ scale: scale * pixelRatio })

          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          if (!context) continue

          canvas.width = viewport.width
          canvas.height = viewport.height
          canvas.style.width = `${viewport.width / pixelRatio}px`
          canvas.style.height = `${viewport.height / pixelRatio}px`
          canvas.className = 'mx-auto mb-3 block max-w-full bg-white shadow-sm'

          await page.render({ canvasContext: context, viewport, canvas }).promise
          if (cancelled) return

          container.appendChild(canvas)
        }

        if (!cancelled) setRendering(false)
      } catch {
        if (!cancelled) {
          setRendering(false)
          setError(true)
        }
      }
    }

    void render()

    return () => {
      cancelled = true
    }
  }, [blob])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
        Could not display PDF preview. Use Download to save the invoice.
      </div>
    )
  }

  return (
    <div className="relative min-h-full">
      {rendering && (
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-slate-100 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Rendering PDF…
        </div>
      )}
      <div ref={containerRef} className="p-2 pb-4" />
    </div>
  )
}

export function MobilePdfViewer({
  pdfDocument,
  pdfBlob,
  fileName,
  open,
  onClose,
}: {
  pdfDocument: ReactElement<DocumentProps>
  pdfBlob?: Blob | null
  fileName: string
  open: boolean
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [blob, setBlob] = useState<Blob | null>(null)
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
      setBlob(null)
      setLoading(false)
      setError(false)
      return
    }

    if (pdfBlob) {
      setBlob(pdfBlob)
      setLoading(false)
      setError(false)
      return
    }

    let cancelled = false

    const prepare = async () => {
      setLoading(true)
      setError(false)
      try {
        const generated = await pdf(pdfDocument).toBlob()
        if (cancelled) return
        setBlob(generated)
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
    }
  }, [open, pdfDocument, pdfBlob])

  if (!open || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-white"
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

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-100">
        {loading && (
          <div className="flex h-full min-h-[50vh] items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Opening invoice…
          </div>
        )}
        {!loading && error && (
          <div className="flex h-full min-h-[50vh] items-center justify-center px-6 text-center text-sm text-slate-500">
            Could not open preview. Use Download to save the PDF.
          </div>
        )}
        {!loading && !error && blob && <PdfCanvasPages blob={blob} />}
      </div>
    </div>,
    document.body,
  )
}
