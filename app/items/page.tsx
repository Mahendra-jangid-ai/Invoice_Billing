'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useBilling, Item } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, X, Package } from 'lucide-react'
import { SkeletonListPage } from '@/components/ui/skeleton'

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

        {/* ── Hero ── */}
        <div className="hero-card px-8 py-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="section-label">Catalog</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">
                Products & Services
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Manage your billing catalog — items used across all invoices.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/80 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                <Package className="h-3.5 w-3.5 text-amber-500" />
                {items.length} item{items.length !== 1 ? 's' : ''} in catalog
              </div>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2 shadow-md shadow-indigo-200/50 self-start xl:self-center">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>
        </div>

        {/* ── Add/Edit form ── */}
        {showForm && (
          <div className="premium-card p-6 animate-scale-in">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {editingId ? 'Edit Item' : 'New Item'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Fill in the item details to add it to your catalog.</p>
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
              <div className="flex flex-wrap gap-3 pt-1">
                <Button type="submit" className="gap-2">
                  {editingId ? 'Update Item' : 'Save Item'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
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
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Catalog Items</h2>
              <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {items.length} total
              </span>
            </div>
            <div className="overflow-x-auto">
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
