'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBilling, Invoice } from '@/lib/context'
import { apiFetch } from '@/lib/api-client'
import { InvoiceForm } from '@/components/invoice-form'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/app/app-layout'
import { useEffect, useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { PageHero } from '@/components/page-hero'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditInvoicePage({ params: paramsPromise }: PageProps) {
  const router = useRouter()
  const { invoices, loading, updateInvoice } = useBilling()
  const [id, setId] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    paramsPromise.then((params) => {
      setId(params.id)
    })
  }, [paramsPromise])

  useEffect(() => {
    if (!id) return

    const contextInvoice = invoices.find((inv) => String(inv.id) === String(id))
    if (contextInvoice) {
      setInvoice(contextInvoice)
      return
    }

    let cancelled = false
    setFetching(true)

    apiFetch<Invoice>(`/api/invoices/${id}`)
      .then((data) => {
        if (!cancelled) setInvoice(data)
      })
      .catch(() => {
        if (!cancelled) setInvoice(null)
      })
      .finally(() => {
        if (!cancelled) setFetching(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, invoices])

  if (!id || loading || fetching) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
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
              <Link href="/invoices" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">Back to invoices</Button>
              </Link>
            }
          />
        </div>
      </AppLayout>
    )
  }

  if (invoice.status !== 'draft') {
    return (
      <AppLayout>
        <div className="space-y-5 animate-fade-in">
          <PageHero
            title="Can't edit this invoice"
            description="Only draft invoices can be changed. Finalized or paid invoices are locked."
            actions={
              <Link href={`/invoices/${invoice.id}`} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">View invoice</Button>
              </Link>
            }
          />
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
      <div className="space-y-5 sm:space-y-6 animate-fade-in">
        <PageHero
          label="Billing"
          title="Edit invoice"
          description={`Updating ${invoice.invoiceNumber} — changes apply while status is draft.`}
          actions={
            <Link href={`/invoices/${invoice.id}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
          }
          footer={
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
              {invoice.invoiceNumber}
            </div>
          }
        />

        <InvoiceForm onSubmit={handleSubmit} initialInvoice={invoice} />
      </div>
    </AppLayout>
  )
}
