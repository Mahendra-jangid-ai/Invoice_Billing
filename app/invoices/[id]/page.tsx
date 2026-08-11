'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBilling } from '@/lib/context'
import { InvoicePreview } from '@/components/invoice-preview'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Loader2 } from 'lucide-react'
import { AppLayout } from '@/app/app-layout'
import { useEffect, useState, useRef } from 'react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function InvoiceDetailPage({ params: paramsPromise }: PageProps) {
  const router = useRouter()
  const { invoices, loading, deleteInvoice, updateInvoice } = useBilling()
  const [id, setId] = useState<string | null>(null)
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    paramsPromise.then((params) => {
      setId(params.id)
    })
  }, [paramsPromise])

  if (!id || loading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#111827]" />
        </div>
      </AppLayout>
    )
  }

  const invoice = invoices.find((inv) => String(inv.id) === String(id))

  if (!invoice) {
    return (
      <AppLayout>
        <div className="flex flex-col">
          <div className="border-b border-[#E5E7EB] bg-white px-8 py-6">
            <h1 className="text-3xl font-bold text-[#111827]">
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

  return (
    <AppLayout>
      <div className="flex flex-col">
        {/* Header - Hidden during print */}
        <div className="no-print border-b border-[#E5E7EB] bg-white px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#111827]">
                {invoice.invoiceNumber}
              </h1>
              <p className="mt-1 text-[#4B5563]">
                Invoice details and management
              </p>
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

        {/* Content */}
        <div className="flex-1 space-y-6 p-8">
          {/* Status Actions - Hidden during print */}
          <div className="no-print flex gap-2">
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

          {/* Invoice Preview - Printable */}
          <div ref={invoiceRef}>
            <InvoicePreview invoice={invoice} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
