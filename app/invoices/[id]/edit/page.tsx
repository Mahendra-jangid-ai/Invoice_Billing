'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBilling, Invoice } from '@/lib/context'
import { InvoiceForm } from '@/components/invoice-form'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/app/app-layout'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

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

  if (invoice.status !== 'draft') {
    return (
      <AppLayout>
        <div className="flex flex-col">
          <div className="border-b border-slate-200 bg-white px-8 py-6 dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Cannot Edit Invoice
            </h1>
          </div>
          <div className="flex-1 p-8">
            <p className="mb-4 text-slate-600 dark:text-slate-400">
              Only draft invoices can be edited.
            </p>
            <Link href={`/invoices/${invoice.id}`}>
              <Button>Back to Invoice</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  const handleSubmit = (updatedInvoice: Invoice) => {
    updateInvoice(invoice.id, updatedInvoice)
    router.push(`/invoices/${invoice.id}`)
  }

  return (
    <AppLayout>
      <div className="flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-8 py-6 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Edit Invoice
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Update the invoice details
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <InvoiceForm onSubmit={handleSubmit} initialInvoice={invoice} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
