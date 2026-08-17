'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBilling, Item } from '@/lib/context'
import { apiFetch } from '@/lib/api-client'
import {
  buildItemSearchQuery,
  countActiveFilters,
  DEFAULT_ITEM_FILTERS,
  filtersAreEqual,
  filtersToSearchParams,
  parseItemFiltersFromParams,
  type ItemSearchFilters,
  type ItemSearchResponse,
} from '@/lib/item-search'
import { ItemFilters } from '@/components/item-filters'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, X, Package, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { SkeletonListPage } from '@/components/ui/skeleton'
import { PageHero } from '@/components/page-hero'
import { FormActions } from '@/components/form-actions'
import {
  MobileCard,
  MobileCardAction,
  MobileCardActions,
  MobileCardBody,
  MobileCardList,
  MobileCardRow,
} from '@/components/mobile-ui'
import { InrAmount } from '@/components/inr-amount'
import { formatInr } from '@/lib/format-inr'

const AppLayout = dynamic(
  () => import('@/app/app-layout').then((m) => ({ default: m.AppLayout })),
  { ssr: false, loading: () => null }
)

import { ITEM_PLACEHOLDERS } from '@/lib/form-placeholders'
import { useConfirm, useFeedback } from '@/components/confirm-provider'
import { FormField, fieldClassName } from '@/components/form-field'
import { type FieldErrors, formatFieldErrors, hasErrors, validateItemForm } from '@/lib/validation'

const EMPTY_FORM: Partial<Item> = { name: '', description: '', hsnsac: '', unitprice: 0 }

export default function ItemsPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <SkeletonListPage cols={5} />
        </AppLayout>
      }
    >
      <ItemsPageContent />
    </Suspense>
  )
}

function ItemsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loading: billingLoading, addItem, updateItem, deleteItem } = useBilling()
  const { confirm } = useConfirm()
  const { warning, error: showError } = useFeedback()

  const appliedFilters = useMemo(
    () => parseItemFiltersFromParams(searchParams),
    [searchParams],
  )

  const [draftFilters, setDraftFilters] = useState<ItemSearchFilters>(appliedFilters)
  const [result, setResult] = useState<ItemSearchResponse | null>(null)
  const [fetching, setFetching] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Item>>(EMPTY_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraftFilters(appliedFilters)
  }, [appliedFilters])

  const loadItems = useCallback(async () => {
    setFetching(true)
    try {
      const query = buildItemSearchQuery(appliedFilters)
      const response = await apiFetch<ItemSearchResponse>(`/api/items?${query}`)
      setResult(response)
    } catch (err) {
      setResult(null)
      showError({
        title: 'Load failed',
        description: err instanceof Error ? err.message : 'Failed to load items',
      })
    } finally {
      setFetching(false)
    }
  }, [appliedFilters, showError])

  useEffect(() => {
    if (!billingLoading) {
      loadItems()
    }
  }, [billingLoading, loadItems])

  useEffect(() => {
    if (filtersAreEqual(draftFilters, appliedFilters)) return

    const timer = window.setTimeout(() => {
      const params = filtersToSearchParams(draftFilters)
      router.push(`/items?${params.toString()}`)
    }, 400)

    return () => window.clearTimeout(timer)
  }, [draftFilters, appliedFilters, router])

  const resetFilters = () => {
    setDraftFilters(DEFAULT_ITEM_FILTERS)
    router.push('/items')
  }

  const goToPage = (page: number) => {
    const params = filtersToSearchParams({ ...appliedFilters, page })
    router.push(`/items?${params.toString()}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = validateItemForm(formData)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) {
      warning({
        title: 'Please fix the form',
        description: formatFieldErrors(nextErrors),
      })
      return
    }

    try {
      setSaving(true)
      if (editingId) {
        await updateItem(editingId, formData as Item)
        setEditingId(null)
      } else {
        await addItem(formData as Item)
      }
      setFormData(EMPTY_FORM)
      setErrors({})
      setShowForm(false)
      await loadItems()
    } catch {
      // Error shown via billing context banner
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: Item) => {
    setFormData(item)
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = (id: string, name?: string) => {
    confirm({
      title: 'Delete item?',
      description: `Are you sure you want to delete ${name || 'this item'}? This action cannot be undone.`,
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm: async () => {
        await deleteItem(id)
        await loadItems()
      },
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setErrors({})
  }

  const activeFilterCount = countActiveFilters(appliedFilters)
  const items = result?.data ?? []
  const pagination = result?.pagination
  const facets = result?.facets

  if (billingLoading && !result) {
    return (
      <AppLayout>
        <SkeletonListPage cols={5} />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          label="Catalog"
          title="Products & Services"
          description="Filter by name, HSN/SAC, or price range — stats computed via aggregation."
          actions={
            <Button onClick={() => setShowForm(true)} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          }
          footer={
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                <Package className="h-3.5 w-3.5 text-amber-600" />
                <span>Total</span>
                <span className="font-semibold">{facets?.total ?? 0}</span>
              </div>
              {facets && facets.total > 0 && (
                <>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
                    <span>Avg price</span>
                    <span className="font-semibold inr-amount">{formatInr(facets.avgPrice)}</span>
                  </div>
                  {activeFilterCount > 0 && (
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                      <span>Filtered avg</span>
                      <span className="font-semibold inr-amount">{formatInr(facets.filteredAvgPrice)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          }
        />

        <ItemFilters
          filters={draftFilters}
          onChange={setDraftFilters}
          onReset={resetFilters}
          priceRange={
            facets
              ? { min: facets.minCatalogPrice, max: facets.maxCatalogPrice }
              : undefined
          }
        />

        {showForm && (
          <div className="premium-card p-4 sm:p-6 animate-scale-in">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="card-heading">{editingId ? 'Edit item' : 'New item'}</h2>
                <p className="card-subtext">Name and unit price are required.</p>
              </div>
              <button
                onClick={handleCancel}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField label="Item Name" required error={errors.name}>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                    }}
                    className={fieldClassName(errors.name)}
                    placeholder={ITEM_PLACEHOLDERS.name}
                  />
                </FormField>
                <FormField label="Unit Price (₹)" required error={errors.unitprice}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitprice ?? ''}
                    onChange={(e) => {
                      setFormData({ ...formData, unitprice: parseFloat(e.target.value) || 0 })
                      if (errors.unitprice) setErrors((prev) => ({ ...prev, unitprice: '' }))
                    }}
                    className={fieldClassName(errors.unitprice)}
                    placeholder={ITEM_PLACEHOLDERS.unitprice}
                  />
                </FormField>
                <FormField label="HSN / SAC Code" error={errors.hsnsac}>
                  <input
                    type="text"
                    value={formData.hsnsac || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, hsnsac: e.target.value })
                      if (errors.hsnsac) setErrors((prev) => ({ ...prev, hsnsac: '' }))
                    }}
                    className={fieldClassName(errors.hsnsac)}
                    placeholder={ITEM_PLACEHOLDERS.hsnsac}
                  />
                </FormField>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="field-input resize-none"
                  placeholder={ITEM_PLACEHOLDERS.description}
                  rows={3}
                />
              </div>
              <FormActions className="is-sticky">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving
                    ? editingId
                      ? 'Updating item…'
                      : 'Saving item…'
                    : editingId
                      ? 'Update item'
                      : 'Save item'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
              </FormActions>
            </form>
          </div>
        )}

        {fetching ? (
          <div className="premium-card flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" />
            Loading items…
          </div>
        ) : items.length === 0 ? (
          <div className="premium-card flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Package className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">
                {activeFilterCount > 0 ? 'No items match your filters' : 'Catalog is empty'}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {activeFilterCount > 0
                  ? 'Try adjusting the filters or reset to see all items.'
                  : 'Add items or services to use them in invoices.'}
              </p>
            </div>
            {activeFilterCount > 0 ? (
              <Button variant="outline" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : (
              <Button className="mt-1 gap-2" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" /> Add First Item
              </Button>
            )}
          </div>
        ) : (
          <div className="premium-card overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Catalog results</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Showing {items.length} of {pagination?.total ?? items.length} records
                  {activeFilterCount > 0 ? ' (filtered)' : ''}
                </p>
              </div>
              <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Page {pagination?.page ?? 1} / {Math.max(pagination?.totalPages ?? 1, 1)}
              </span>
            </div>

            <MobileCardList className="p-4">
              {items.map((item) => (
                <MobileCard key={item.id}>
                  <MobileCardBody onClick={() => handleEdit(item)} showChevron>
                    <MobileCardRow
                      title={item.name}
                      subtitle={item.description || 'No description'}
                      amount={`₹${Number(item.unitprice || 0).toLocaleString('en-IN')}`}
                    />
                    {item.hsnsac && (
                      <p className="mt-2 inline-flex rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                        HSN/SAC: {item.hsnsac}
                      </p>
                    )}
                  </MobileCardBody>
                  <MobileCardActions>
                    <MobileCardAction
                      icon={Edit}
                      label="Edit"
                      variant="amber"
                      onClick={() => handleEdit(item)}
                    />
                    <MobileCardAction
                      icon={Trash2}
                      label="Delete"
                      variant="danger"
                      onClick={() => handleDelete(item.id, item.name)}
                    />
                  </MobileCardActions>
                </MobileCard>
              ))}
            </MobileCardList>

            <div className="table-scroll hidden md:block">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left">Item Name</th>
                    <th className="px-6 py-3.5 text-left">HSN / SAC</th>
                    <th className="px-6 py-3.5 text-right">Unit Price</th>
                    <th className="px-6 py-3.5 text-left">Description</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-xs font-bold text-amber-700">
                            {item.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-semibold text-slate-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.hsnsac ? (
                          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {item.hsnsac}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <InrAmount value={Number(item.unitprice || 0)} className="font-bold" />
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">
                        {item.description || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 sm:px-6">
                <p className="text-xs text-slate-500">
                  Filtered avg:{' '}
                  <span className="inr-amount font-semibold">{formatInr(facets?.filteredAvgPrice ?? 0)}</span>
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
