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
        <div className="border-b border-[#E5E7EB] bg-white px-8 py-6">
          <h1 className="text-3xl font-bold text-[#111827]">
            Create Invoice
          </h1>
          <p className="mt-1 text-[#4B5563]">
            Create a new invoice for your customer
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          <div className="mx-auto max-w-4xl rounded-lg border border-[#E5E7EB] bg-white p-6">
            <InvoiceForm onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
