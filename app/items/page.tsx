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
        <section className="rounded-[32px] border border-[#E5E7EB] bg-white/95 p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6B7280]">Items</p>
              <h1 className="mt-2 text-3xl font-semibold text-[#111827]">Manage products and services</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#4B5563]">Add and maintain the items you sell in one convenient place.</p>
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
                <h2 className="text-lg font-semibold text-[#111827]">
                  {editingId ? 'Edit item' : 'Add new item'}
                </h2>
                <p className="text-sm text-[#6B7280]">Add the item details used in invoices.</p>
              </div>
              <button
                onClick={handleCancel}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E5E7EB] text-[#6B7280] transition hover:border-[#2563EB] hover:text-[#111827]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#374151]">Item name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                    placeholder="Item name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151]">Unit price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitprice ?? ''}
                    onChange={(e) => setFormData({ ...formData, unitprice: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151]">HSN/SAC code</label>
                  <input
                    type="text"
                    value={formData.hsnsac || ''}
                    onChange={(e) => setFormData({ ...formData, hsnsac: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                    placeholder="HSN/SAC code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151]">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
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
          <section className="rounded-[32px] border border-[#E5E7EB] bg-white/95 p-12 text-center text-[#4B5563] shadow-sm">
            Loading items...
          </section>
        ) : items.length === 0 ? (
          <section className="rounded-[32px] border border-dashed border-[#D1D5DB] bg-white/95 p-12 text-center">
            <p className="text-lg font-semibold text-[#111827]">No items yet</p>
            <p className="mt-2 text-sm text-[#4B5563]">Create your first catalog item to use in invoices.</p>
            <Button className="mt-6 gap-2" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </section>
        ) : (
          <section className="rounded-[32px] border border-[#E5E7EB] bg-white/95 p-4 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-5 py-3 text-sm font-semibold text-[#111827]">Item name</th>
                    <th className="px-5 py-3 text-sm font-semibold text-[#111827]">HSN/SAC</th>
                    <th className="px-5 py-3 text-right text-sm font-semibold text-[#111827]">Unit price</th>
                    <th className="px-5 py-3 text-sm font-semibold text-[#111827]">Description</th>
                    <th className="px-5 py-3 text-center text-sm font-semibold text-[#111827]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F9FAFB]">
                      <td className="px-5 py-4 font-medium text-[#111827]">{item.name}</td>
                      <td className="px-5 py-4 text-sm text-[#4B5563]">{item.hsnsac || '-'}</td>
                      <td className="px-5 py-4 text-right text-sm font-medium text-[#111827]">₹{(Number(item.unitprice) || 0).toFixed(2)}</td>
                      <td className="px-5 py-4 text-sm text-[#4B5563]">{item.description || '-'}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[#E5E7EB] text-[#374151] transition hover:bg-[#F9FAFB] hover:text-[#111827]"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[#E5E7EB] text-[#374151] transition hover:bg-[#F9FAFB] hover:text-[#111827]"
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
