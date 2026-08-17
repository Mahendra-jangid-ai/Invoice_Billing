'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBilling, type Invoice } from '@/lib/context'
import { apiFetch } from '@/lib/api-client'
import {
  InvoicePreview,
  type InvoicePdfMobileActions,
} from '@/components/invoice-preview'
import { useCompactInvoiceView } from '@/lib/invoice-view-mode'
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
import { PageHero } from '@/components/page-hero'
import { useConfirm, useFeedback } from '@/components/confirm-provider'
import { cn } from '@/lib/utils'
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
  const compactView = useCompactInvoiceView()
  const { invoices, deleteInvoice, updateInvoice } = useBilling()
  const { confirm } = useConfirm()
  const { success, error: showError } = useFeedback()
  const [id, setId] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pdfActions, setPdfActions] = useState<InvoicePdfMobileActions | null>(null)
  const [pdfViewOpen, setPdfViewOpen] = useState(false)
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
        <div className="space-y-5 animate-fade-in">
          <PageHero
            title="Invoice not found"
            description="It may have been deleted or you may not have access."
            actions={
              <Link href="/invoices">
                <Button>Back to invoices</Button>
              </Link>
            }
          />
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

  const openPdfView = () => {
    if (pdfActions?.handleView) {
      pdfActions.handleView()
      return
    }
    setPdfViewOpen(true)
  }

  const statusBadge = STATUS_MAP[invoice.status] ?? { label: invoice.status, cls: 'badge badge-gray' }
  const pdfDownloadBusy = !pdfActions || pdfActions.loading || !pdfActions.ready

  return (
    <AppLayout>
      <div className={cn('animate-fade-in', compactView ? 'invoice-detail-mobile' : 'space-y-5 sm:space-y-6')}>
        {compactView && (
          <div className="no-print flex items-center gap-3">
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
        )}

        {!compactView && (
          <PageHero
            label="Billing"
            title={invoice.invoiceNumber}
            description="Invoice details and management"
            actions={
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                {invoice.status === 'draft' && (
                  <Link href={`/invoices/${invoice.id}/edit`} className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full gap-2 sm:w-auto">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 sm:w-auto"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            }
            footer={
              <div className="flex flex-wrap items-center gap-2">
                <span className={statusBadge.cls}>{statusBadge.label}</span>
                {invoice.status === 'draft' && (
                  <Button onClick={handleFinalize} disabled={saving} size="sm" className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {saving ? 'Finalizing…' : 'Mark as Finalized'}
                  </Button>
                )}
                {invoice.status === 'finalized' && (
                  <Button onClick={handleMarkPaid} disabled={saving} size="sm" className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {saving ? 'Recording payment…' : 'Mark as Paid'}
                  </Button>
                )}
              </div>
            }
          />
        )}

        <div className={cn(compactView && 'pt-2')}>
          <InvoicePreview
            invoice={invoice}
            mobileActions={compactView ? 'external' : 'panel'}
            viewOpen={pdfViewOpen}
            onViewOpenChange={setPdfViewOpen}
            onMobilePdfActions={compactView ? handlePdfActions : undefined}
          />
        </div>

        {compactView && (
          <div className="no-print invoice-detail-footer mobile-sticky-footer fixed inset-x-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur-md">
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 gap-2"
                  onClick={openPdfView}
                >
                  <Eye className="h-4 w-4" />
                  View Invoice
                </Button>
                <Button
                  type="button"
                  className="h-11 gap-2"
                  disabled={pdfDownloadBusy}
                  onClick={() => pdfActions?.handleDownload()}
                >
                  {pdfDownloadBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Download
                </Button>
              </div>

              <div className="flex gap-2">
                {invoice.status === 'draft' && (
                  <>
                    <Link href={`/invoices/${invoice.id}/edit`} className="min-w-0 flex-1">
                      <Button variant="outline" className="h-11 w-full gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button onClick={handleFinalize} disabled={saving} className="h-11 min-w-0 flex-[1.2] gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {saving ? 'Finalizing…' : 'Finalize'}
                    </Button>
                  </>
                )}
                {invoice.status === 'finalized' && (
                  <Button onClick={handleMarkPaid} disabled={saving} className="h-11 flex-1 gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {saving ? 'Updating…' : 'Mark Paid'}
                  </Button>
                )}
                {invoice.status === 'paid' && (
                  <p className="flex h-11 flex-1 items-center justify-center rounded-xl bg-emerald-50 text-sm font-medium text-emerald-700">
                    Payment received
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600"
                  aria-label="Delete invoice"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </AppLayout>
  )
}
