'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBilling } from '@/lib/context'
import { apiFetch } from '@/lib/api-client'
import {
  buildInvoiceSearchQuery,
  countActiveFilters,
  DEFAULT_INVOICE_FILTERS,
  filtersAreEqual,
  filtersToSearchParams,
  parseInvoiceFiltersFromParams,
  type InvoiceListItem,
  type InvoiceSearchFilters,
  type InvoiceSearchResponse,
} from '@/lib/invoice-search'
import { InvoiceFilters } from '@/components/invoice-filters'
import { Button } from '@/components/ui/button'
import { Plus, Eye, Edit, Trash2, FileText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import {
  MobileCard,
  MobileCardAction,
  MobileCardActions,
  MobileCardBody,
  MobileCardList,
  MobileCardRow,
} from '@/components/mobile-ui'
import { SkeletonInvoicesPage } from '@/components/ui/skeleton'
import { PageHero } from '@/components/page-hero'
import { useConfirm, useFeedback } from '@/components/confirm-provider'

const AppLayout = dynamic(
  () => import('@/app/app-layout').then((m) => ({ default: m.AppLayout })),
  { ssr: false, loading: () => null }
)

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'badge badge-gray' },
  finalized: { label: 'Finalized', cls: 'badge badge-blue' },
  paid: { label: 'Paid', cls: 'badge badge-green' },
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export default function InvoicesPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <SkeletonInvoicesPage />
        </AppLayout>
      }
    >
      <InvoicesPageContent />
    </Suspense>
  )
}

function InvoicesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { customers, deleteInvoice, loading: billingLoading } = useBilling()
  const { confirm } = useConfirm()
  const { error: showError } = useFeedback()

  const appliedFilters = useMemo(
    () => parseInvoiceFiltersFromParams(searchParams),
    [searchParams],
  )

  const [draftFilters, setDraftFilters] = useState<InvoiceSearchFilters>(appliedFilters)
  const [result, setResult] = useState<InvoiceSearchResponse | null>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    setDraftFilters(appliedFilters)
  }, [appliedFilters])

  const loadInvoices = useCallback(async () => {
    setFetching(true)
    try {
      const query = buildInvoiceSearchQuery(appliedFilters)
      const response = await apiFetch<InvoiceSearchResponse>(`/api/invoices?${query}`)
      setResult(response)
    } catch (err) {
      setResult(null)
      showError({
        title: 'Load failed',
        description: err instanceof Error ? err.message : 'Failed to load invoices',
      })
    } finally {
      setFetching(false)
    }
  }, [appliedFilters, showError])

  useEffect(() => {
    if (!billingLoading) {
      loadInvoices()
    }
  }, [billingLoading, loadInvoices])

  useEffect(() => {
    if (filtersAreEqual(draftFilters, appliedFilters)) return

    const timer = window.setTimeout(() => {
      const params = filtersToSearchParams(draftFilters)
      router.push(`/invoices?${params.toString()}`)
    }, 400)

    return () => window.clearTimeout(timer)
  }, [draftFilters, appliedFilters, router])

  const resetFilters = () => {
    setDraftFilters(DEFAULT_INVOICE_FILTERS)
    router.push('/invoices')
  }

  const goToPage = (page: number) => {
    const params = filtersToSearchParams({ ...appliedFilters, page })
    router.push(`/invoices?${params.toString()}`)
  }

  const handleDelete = (id: string, invoiceNumber?: string) => {
    confirm({
      title: 'Delete invoice?',
      description: `Are you sure you want to delete ${invoiceNumber || 'this invoice'}? This action cannot be undone.`,
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm: async () => {
        await deleteInvoice(id)
        await loadInvoices()
      },
    })
  }

  const activeFilterCount = countActiveFilters(appliedFilters)
  const invoices = result?.data ?? []
  const pagination = result?.pagination
  const facets = result?.facets

  if (billingLoading && !result) {
    return (
      <AppLayout>
        <SkeletonInvoicesPage />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          label="Billing"
          title="Invoices"
          description="Filter invoices by search, status, customer, invoice number, or date."
          actions={
            <Link href="/invoices/new" className="browser-shell-only inline-flex w-full sm:w-auto">
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </Link>
          }
          footer={
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Total', value: facets?.statusCounts.total ?? 0, cls: 'bg-slate-100 text-slate-700' },
                { label: 'Draft', value: facets?.statusCounts.draft ?? 0, cls: 'bg-slate-100 text-slate-600' },
                { label: 'Finalized', value: facets?.statusCounts.finalized ?? 0, cls: 'bg-blue-50 text-blue-700' },
                { label: 'Paid', value: facets?.statusCounts.paid ?? 0, cls: 'bg-emerald-50 text-emerald-700' },
              ].map((chip) => (
                <div
                  key={chip.label}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${chip.cls}`}
                >
                  <span>{chip.label}</span>
                  <span className="font-semibold">{chip.value}</span>
                </div>
              ))}
              {facets && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
                  <span>Filtered value</span>
                  <span className="font-semibold">{formatCurrency(facets.filteredAmount)}</span>
                </div>
              )}
            </div>
          }
        />

        <InvoiceFilters
          filters={draftFilters}
          onChange={setDraftFilters}
          onReset={resetFilters}
        />

        {fetching ? (
          <div className="premium-card flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" />
            Loading invoices…
          </div>
        ) : invoices.length === 0 ? (
          <div className="premium-card flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">
                {activeFilterCount > 0 ? 'No invoices match your filters' : 'No invoices yet'}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {activeFilterCount > 0
                  ? 'Try adjusting the filters or reset to see all invoices.'
                  : 'Start billing your clients by creating your first invoice.'}
              </p>
            </div>
            {activeFilterCount > 0 ? (
              <Button variant="outline" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : (
              <Link href="/invoices/new">
                <Button className="gap-2 mt-1">
                  <Plus className="h-4 w-4" /> Create Invoice
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="premium-card overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Invoice results</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Showing {invoices.length} of {pagination?.total ?? invoices.length} records
                  {activeFilterCount > 0 ? ' (filtered)' : ''}
                </p>
              </div>
              <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Page {pagination?.page ?? 1} / {Math.max(pagination?.totalPages ?? 1, 1)}
              </span>
            </div>

            <MobileCardList className="!block p-4">
              {invoices.map((invoice: InvoiceListItem) => {
                const customer = customers.find((c) => String(c.id) === String(invoice.customerId))
                const customerLabel = invoice.customerName || invoice.billTo?.name || customer?.name || 'Unknown'
                const total = invoice.totalAmount ?? 0
                const badge = STATUS_MAP[invoice.status] ?? { label: invoice.status, cls: 'badge badge-gray' }

                return (
                  <MobileCard key={invoice.id}>
                    <MobileCardBody href={`/invoices/${invoice.id}`} showChevron>
                      <MobileCardRow
                        title={invoice.invoiceNumber}
                        subtitle={customerLabel}
                        meta={invoice.date ? new Date(invoice.date).toLocaleDateString('en-IN') : '—'}
                        amount={formatCurrency(total)}
                        badge={<span className={badge.cls}>{badge.label}</span>}
                      />
                    </MobileCardBody>
                    <MobileCardActions>
                      <MobileCardAction href={`/invoices/${invoice.id}`} icon={Eye} label="View" variant="primary" />
                      {invoice.status === 'draft' ? (
                        <MobileCardAction href={`/invoices/${invoice.id}/edit`} icon={Edit} label="Edit" variant="amber" />
                      ) : (
                        <span className="flex min-h-11 items-center justify-center text-xs text-slate-300">—</span>
                      )}
                      <MobileCardAction
                        icon={Trash2}
                        label="Delete"
                        variant="danger"
                        onClick={() => handleDelete(invoice.id, invoice.invoiceNumber)}
                      />
                    </MobileCardActions>
                  </MobileCard>
                )
              })}
            </MobileCardList>

            {/* Desktop table */}
            <div className="table-scroll browser-table-shell">
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
                  {invoices.map((invoice: InvoiceListItem) => {
                    const customer = customers.find((c) => String(c.id) === String(invoice.customerId))
                    const customerLabel = invoice.customerName || invoice.billTo?.name || customer?.name || 'Unknown'
                    const total = invoice.totalAmount ?? 0
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
                          <span className="font-medium text-slate-800">{customerLabel}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-slate-900">{formatCurrency(total)}</span>
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
                              onClick={() => handleDelete(invoice.id, invoice.invoiceNumber)}
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

            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 sm:px-6">
                <p className="text-xs text-slate-500">
                  {formatCurrency(facets?.filteredAmount ?? 0)} total on this filter
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => goToPage(pagination.page - 1)}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasMore}
                    onClick={() => goToPage(pagination.page + 1)}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
