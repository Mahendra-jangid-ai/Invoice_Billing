'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBilling, Invoice } from '@/lib/context'
import { InvoiceForm } from '@/components/invoice-form'
import { AppLayout } from '@/app/app-layout'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/page-hero'
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
      <div className="space-y-5 sm:space-y-6 animate-fade-in">
        <PageHero
          label="Billing"
          title="Create Invoice"
          description="Fill in the details below. You can save as draft and edit later if needed."
          actions={
            <Link href="/invoices" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Back to list
              </Button>
            </Link>
          }
          footer={
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
              {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total
            </div>
          }
        />

        <InvoiceForm onSubmit={handleSubmit} />
      </div>
    </AppLayout>
  )
}
