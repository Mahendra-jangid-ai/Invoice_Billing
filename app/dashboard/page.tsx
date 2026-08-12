'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useBilling } from '@/lib/context'
import {
  Plus,
  ArrowRight,
  FileText,
  Users2,
  Package2,
  IndianRupee,
} from 'lucide-react'
import { SkeletonDashboard } from '@/components/ui/skeleton'
import { PageHero } from '@/components/page-hero'

const AppLayout = dynamic(
  () => import('@/app/app-layout').then((m) => ({ default: m.AppLayout })),
  { ssr: false, loading: () => null }
)

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  draft:     { label: 'Draft',     cls: 'badge badge-gray'  },
  finalized: { label: 'Finalized', cls: 'badge badge-blue'  },
  paid:      { label: 'Paid',      cls: 'badge badge-green' },
}

export default function DashboardPage() {
  const { invoices, customers, items, company, loading } = useBilling()

  if (loading) {
    return (
      <AppLayout>
        <SkeletonDashboard />
      </AppLayout>
    )
  }

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

  const paidCount  = invoices.filter((i) => i.status === 'paid').length
  const draftCount = invoices.filter((i) => i.status === 'draft').length

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const stats = [
    {
      label:  'Total Revenue',
      value:  `₹${totalSales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      sub:    'Finalized & paid invoices',
      icon:   IndianRupee,
      iconBg: 'bg-blue-50',
      iconFg: 'text-blue-600',
    },
    {
      label:  'Invoices',
      value:  invoices.length.toString(),
      sub:    `${paidCount} paid · ${draftCount} draft`,
      icon:   FileText,
      iconBg: 'bg-purple-50',
      iconFg: 'text-purple-600',
    },
    {
      label:  'Customers',
      value:  customers.length.toString(),
      sub:    'Total registered',
      icon:   Users2,
      iconBg: 'bg-emerald-50',
      iconFg: 'text-emerald-600',
    },
    {
      label:  'Catalog Items',
      value:  items.length.toString(),
      sub:    'Products & services',
      icon:   Package2,
      iconBg: 'bg-amber-50',
      iconFg: 'text-amber-600',
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-5 animate-fade-in">

        <PageHero
          label="Welcome back"
          title="Here's your overview"
          description="A quick snapshot of revenue, invoices, and what needs attention today."
          footer={
            <div className="flex flex-wrap gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-center min-w-[88px]">
                <p className="text-xs font-medium text-slate-500">Draft</p>
                <p className="mt-0.5 text-xl font-bold text-slate-800 tabular-nums">{draftCount}</p>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-center min-w-[88px]">
                <p className="text-xs font-medium text-emerald-600">Paid</p>
                <p className="mt-0.5 text-xl font-bold text-emerald-700 tabular-nums">{paidCount}</p>
              </div>
            </div>
          }
        />

        {/* ── Stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 stagger">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="stat-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="section-label">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900 tabular-nums truncate">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{stat.sub}</p>
                  </div>
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}>
                    <Icon className={`h-5 w-5 ${stat.iconFg}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Middle row: Quick actions + Business profile ── */}
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">

          {/* Quick actions */}
          <div className="premium-card p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
                <p className="text-xs text-gray-400 mt-0.5">Shortcuts to your most-used features</p>
              </div>
              <Link
                href="/invoices/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                New Invoice
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { href: '/invoices/new', icon: FileText,  label: 'Create Invoice', sub: 'New billing document', bg: 'bg-blue-50',   fg: 'text-blue-600'   },
                { href: '/customers',    icon: Users2,    label: 'Add Customer',   sub: 'Manage client base',  bg: 'bg-emerald-50', fg: 'text-emerald-600' },
                { href: '/items',        icon: Package2,  label: 'Add Item',       sub: 'Expand your catalog', bg: 'bg-amber-50',   fg: 'text-amber-600'  },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex flex-col items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-center transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${action.bg} transition group-hover:scale-105`}>
                      <Icon className={`h-4.5 w-4.5 ${action.fg} h-[18px] w-[18px]`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{action.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{action.sub}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Business profile */}
          <div className="premium-card p-5 flex flex-col">
            <div className="mb-3">
              <h2 className="text-sm font-bold text-gray-900">Business Profile</h2>
              <p className="text-xs text-gray-400 mt-0.5">Shown on your invoices</p>
            </div>
            <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                  {(company.name?.[0] || 'B').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{company.name || 'Your Company'}</p>
                  <p className="text-xs text-gray-400 truncate">{company.email || 'No email set'}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                {company.address && <p className="line-clamp-2">{company.address}</p>}
                {company.gstnumber && (
                  <p className="font-mono text-gray-700">GST: {company.gstnumber}</p>
                )}
                {!company.address && !company.gstnumber && (
                  <p className="italic text-gray-400">
                    No details.{' '}
                    <Link href="/company-settings" className="text-blue-500 not-italic hover:underline">
                      Set up →
                    </Link>
                  </p>
                )}
              </div>
            </div>
            <Link
              href="/company-settings"
              className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Edit profile <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Recent invoices ── */}
        <div className="premium-card overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Recent Invoices</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest billing activity</p>
            </div>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm">No invoices yet</p>
                <p className="mt-0.5 text-xs text-gray-400">Create your first invoice to get started.</p>
              </div>
              <Link
                href="/invoices/new"
                className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Create Invoice
              </Link>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-5 py-3 text-left">Invoice #</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Customer</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-left">Status</th>
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
                    const badge = STATUS_BADGE[invoice.status] ?? { label: invoice.status, cls: 'badge badge-gray' }

                    return (
                      <tr key={invoice.id}>
                        <td className="px-5 py-3">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {invoice.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          {invoice.date ? new Date(invoice.date).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900">
                          {customer?.name || 'Unknown'}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-gray-900 tabular-nums">
                          ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-3">
                          <span className={badge.cls}>{badge.label}</span>
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
