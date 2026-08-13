'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBilling } from '@/lib/context'
import { InvoicePreview } from '@/components/invoice-preview'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { AppLayout } from '@/app/app-layout'
import { useEffect, useMemo, useState } from 'react'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'badge badge-gray' },
  finalized: { label: 'Finalized', cls: 'badge badge-blue' },
  paid: { label: 'Paid', cls: 'badge badge-green' },
}

export default function InvoiceDetailPage({ params: paramsPromise }: PageProps) {
  const router = useRouter()
  const { invoices, loading, deleteInvoice, updateInvoice } = useBilling()
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    paramsPromise.then((params) => {
      setId(params.id)
    })
  }, [paramsPromise])

  const invoice = useMemo(
    () => invoices.find((inv) => String(inv.id) === String(id)),
    [invoices, id],
  )

  if (!id || loading) {
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
            <h1 className="text-xl font-bold text-[#111827] sm:text-3xl">
              Invoice Not Found
            </h1>
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
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(invoice.id)
      router.push('/invoices')
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

  const statusBadge = STATUS_MAP[invoice.status] ?? { label: invoice.status, cls: 'badge badge-gray' }

  return (
    <AppLayout>
      <div className="flex flex-col pb-28 md:pb-0">
        {/* Mobile header */}
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

        {/* Desktop header */}
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
          {/* Status Actions - desktop only */}
          <div className="no-print hidden gap-2 md:flex">
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

          <div>
            <InvoicePreview invoice={invoice} />
          </div>
        </div>

        {/* Mobile sticky actions */}
        <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-2">
            {invoice.status === 'draft' && (
              <>
                <Link href={`/invoices/${invoice.id}/edit`} className="flex-1">
                  <Button variant="outline" className="h-11 w-full gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button onClick={handleFinalize} className="h-11 flex-[1.4] gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Finalize
                </Button>
              </>
            )}
            {invoice.status === 'finalized' && (
              <Button onClick={handleMarkPaid} className="h-11 flex-1 gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Mark Paid
              </Button>
            )}
            {invoice.status === 'paid' && (
              <p className="flex h-11 flex-1 items-center justify-center rounded-xl bg-emerald-50 text-sm font-medium text-emerald-700">
                Payment received
              </p>
            )}
            <button
              onClick={handleDelete}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600"
              aria-label="Delete invoice"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
