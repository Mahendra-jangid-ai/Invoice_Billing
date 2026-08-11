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
        <section className="rounded-[32px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_22px_90px_-40px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Welcome back</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">Dashboard overview</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                Track invoices, customers, and catalog stats from a clean dashboard built for your business.
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-100">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Draft invoices</p>
              <p className="mt-2 text-3xl font-semibold">{invoices.filter((invoice) => invoice.status === 'draft').length}</p>
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
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="soft-card p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick actions</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Go directly to the actions you use most.</p>
              </div>
              <Link href="/invoices/new" className="text-sm font-medium text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300">
                New invoice
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link href="/invoices/new" className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900">
                <Plus className="mx-auto mb-2 h-4 w-4" />
                Create invoice
              </Link>
              <Link href="/customers" className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900">
                <Plus className="mx-auto mb-2 h-4 w-4" />
                Add customer
              </Link>
              <Link href="/items" className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900">
                <Plus className="mx-auto mb-2 h-4 w-4" />
                Add item
              </Link>
            </div>
          </div>

          <div className="soft-card p-5">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Business profile</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your company details on invoices.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">{company.name || 'Your Company'}</h3>
              {company.address ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{company.address}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">No address set yet.</p>
              )}
              {company.gstnumber ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">GST: {company.gstnumber}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">GST number not configured.</p>
              )}
            </div>
          </div>
        </div>

        <div className="soft-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent invoices</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Newest activity from your billing workflow.</p>
            </div>
            <Link href="/invoices" className="inline-flex items-center gap-1 text-sm font-medium text-slate-900 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-100">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="p-8 text-center text-slate-600 dark:text-slate-400">
              No invoices yet. <Link href="/invoices/new" className="font-medium text-slate-950 hover:text-slate-700 dark:text-slate-100">Create one</Link>
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
                          <Link href={`/invoices/${invoice.id}`} className="font-medium text-slate-900 hover:text-slate-700 dark:text-slate-100">
                            {invoice.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {invoice.date ? new Date(invoice.date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-900 dark:text-slate-100">{customer?.name || 'Unknown'}</td>
                        <td className="px-5 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">₹{total.toFixed(2)}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100">
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
