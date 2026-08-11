'use client'

import Link from 'next/link'
import { useBilling } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Plus, Eye, Edit, Trash2, ArrowRight } from 'lucide-react'
import { AppLayout } from '@/app/app-layout'

export default function InvoicesPage() {
  const { invoices, customers, items, deleteInvoice } = useBilling()

  const sortedInvoices = [...invoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="rounded-[30px] border border-[#E5E7EB] bg-white/90 p-6 shadow-[0_20px_70px_-30px_rgba(17,24,39,0.12)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Invoices</p>
              <h1 className="text-2xl font-semibold text-[#111827]">Manage every invoice in one place</h1>
              <p className="mt-2 text-sm text-[#4B5563]">Create, preview, and organize invoices with a cleaner workflow.</p>
            </div>
            <Link href="/invoices/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create invoice
              </Button>
            </Link>
          </div>
        </section>

        {sortedInvoices.length === 0 ? (
          <div className="soft-card p-8 text-center text-[#4B5563]">
            No invoices yet.{' '}
            <Link href="/invoices/new" className="font-medium text-[#2563EB] hover:text-[#1D4ED8]">
              Create one
            </Link>
          </div>
        ) : (
          <div className="soft-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">Invoice list</h2>
                <p className="text-sm text-[#6B7280]">Recent invoices are sorted by date.</p>
              </div>
              <div className="inline-flex items-center gap-1 text-sm font-medium text-[#6B7280]">
                Latest <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E5E7EB]">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#111827]">Invoice #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#111827]">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#111827]">Customer</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-[#111827]">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#111827]">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-[#111827]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedInvoices.map((invoice) => {
                    const customer = customers.find((c) => String(c.id) === String(invoice.customerId))
                    const itemsList = invoice.items || []
                    const amount = itemsList.reduce((sum, lineItem) => {
                      const catalogItem = items.find((i) => String(i.id) === String(lineItem.itemId))
                      const rate = Number(lineItem.rate) || Number(catalogItem?.unitprice) || 0
                      const qty = Number(lineItem.quantity) || 0
                      return sum + qty * rate
                    }, 0)
                    const taxPercentage = Number(invoice.taxPercentage) || 0
                    const total = amount + (amount * taxPercentage) / 100

                    return (
                      <tr key={invoice.id} className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB]">
                        <td className="px-6 py-4 font-medium text-[#111827]">{invoice.invoiceNumber}</td>
                        <td className="px-6 py-4 text-sm text-[#4B5563]">{invoice.date ? new Date(invoice.date).toLocaleDateString() : '-'}</td>
                        <td className="px-6 py-4 text-sm text-[#111827]">{customer?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-[#111827]">₹{total.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#111827]">
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/invoices/${invoice.id}`} className="inline-flex items-center rounded-lg px-2 py-1 text-[#111827] hover:bg-[#F9FAFB]">
                              <Eye className="h-4 w-4" />
                            </Link>
                            {invoice.status === 'draft' && (
                              <Link href={`/invoices/${invoice.id}/edit`} className="inline-flex items-center rounded-lg px-2 py-1 text-[#6B7280] hover:bg-[#F9FAFB]">
                                <Edit className="h-4 w-4" />
                              </Link>
                            )}
                            <button onClick={() => deleteInvoice(invoice.id)} className="inline-flex items-center rounded-lg px-2 py-1 text-[#374151] hover:bg-[#F9FAFB]">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
