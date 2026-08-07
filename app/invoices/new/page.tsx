'use client'

import { useRouter } from 'next/navigation'
import { useBilling, Invoice } from '@/lib/context'
import { InvoiceForm } from '@/components/invoice-form'
import { AppLayout } from '@/app/app-layout'

export default function NewInvoicePage() {
  const router = useRouter()
  const { addInvoice } = useBilling()

  const handleSubmit = (invoice: Invoice) => {
    addInvoice(invoice)
    router.push(`/invoices/${invoice.id}`)
  }

  return (
    <AppLayout>
      <div className="flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-8 py-6 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Create Invoice
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Create a new invoice for your customer
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <InvoiceForm onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
