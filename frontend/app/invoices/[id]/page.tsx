'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBilling, type Invoice } from '@/lib/context'
import { apiFetch } from '@/lib/api-client'
import {
  InvoicePreview,
  type InvoicePdfMobileActions,
} from '@/components/invoice-preview'
import { Button } from '@/components/ui/button'
import {
  Edit,
  Trash2,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Download,
} from 'lucide-react'
import { AppLayout } from '@/app/app-layout'
import { useConfirm, useFeedback } from '@/components/confirm-provider'
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'badge badge-gray' },
  finalized: { label: 'Finalized', cls: 'badge badge-blue' },
  paid: { label: 'Paid', cls: 'badge badge-green' },
}

export default function InvoiceDetailPage({ params: paramsPromise }: PageProps) {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#111827]" />
          </div>
        </AppLayout>
      }
    >
      <InvoiceDetailContent params={paramsPromise} />
    </Suspense>
  )
}

function InvoiceDetailContent({ params: paramsPromise }: PageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { invoices, deleteInvoice, updateInvoice } = useBilling()
  const { confirm } = useConfirm()
  const { success, error: showError } = useFeedback()
  const [id, setId] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pdfActions, setPdfActions] = useState<InvoicePdfMobileActions | null>(null)
  const autoDownloadDone = useRef(false)

  const handlePdfActions = useCallback((actions: InvoicePdfMobileActions) => {
    setPdfActions(actions)
  }, [])

  useEffect(() => {
    paramsPromise.then((params) => setId(params.id))
  }, [paramsPromise])

  const contextInvoice = useMemo(
    () => (id ? invoices.find((inv) => String(inv.id) === String(id)) : undefined),
    [invoices, id],
  )

  useEffect(() => {
    if (!id) return

    let cancelled = false
    if (contextInvoice) {
      setInvoice(contextInvoice)
    } else {
      setInvoice(null)
    }

    setFetching(true)

    apiFetch<Invoice>(`/api/invoices/${id}`)
      .then((data) => {
        if (!cancelled) setInvoice(data)
      })
      .catch(() => {
        if (!cancelled && !contextInvoice) setInvoice(null)
      })
      .finally(() => {
        if (!cancelled) setFetching(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, contextInvoice])

  useEffect(() => {
    if (autoDownloadDone.current) return
    if (searchParams.get('pdf') !== 'download') return
    if (!pdfActions?.ready) return

    autoDownloadDone.current = true
    pdfActions.handleDownload()
  }, [searchParams, pdfActions])

  if (!id || (!invoice && fetching)) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#111827]" />
        </div>
      </AppLayout>
    )
  }

  if (!invoice) {
    return (
      <AppLayout>
        <div className="flex flex-col">
          <div className="border-b border-[#E5E7EB] bg-white px-4 py-5 sm:px-8 sm:py-6">
            <h1 className="text-xl font-bold text-[#111827] sm:text-3xl">Invoice Not Found</h1>
          </div>
          <div className="flex-1 p-4 sm:p-8">
            <Link href="/invoices">
              <Button>Back to Invoices</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  const handleDelete = () => {
    confirm({
      title: 'Delete invoice?',
      description: `Are you sure you want to delete ${invoice.invoiceNumber}? This action cannot be undone.`,
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm: async () => {
        await deleteInvoice(invoice.id)
        router.push('/invoices')
      },
    })
  }

  const handleFinalize = async () => {
    setSaving(true)
    try {
      await updateInvoice(invoice.id, { ...invoice, status: 'finalized' })
      setInvoice((prev) => (prev ? { ...prev, status: 'finalized' } : prev))
      success({ title: 'Invoice finalized', description: 'This invoice is now marked as finalized.' })
    } catch {
      showError({ title: 'Update failed', description: 'Could not finalize the invoice. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleMarkPaid = async () => {
    setSaving(true)
    try {
      await updateInvoice(invoice.id, { ...invoice, status: 'paid' })
      setInvoice((prev) => (prev ? { ...prev, status: 'paid' } : prev))
      success({ title: 'Payment recorded', description: 'This invoice is now marked as paid.' })
    } catch {
      showError({ title: 'Update failed', description: 'Could not mark the invoice as paid. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const statusBadge = STATUS_MAP[invoice.status] ?? { label: invoice.status, cls: 'badge badge-gray' }
  const pdfBusy = !pdfActions || pdfActions.loading

  return (
    <AppLayout>
      <div className="invoice-detail-mobile flex flex-col md:pb-0">
        <div className="no-print flex items-center gap-3 md:hidden">
          <Link
            href="/invoices"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm active:bg-slate-50"
            aria-label="Back to invoices"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Invoice</p>
            <h1 className="truncate text-base font-bold text-slate-900">{invoice.invoiceNumber}</h1>
          </div>
          <span className={`${statusBadge.cls} shrink-0`}>{statusBadge.label}</span>
        </div>

        <div className="no-print hidden md:block md:border-b md:border-[#E5E7EB] md:bg-white md:px-8 md:py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#111827]">{invoice.invoiceNumber}</h1>
              <p className="mt-1 text-[#4B5563]">Invoice details and management</p>
            </div>
            <div className="flex flex-wrap gap-2">
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
                className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-sm font-medium text-[#111827] hover:bg-[#F3F4F6]"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 pt-4 md:space-y-6 md:p-8 md:pt-6">
          <div className="no-print hidden gap-2 md:flex">
            {invoice.status === 'draft' && (
              <Button onClick={handleFinalize} disabled={saving} className="gap-2">
                Mark as Finalized
              </Button>
            )}
            {invoice.status === 'finalized' && (
              <Button onClick={handleMarkPaid} disabled={saving} className="gap-2">
                Mark as Paid
              </Button>
            )}
          </div>

          <InvoicePreview
            invoice={invoice}
            mobileActions="external"
            onMobilePdfActions={handlePdfActions}
          />
        </div>

        <div className="no-print mobile-sticky-footer fixed inset-x-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-md md:hidden">
          <div className="flex items-stretch gap-1">
            <button
              type="button"
              disabled={pdfBusy}
              onClick={() => pdfActions?.handleView()}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-slate-700 active:bg-slate-100 disabled:opacity-50"
            >
              {pdfBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              <span>View</span>
            </button>
            <button
              type="button"
              disabled={pdfBusy}
              onClick={() => pdfActions?.handleDownload()}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-slate-700 active:bg-slate-100 disabled:opacity-50"
            >
              {pdfBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span>Save</span>
            </button>
            {invoice.status === 'draft' && (
              <Link
                href={`/invoices/${invoice.id}/edit`}
                className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-slate-700 active:bg-slate-100"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
            )}
            {invoice.status === 'draft' && (
              <button
                type="button"
                onClick={handleFinalize}
                disabled={saving}
                className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-emerald-700 active:bg-emerald-50 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Finalize</span>
              </button>
            )}
            {invoice.status === 'finalized' && (
              <button
                type="button"
                onClick={handleMarkPaid}
                disabled={saving}
                className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-emerald-700 active:bg-emerald-50 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Paid</span>
              </button>
            )}
            {invoice.status === 'paid' && (
              <div className="flex min-w-0 flex-[2] flex-col items-center justify-center gap-0.5 rounded-lg bg-emerald-50 py-1.5 text-[10px] font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>Received</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-red-600 active:bg-red-50"
              aria-label="Delete invoice"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
