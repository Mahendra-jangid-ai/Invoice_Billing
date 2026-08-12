'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBilling, Invoice } from '@/lib/context'
import { InvoiceForm } from '@/components/invoice-form'
import { AppLayout } from '@/app/app-layout'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

export default function NewInvoicePage() {
  const router = useRouter()
  const { addInvoice, invoices } = useBilling()

  const handleSubmit = async (invoice: Invoice) => {
    try {
      await addInvoice(invoice)
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
                Create Invoice
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Fill in the details below to generate a new GST invoice.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/80 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                <FileText className="h-3.5 w-3.5 text-indigo-500" />
                {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total
              </div>
            </div>
            <Link href="/invoices">
              <Button variant="outline">Back to Invoices</Button>
            </Link>
          </div>
        </div>

        <InvoiceForm onSubmit={handleSubmit} />
      </div>
    </AppLayout>
  )
}
