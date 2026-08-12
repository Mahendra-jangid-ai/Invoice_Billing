'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBilling, Invoice } from '@/lib/context'
import { InvoiceForm } from '@/components/invoice-form'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/app/app-layout'
import { useEffect, useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditInvoicePage({ params: paramsPromise }: PageProps) {
  const router = useRouter()
  const { invoices, loading, updateInvoice } = useBilling()
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    paramsPromise.then((params) => {
      setId(params.id)
    })
  }, [paramsPromise])

  if (!id || loading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </AppLayout>
    )
  }

  const invoice = invoices.find((inv) => String(inv.id) === String(id))

  if (!invoice) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="hero-card px-8 py-7">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">
              Invoice Not Found
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              This invoice may have been deleted or you don&apos;t have access.
            </p>
          </div>
          <Link href="/invoices">
            <Button>Back to Invoices</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  if (invoice.status !== 'draft') {
    return (
      <AppLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="hero-card px-8 py-7">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">
              Cannot Edit Invoice
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Only draft invoices can be edited.
            </p>
          </div>
          <Link href={`/invoices/${invoice.id}`}>
            <Button>Back to Invoice</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  const handleSubmit = async (updatedInvoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, updatedInvoice)
      router.push(`/invoices/${invoice.id}`)
    } catch {
      // Error shown via billing context banner
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="hero-card px-8 py-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="section-label">Billing</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">
                Edit Invoice
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Update invoice {invoice.invoiceNumber} — changes apply to draft only.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/80 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                <FileText className="h-3.5 w-3.5 text-indigo-500" />
                {invoice.invoiceNumber}
              </div>
            </div>
            <Link href={`/invoices/${invoice.id}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>

        <InvoiceForm onSubmit={handleSubmit} initialInvoice={invoice} />
      </div>
    </AppLayout>
  )
}
