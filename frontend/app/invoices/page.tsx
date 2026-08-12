'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useBilling } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Plus, Eye, Edit, Trash2, FileText } from 'lucide-react'
import { SkeletonInvoicesPage } from '@/components/ui/skeleton'
import { PageHero } from '@/components/page-hero'

// ── Lazy-load layout ──────────────────────────────────────────────────────────
const AppLayout = dynamic(
  () => import('@/app/app-layout').then((m) => ({ default: m.AppLayout })),
  { ssr: false, loading: () => null }
)

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:     { label: 'Draft',     cls: 'badge badge-gray'  },
  finalized: { label: 'Finalized', cls: 'badge badge-blue'  },
  paid:      { label: 'Paid',      cls: 'badge badge-green' },
}

export default function InvoicesPage() {
  const { invoices, customers, items, deleteInvoice, loading } = useBilling()

  if (loading) {
    return (
      <AppLayout>
        <SkeletonInvoicesPage />
      </AppLayout>
    )
  }

  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">

        <PageHero
          label="Billing"
          title="Invoice Management"
          description="Create invoices, track payment status, and re-open drafts when you need to fix something."
          actions={
            <Link href="/invoices/new" className="w-full sm:w-auto">
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </Link>
          }
          footer={
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Total', value: invoices.length, cls: 'bg-slate-100 text-slate-700' },
                { label: 'Draft', value: invoices.filter((i) => i.status === 'draft').length, cls: 'bg-slate-100 text-slate-600' },
                { label: 'Finalized', value: invoices.filter((i) => i.status === 'finalized').length, cls: 'bg-blue-50 text-blue-700' },
                { label: 'Paid', value: invoices.filter((i) => i.status === 'paid').length, cls: 'bg-emerald-50 text-emerald-700' },
              ].map((chip) => (
                <div
                  key={chip.label}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${chip.cls}`}
                >
                  <span>{chip.label}</span>
                  <span className="font-semibold">{chip.value}</span>
                </div>
              ))}
            </div>
          }
        />

        {/* ── Table ── */}
        {sortedInvoices.length === 0 ? (
          <div className="premium-card flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">No invoices yet</p>
              <p className="mt-1 text-sm text-slate-400">Start billing your clients by creating your first invoice.</p>
            </div>
            <Link href="/invoices/new">
              <Button className="gap-2 mt-1">
                <Plus className="h-4 w-4" /> Create Invoice
              </Button>
            </Link>
          </div>
        ) : (
          <div className="premium-card overflow-hidden p-0">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">All Invoices</h2>
                <p className="text-xs text-slate-400 mt-0.5">Sorted by most recent date</p>
              </div>
              <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {sortedInvoices.length} records
              </span>
            </div>
            <div className="table-scroll">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left">Invoice #</th>
                    <th className="px-6 py-3.5 text-left">Date</th>
                    <th className="px-6 py-3.5 text-left">Customer</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
                    <th className="px-6 py-3.5 text-left">Status</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedInvoices.map((invoice) => {
                    const customer = customers.find((c) => String(c.id) === String(invoice.customerId))
                    const subtotal = (invoice.items ?? []).reduce((s, li) => {
                      const cat = items.find((i) => String(i.id) === String(li.itemId))
                      return s + (Number(li.rate) || Number(cat?.unitprice) || 0) * (Number(li.quantity) || 0)
                    }, 0)
                    const total = subtotal + (subtotal * (Number(invoice.taxPercentage) || 0)) / 100
                    const badge = STATUS_MAP[invoice.status] ?? { label: invoice.status, cls: 'badge badge-gray' }

                    return (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900">{invoice.invoiceNumber}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {invoice.date ? new Date(invoice.date).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-800">{customer?.name || 'Unknown'}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-slate-900">
                            ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={badge.cls}>{badge.label}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-[#2563EB] transition"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {invoice.status === 'draft' && (
                              <Link
                                href={`/invoices/${invoice.id}/edit`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                            )}
                            <button
                              onClick={() => deleteInvoice(invoice.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                              title="Delete"
                            >
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
