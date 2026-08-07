'use client'

import Link from 'next/link'
import { useBilling } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AppLayout } from '@/app/app-layout'

export default function DashboardPage() {
  const { invoices, customers, items, company } = useBilling()

  const totalSales = invoices
    .filter((inv) => inv.status !== 'draft')
    .reduce((sum, inv) => {
      const itemsList = inv.items || []
      const itemsTotal = itemsList.reduce((itemSum, lineItem) => {
        const catalogItem = items.find(
          (i) => String(i.id) === String(lineItem.itemId)
        )
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

  return (
    <AppLayout>
      <div className="flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-8 py-6 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Welcome back! Here&apos;s an overview of your business.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          {/* Company Info */}
          <div className="mb-8 rounded-lg border border-slate-200 bg-blue-50 p-6 dark:border-slate-800 dark:bg-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {company.name || 'Your Company'}
            </h2>
            {company.address && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {company.address}
              </p>
            )}
            {company.gstnumber && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                GST: {company.gstnumber}
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Sales
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                ₹{totalSales.toFixed(2)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Invoices
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {invoices.length}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Customers
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {customers.length}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Items
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {items.length}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-4">
              <Link href="/invoices/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </Button>
              </Link>
              <Link href="/customers">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Customer
                </Button>
              </Link>
              <Link href="/items">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Invoices */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent Invoices
              </h3>
              <Link href="/invoices" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                View All
              </Link>
            </div>

            {recentInvoices.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-slate-600 dark:text-slate-400">
                  No invoices yet. <Link href="/invoices/new" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">Create one</Link>
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="w-full">
                  <thead className="border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                        Invoice #
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((invoice) => {
                      const customer = customers.find(
                        (c) => String(c.id) === String(invoice.customerId)
                      )
                      const itemsList = invoice.items || []
                      const amount = itemsList.reduce((sum, lineItem) => {
                        const catalogItem = items.find(
                          (i) => String(i.id) === String(lineItem.itemId)
                        )
                        const rate = Number(lineItem.rate) || Number(catalogItem?.unitprice) || 0
                        const qty = Number(lineItem.quantity) || 0
                        return sum + qty * rate
                      }, 0)
                      const taxPercentage = Number(invoice.taxPercentage) || 0
                      const total = amount + (amount * taxPercentage) / 100

                      return (
                        <tr
                          key={invoice.id}
                          className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                        >
                          <td className="px-6 py-4">
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {invoice.invoiceNumber}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {invoice.date ? new Date(invoice.date).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                            {customer?.name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-slate-900 dark:text-slate-100">
                            ₹{total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                invoice.status === 'paid'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                  : invoice.status === 'finalized'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                              }`}
                            >
                              {invoice.status.charAt(0).toUpperCase() +
                                invoice.status.slice(1)}
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
      </div>
    </AppLayout>
  )
}
