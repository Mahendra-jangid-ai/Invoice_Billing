'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X } from 'lucide-react'

/** Minimum PDF scale so invoice text stays readable on narrow phones. */
const MIN_DISPLAY_SCALE = 0.92

function getOutputScale(): number {
  return Math.min(window.devicePixelRatio || 1, 3)
}

async function renderPageToCanvas(
  page: import('pdfjs-dist').PDFPageProxy,
  containerWidth: number,
): Promise<HTMLCanvasElement> {
  const dpr = getOutputScale()
  const baseViewport = page.getViewport({ scale: 1 })
  const fitScale = containerWidth / baseViewport.width
  const displayScale = Math.max(fitScale, MIN_DISPLAY_SCALE)
  const renderScale = displayScale * dpr
  const viewport = page.getViewport({ scale: renderScale })

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) throw new Error('Canvas not supported')

  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  canvas.style.width = `${Math.floor(viewport.width / dpr)}px`
  canvas.style.height = `${Math.floor(viewport.height / dpr)}px`
  canvas.className = 'mx-auto block max-w-none bg-white'

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)

  await page.render({ canvas, canvasContext: context, viewport }).promise

  return canvas
}

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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
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
      setLoading(false)
      setError(false)
      return
    }

    if (!blob && !url) return

    let cancelled = false
    let resizeObserver: ResizeObserver | null = null

    const renderPdf = async () => {
      const container = scrollRef.current
      if (!container) return

      setLoading(true)
      setError(false)
      container.innerHTML = ''

      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

        let data: ArrayBuffer
        if (blob) {
          data = await blob.arrayBuffer()
        } else {
          const response = await fetch(url!)
          data = await response.arrayBuffer()
        }

        if (cancelled) return

        const doc = await pdfjs.getDocument({ data }).promise

        const paint = async () => {
          if (cancelled) return

          const containerWidth = container.clientWidth || window.innerWidth - 16
          container.innerHTML = ''

          for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
            if (cancelled) return

            const page = await doc.getPage(pageNum)
            const canvas = await renderPageToCanvas(page, containerWidth)

            if (cancelled) return

            const wrap = document.createElement('div')
            wrap.className = pageNum < doc.numPages ? 'mb-2 flex justify-center' : 'flex justify-center'
            wrap.appendChild(canvas)
            container.appendChild(wrap)
          }

          if (!cancelled) setLoading(false)
        }

        await paint()

        if (cancelled || typeof ResizeObserver === 'undefined') return

        let resizeTimer: ReturnType<typeof setTimeout> | null = null
        resizeObserver = new ResizeObserver(() => {
          if (resizeTimer) clearTimeout(resizeTimer)
          resizeTimer = setTimeout(() => {
            if (!cancelled) void paint()
          }, 200)
        })
        resizeObserver.observe(container)
      } catch {
        if (!cancelled) {
          setLoading(false)
          setError(true)
        }
      }
    }

    const frame = requestAnimationFrame(() => {
      void renderPdf()
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
    }
  }, [open, blob, url])

  if (!open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{fileName}</p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 active:bg-slate-200"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-auto overscroll-contain bg-slate-100 px-2 py-2 [-webkit-overflow-scrolling:touch]"
      >
        {loading && (
          <div className="flex h-40 items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        )}
        {error && (
          <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-slate-500">
            Could not display PDF. Try Download instead.
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
