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
        <section className="rounded-[32px] border border-[#E5E7EB] bg-white/95 p-6 shadow-[0_22px_90px_-40px_rgba(17,24,39,0.15)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6B7280]">Welcome back</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#111827] sm:text-4xl">Dashboard overview</h2>
              <p className="mt-2 max-w-2xl text-sm text-[#4B5563] sm:text-base">
                Track invoices, customers, and catalog stats from a clean dashboard built for your business.
              </p>
            </div>
            <div className="rounded-[28px] border border-[#E5E7EB] bg-[#F9FAFB] px-5 py-4 text-[#111827] shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-[#6B7280]">Draft invoices</p>
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
                    <p className="text-sm font-medium text-[#6B7280]">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-[#111827]">{stat.value}</p>
                  </div>
                  <div className="rounded-2xl bg-[#EFF6FF] p-3 text-[#111827]">
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
                <h2 className="text-lg font-semibold text-[#111827]">Quick actions</h2>
                <p className="text-sm text-[#6B7280]">Go directly to the actions you use most.</p>
              </div>
              <Link href="/invoices/new" className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]">
                New invoice
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link href="/invoices/new" className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-center text-sm font-semibold text-[#111827] transition hover:border-[#2563EB] hover:bg-[#F9FAFB]">
                <Plus className="mx-auto mb-2 h-4 w-4" />
                Create invoice
              </Link>
              <Link href="/customers" className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-center text-sm font-semibold text-[#111827] transition hover:border-[#2563EB] hover:bg-[#F9FAFB]">
                <Plus className="mx-auto mb-2 h-4 w-4" />
                Add customer
              </Link>
              <Link href="/items" className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-center text-sm font-semibold text-[#111827] transition hover:border-[#2563EB] hover:bg-[#F9FAFB]">
                <Plus className="mx-auto mb-2 h-4 w-4" />
                Add item
              </Link>
            </div>
          </div>

          <div className="soft-card p-5">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-[#111827]">Business profile</h2>
              <p className="text-sm text-[#6B7280]">Your company details on invoices.</p>
            </div>
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
              <h3 className="text-base font-semibold text-[#111827]">{company.name || 'Your Company'}</h3>
              {company.address ? (
                <p className="mt-2 text-sm text-[#4B5563]">{company.address}</p>
              ) : (
                <p className="mt-2 text-sm text-[#6B7280]">No address set yet.</p>
              )}
              {company.gstnumber ? (
                <p className="mt-2 text-sm text-[#4B5563]">GST: {company.gstnumber}</p>
              ) : (
                <p className="mt-2 text-sm text-[#6B7280]">GST number not configured.</p>
              )}
            </div>
          </div>
        </div>

        <div className="soft-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Recent invoices</h2>
              <p className="text-sm text-[#6B7280]">Newest activity from your billing workflow.</p>
            </div>
            <Link href="/invoices" className="inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="p-8 text-center text-[#4B5563]">
              No invoices yet. <Link href="/invoices/new" className="font-medium text-[#2563EB] hover:text-[#1D4ED8]">Create one</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E5E7EB]">
                <thead className="bg-[#F9FAFB]">
                      <tr>
                        <th className="px-5 py-3 text-left text-sm font-semibold text-[#111827]">Invoice #</th>
                        <th className="px-5 py-3 text-left text-sm font-semibold text-[#111827]">Date</th>
                        <th className="px-5 py-3 text-left text-sm font-semibold text-[#111827]">Customer</th>
                        <th className="px-5 py-3 text-right text-sm font-semibold text-[#111827]">Amount</th>
                        <th className="px-5 py-3 text-left text-sm font-semibold text-[#111827]">Status</th>
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
                      <tr key={invoice.id} className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB]">
                        <td className="px-5 py-3">
                          <Link href={`/invoices/${invoice.id}`} className="font-medium text-[#111827] hover:text-[#2563EB]">
                            {invoice.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-sm text-[#4B5563]">
                          {invoice.date ? new Date(invoice.date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-5 py-3 text-sm text-[#111827]">{customer?.name || 'Unknown'}</td>
                        <td className="px-5 py-3 text-right text-sm font-semibold text-[#111827]">₹{total.toFixed(2)}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#111827]">
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
