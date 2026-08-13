'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useBilling } from '@/lib/context'
import { useIsInstalledPwa } from '@/lib/use-installed-pwa'
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
import { isInrDisplay, INR_TEXT_CLASS } from '@/lib/format-inr'
import { InrAmount } from '@/components/inr-amount'
import { cn } from '@/lib/utils'
import {
  MobileCard,
  MobileCardAction,
  MobileCardActions,
  MobileCardBody,
  MobileCardList,
  MobileCardRow,
  MobileStatCard,
  MobileStatGrid,
} from '@/components/mobile-ui'

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
  const isInstalledPwa = useIsInstalledPwa()

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
      <div className="space-y-4 sm:space-y-5 animate-fade-in">

        <PageHero
          label="Welcome back"
          title={isInstalledPwa ? 'Overview' : "Here's your overview"}
          description="A quick snapshot of revenue, invoices, and what needs attention today."
          footer={
            <div className="flex gap-2 md:gap-3">
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center sm:min-w-[88px] sm:flex-none sm:px-4 sm:py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">Draft</p>
                <p className="mt-0.5 text-lg font-bold text-slate-800 tabular-nums sm:text-xl">{draftCount}</p>
              </div>
              <div className="flex-1 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-center sm:min-w-[88px] sm:flex-none sm:px-4 sm:py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 sm:text-xs">Paid</p>
                <p className="mt-0.5 text-lg font-bold text-emerald-700 tabular-nums sm:text-xl">{paidCount}</p>
              </div>
            </div>
          }
        />

        <MobileStatGrid>
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <MobileStatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                sub={stat.sub}
                icon={Icon}
                iconClassName={stat.iconBg}
              />
            )
          })}
        </MobileStatGrid>

        {/* ── Stat cards (browser mobile + desktop) ── */}
        <div className="browser-shell-only browser-shell-md-up hidden gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4 stagger">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="stat-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="section-label">{stat.label}</p>
                    <p
                      className={cn(
                        'mt-2 text-2xl font-bold tabular-nums truncate',
                        isInrDisplay(stat.value) ? INR_TEXT_CLASS : 'text-gray-900',
                      )}
                    >
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
          <div className="premium-card p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4 sm:gap-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
                <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Shortcuts to your most-used features</p>
              </div>
              <Link
                href="/invoices/new"
                className={`min-h-11 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white active:bg-blue-700 transition ${isInstalledPwa ? 'hidden sm:inline-flex' : 'inline-flex'}`}
              >
                <Plus className="h-4 w-4" />
                New Invoice
              </Link>
            </div>
            <div className={`grid grid-cols-3 gap-2 sm:gap-3 ${isInstalledPwa ? '' : 'sm:grid-cols-3'}`}>
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
                    className="group flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 px-2 py-3 text-center transition active:border-blue-200 active:bg-blue-50 sm:min-h-[88px] sm:gap-2.5 sm:px-4 sm:py-4"
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl sm:h-9 sm:w-9 ${action.bg}`}>
                      <Icon className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${action.fg}`} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-800 sm:text-sm">{action.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">{action.sub}</p>
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
            <>
              <MobileCardList className="p-4">
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
                    <MobileCard key={invoice.id}>
                      <MobileCardBody href={`/invoices/${invoice.id}`} showChevron>
                        <MobileCardRow
                          title={invoice.invoiceNumber}
                          subtitle={customer?.name || 'Unknown'}
                          meta={invoice.date ? new Date(invoice.date).toLocaleDateString('en-IN') : '—'}
                          amount={`₹${total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                          badge={<span className={badge.cls}>{badge.label}</span>}
                        />
                      </MobileCardBody>
                    </MobileCard>
                  )
                })}
              </MobileCardList>

              <div className="table-scroll browser-table-shell">
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
                        <td className="px-5 py-3 text-right tabular-nums">
                          <InrAmount value={total} />
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
            </>
          )}
        </div>

      </div>
    </AppLayout>
  )
}
