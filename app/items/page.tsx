'use client'

import { useState } from 'react'
import { useBilling, Item } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, X, Loader2 } from 'lucide-react'
import { AppLayout } from '@/app/app-layout'

export default function ItemsPage() {
  const { items, loading, addItem, updateItem, deleteItem } = useBilling()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Item>>({
    name: '',
    description: '',
    hsnsac: '',
    unitprice: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || formData.unitprice === undefined || formData.unitprice < 0) {
      alert('Please fill in required fields (Name and valid Unit Price)')
      return
    }

    if (editingId) {
      await updateItem(editingId, formData as Item)
      setEditingId(null)
    } else {
      await addItem(formData as Item)
    }

    setFormData({
      name: '',
      description: '',
      hsnsac: '',
      unitprice: 0,
    })
    setShowForm(false)
  }

  const handleEdit = (item: Item) => {
    setFormData(item)
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      description: '',
      hsnsac: '',
      unitprice: 0,
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Items</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Manage products and services</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">Add and maintain the items you sell in one convenient place.</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2 self-start xl:self-center">
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </div>
        </section>

        {showForm && (
          <section className="soft-card rounded-[32px] p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {editingId ? 'Edit item' : 'Add new item'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Add the item details used in invoices.</p>
              </div>
              <button
                onClick={handleCancel}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Item name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    placeholder="Item name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Unit price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitprice ?? ''}
                    onChange={(e) => setFormData({ ...formData, unitprice: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">HSN/SAC code</label>
                  <input
                    type="text"
                    value={formData.hsnsac || ''}
                    onChange={(e) => setFormData({ ...formData, hsnsac: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    placeholder="HSN/SAC code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  placeholder="Item description"
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit">{editingId ? 'Update item' : 'Save item'}</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </form>
          </section>
        )}

        {loading ? (
          <section className="rounded-[32px] border border-slate-200/80 bg-white/95 p-12 text-center text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-400">
            Loading items...
          </section>
        ) : items.length === 0 ? (
          <section className="rounded-[32px] border border-dashed border-slate-300 bg-white/95 p-12 text-center dark:border-slate-700 dark:bg-slate-950/90">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">No items yet</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Create your first catalog item to use in invoices.</p>
            <Button className="mt-6 gap-2" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </section>
        ) : (
          <section className="rounded-[32px] border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white">Item name</th>
                    <th className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white">HSN/SAC</th>
                    <th className="px-5 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Unit price</th>
                    <th className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white">Description</th>
                    <th className="px-5 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">{item.hsnsac || '-'}</td>
                      <td className="px-5 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">₹{(Number(item.unitprice) || 0).toFixed(2)}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">{item.description || '-'}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
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
          </section>
        )}
      </div>
    </AppLayout>
  )
}
