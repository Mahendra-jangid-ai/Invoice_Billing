'use client'

import Link from 'next/link'
import { useBilling } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Plus, ArrowRight, FileText, Users2, Package2, BadgeDollarSign } from 'lucide-react'
import { AppLayout } from '@/app/app-layout'

export default function DashboardPage() {
  const { invoices, customers, items, company } = useBilling()

  const totalSales = invoices
    .filter((inv) => inv.status !== 'draft')
    .reduce((sum, inv) => {
      const itemsList = inv.items || []
      const itemsTotal = itemsList.reduce((itemSum, lineItem) => {
        const catalogItem = items.find((i) => String(i.id) === String(lineItem.itemId))
        const rate = Number(lineItem.rate) || Number(catalogItem?.unitprice) || 0
        const qty = Number(lineItem.quantity) || 0
        return itemSum + qty * rate
      }, 0)
      const taxPercentage = Number(inv.taxPercentage) || 0
      return sum + itemsTotal + (itemsTotal * taxPercentage) / 100
    }, 0)

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const stats = [
    { label: 'Total sales', value: `₹${totalSales.toFixed(2)}`, icon: BadgeDollarSign },
    { label: 'Invoices', value: invoices.length.toString(), icon: FileText },
    { label: 'Customers', value: customers.length.toString(), icon: Users2 },
    { label: 'Items', value: items.length.toString(), icon: Package2 },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-5 text-white shadow-[0_20px_70px_-25px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-blue-100">
                Welcome back • {company.name || 'Your Company'}
              </p>
              <h1 className="text-3xl font-semibold sm:text-4xl">Everything you need to run billing smoothly.</h1>
              <p className="mt-3 text-sm text-slate-200 sm:text-base">
                Review your latest invoices, customer activity, and catalog performance from a single, polished dashboard.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur">
              <p className="text-sm text-blue-100">Ready for today</p>
              <p className="text-xl font-semibold">{invoices.filter((invoice) => invoice.status === 'draft').length} draft invoices</p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="soft-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/70 dark:text-blue-300">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="soft-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick actions</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Jump into the most common tasks.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/invoices/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create invoice
                </Button>
              </Link>
              <Link href="/customers">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add customer
                </Button>
              </Link>
              <Link href="/items">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add item
                </Button>
              </Link>
            </div>
          </div>

          <div className="soft-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Business profile</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your details appear on invoices.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <h3 className="font-semibold text-slate-900 dark:text-white">{company.name || 'Your Company'}</h3>
              {company.address && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{company.address}</p>}
              {company.gstnumber && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">GST: {company.gstnumber}</p>}
            </div>
          </div>
        </div>

        <div className="soft-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent invoices</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Newest activity from your billing workflow.</p>
            </div>
            <Link href="/invoices" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="p-8 text-center text-slate-600 dark:text-slate-400">
              No invoices yet. <Link href="/invoices/new" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">Create one</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50/70 dark:bg-slate-900/70">
                      <tr>
                        <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Invoice #</th>
                        <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Date</th>
                        <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Customer</th>
                        <th className="px-5 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                        <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                      </tr>
                    </thead>
                <tbody>
                  {recentInvoices.map((invoice) => {
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
                        <td className="px-5 py-3">
                          <Link href={`/invoices/${invoice.id}`} className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                            {invoice.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {invoice.date ? new Date(invoice.date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-900 dark:text-slate-100">{customer?.name || 'Unknown'}</td>
                        <td className="px-5 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">₹{total.toFixed(2)}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : invoice.status === 'finalized' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
