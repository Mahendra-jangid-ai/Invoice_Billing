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
        <section className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.3)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">Invoices</p>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Manage every invoice in one place</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Create, preview, and organize invoices with a cleaner workflow.</p>
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
          <div className="soft-card p-8 text-center text-slate-600 dark:text-slate-400">
            No invoices yet.{' '}
            <Link href="/invoices/new" className="font-medium text-slate-950 hover:text-slate-700 dark:text-slate-100">
              Create one
            </Link>
          </div>
        ) : (
          <div className="soft-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-5 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Invoice list</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Recent invoices are sorted by date.</p>
              </div>
              <div className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Latest <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50/70 dark:bg-slate-900/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Invoice #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Customer</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
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
                      <tr key={invoice.id} className="border-b border-slate-200/80 last:border-b-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-900/60">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{invoice.invoiceNumber}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{invoice.date ? new Date(invoice.date).toLocaleDateString() : '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{customer?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">₹{total.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/invoices/${invoice.id}`} className="inline-flex items-center rounded-lg px-2 py-1 text-slate-950 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800">
                              <Eye className="h-4 w-4" />
                            </Link>
                            {invoice.status === 'draft' && (
                              <Link href={`/invoices/${invoice.id}/edit`} className="inline-flex items-center rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                                <Edit className="h-4 w-4" />
                              </Link>
                            )}
                            <button onClick={() => deleteInvoice(invoice.id)} className="inline-flex items-center rounded-lg px-2 py-1 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
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
