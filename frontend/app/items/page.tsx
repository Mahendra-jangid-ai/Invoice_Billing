'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useBilling, Item } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, X, Package } from 'lucide-react'
import { SkeletonListPage } from '@/components/ui/skeleton'
import { PageHero } from '@/components/page-hero'
import { FormActions } from '@/components/form-actions'
import {
  MobileCard,
  MobileCardAction,
  MobileCardActions,
  MobileCardBody,
  MobileCardList,
} from '@/components/mobile-ui'

// ── Lazy-load layout ──────────────────────────────────────────────────────────
const AppLayout = dynamic(
  () => import('@/app/app-layout').then((m) => ({ default: m.AppLayout })),
  { ssr: false, loading: () => null }
)

import { ITEM_PLACEHOLDERS } from '@/lib/form-placeholders'

const EMPTY_FORM: Partial<Item> = { name: '', description: '', hsnsac: '', unitprice: 0 }

export default function ItemsPage() {
  const { items, loading, addItem, updateItem, deleteItem } = useBilling()
  const [showForm, setShowForm]   = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData]   = useState<Partial<Item>>(EMPTY_FORM)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || formData.unitprice === undefined || formData.unitprice < 0) {
      alert('Please fill in Name and a valid Unit Price')
      return
    }
    try {
      if (editingId) {
        await updateItem(editingId, formData as Item)
        setEditingId(null)
      } else {
        await addItem(formData as Item)
      }
      setFormData(EMPTY_FORM)
      setShowForm(false)
    } catch {
      // Error shown via billing context banner
    }
  }

  const handleEdit = (item: Item) => {
    setFormData(item)
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this item?')) await deleteItem(id)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(EMPTY_FORM)
  }

  if (loading) {
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
          description="Your item list — pick these when building invoices so rates stay consistent."
          actions={
            <Button onClick={() => setShowForm(true)} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          }
          footer={
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <Package className="h-3.5 w-3.5 text-amber-600" />
              {items.length} item{items.length !== 1 ? 's' : ''} in catalog
            </div>
          }
        />

        {/* ── Add/Edit form ── */}
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
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="field-input"
                    placeholder={ITEM_PLACEHOLDERS.name}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Unit Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitprice ?? ''}
                    onChange={(e) => setFormData({ ...formData, unitprice: parseFloat(e.target.value) || 0 })}
                    className="field-input"
                    placeholder={ITEM_PLACEHOLDERS.unitprice}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">HSN / SAC Code</label>
                  <input
                    type="text"
                    value={formData.hsnsac || ''}
                    onChange={(e) => setFormData({ ...formData, hsnsac: e.target.value })}
                    className="field-input"
                    placeholder={ITEM_PLACEHOLDERS.hsnsac}
                  />
                </div>
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
                <Button type="submit" className="gap-2">
                  {editingId ? 'Update item' : 'Save item'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </FormActions>
            </form>
          </div>
        )}

        {/* ── List ── */}
        {items.length === 0 ? (
          <div className="premium-card flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Package className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">Catalog is empty</p>
              <p className="mt-1 text-sm text-slate-400">Add items or services to use them in invoices.</p>
            </div>
            <Button className="mt-1 gap-2" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Add First Item
            </Button>
          </div>
        ) : (
          <div className="premium-card overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
              <h2 className="text-sm font-bold text-slate-900">Catalog Items</h2>
              <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {items.length} total
              </span>
            </div>

            <MobileCardList className="p-4">
              {items.map((item) => (
                <MobileCard key={item.id}>
                  <MobileCardBody onClick={() => handleEdit(item)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{item.description || 'No description'}</p>
                      </div>
                      <p className="shrink-0 text-base font-bold text-slate-900">
                        ₹{Number(item.unitprice || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    {item.hsnsac && (
                      <p className="mt-2 inline-flex rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                        {item.hsnsac}
                      </p>
                    )}
                  </MobileCardBody>
                  <MobileCardActions>
                    <MobileCardAction
                      icon={Edit}
                      label="Edit"
                      variant="amber"
                      bordered={false}
                      onClick={() => handleEdit(item)}
                    />
                    <MobileCardAction
                      icon={Trash2}
                      label="Delete"
                      variant="danger"
                      onClick={() => handleDelete(item.id)}
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
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        ₹{Number(item.unitprice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                            onClick={() => handleDelete(item.id)}
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
          </div>
        )}

      </div>
    </AppLayout>
  )
}
