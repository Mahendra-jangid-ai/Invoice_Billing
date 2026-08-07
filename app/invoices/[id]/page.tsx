'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBilling } from '@/lib/context'
import { InvoicePreview } from '@/components/invoice-preview'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Printer, Download, Loader2 } from 'lucide-react'
import { AppLayout } from '@/app/app-layout'
import { useEffect, useState, useRef } from 'react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function InvoiceDetailPage({ params: paramsPromise }: PageProps) {
  const router = useRouter()
  const { invoices, loading, deleteInvoice, updateInvoice } = useBilling()
  const [id, setId] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    paramsPromise.then((params) => {
      setId(params.id)
    })
  }, [paramsPromise])

  if (!id || loading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    )
  }

  const invoice = invoices.find((inv) => String(inv.id) === String(id))

  if (!invoice) {
    return (
      <AppLayout>
        <div className="flex flex-col">
          <div className="border-b border-slate-200 bg-white px-8 py-6 dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Invoice Not Found
            </h1>
          </div>
          <div className="flex-1 p-8">
            <Link href="/invoices">
              <Button>Back to Invoices</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(invoice.id)
      router.push('/invoices')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || downloading) return

    setDownloading(true)
    try {
      const html2pdfModule = await import('html2pdf.js')
      const html2pdf = html2pdfModule.default || html2pdfModule

      const element = invoiceRef.current
      const opt = {
        margin: 10,
        filename: `${invoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          onclone: (clonedDoc: Document) => {
            // Standardize any computed colors containing lab/oklch using Canvas 2D
            const canvas = document.createElement('canvas')
            canvas.width = 1
            canvas.height = 1
            const ctx = canvas.getContext('2d')

            const sanitizeColorStr = (colorStr: string, fallback: string): string => {
              if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') {
                return 'transparent'
              }
              if (
                colorStr.includes('lab') ||
                colorStr.includes('oklch') ||
                colorStr.includes('color(')
              ) {
                if (ctx) {
                  try {
                    ctx.fillStyle = '#000000'
                    ctx.fillStyle = colorStr
                    const res = ctx.fillStyle
                    if (res && !res.includes('lab') && !res.includes('oklch')) {
                      return res
                    }
                  } catch {
                    // Fallback below
                  }
                }
                return fallback
              }
              return colorStr
            }

            const allNodes = clonedDoc.querySelectorAll<HTMLElement>('*')
            allNodes.forEach((node) => {
              const comp = window.getComputedStyle(node)
              if (comp.color) {
                node.style.color = sanitizeColorStr(comp.color, '#0f172a')
              }
              if (comp.backgroundColor) {
                node.style.backgroundColor = sanitizeColorStr(
                  comp.backgroundColor,
                  '#ffffff'
                )
              }
              if (comp.borderColor) {
                node.style.borderColor = sanitizeColorStr(
                  comp.borderColor,
                  '#e2e8f0'
                )
              }
              if (
                comp.boxShadow &&
                (comp.boxShadow.includes('lab') || comp.boxShadow.includes('oklch'))
              ) {
                node.style.boxShadow = 'none'
              }
            })
          },
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      }

      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error('Error generating PDF:', error)
      window.print()
    } finally {
      setDownloading(false)
    }
  }

  const handleFinalize = () => {
    updateInvoice(invoice.id, {
      ...invoice,
      status: 'finalized',
    })
  }

  const handleMarkPaid = () => {
    updateInvoice(invoice.id, {
      ...invoice,
      status: 'paid',
    })
  }

  return (
    <AppLayout>
      <div className="flex flex-col">
        {/* Header - Hidden during print */}
        <div className="no-print border-b border-slate-200 bg-white px-8 py-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {invoice.invoiceNumber}
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Invoice details and management
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="gap-2"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {downloading ? 'Downloading...' : 'Download PDF'}
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              {invoice.status === 'draft' && (
                <Link href={`/invoices/${invoice.id}/edit`}>
                  <Button variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
              )}
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 p-8">
          {/* Status Actions - Hidden during print */}
          <div className="no-print flex gap-2">
            {invoice.status === 'draft' && (
              <Button onClick={handleFinalize} className="gap-2">
                Mark as Finalized
              </Button>
            )}
            {invoice.status === 'finalized' && (
              <Button onClick={handleMarkPaid} className="gap-2">
                Mark as Paid
              </Button>
            )}
          </div>

          {/* Invoice Preview - Printable */}
          <div ref={invoiceRef}>
            <InvoicePreview invoice={invoice} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
