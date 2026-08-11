'use client'

import { useState } from 'react'
import { useBilling, Customer } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, X, Loader2 } from 'lucide-react'
import { AppLayout } from '@/app/app-layout'

export default function CustomersPage() {
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer } =
    useBilling()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstnumber: '',
    state: '',
    code: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      alert('Please fill in required fields (Name and Email)')
      return
    }

    if (editingId) {
      await updateCustomer(editingId, formData as Customer)
      setEditingId(null)
    } else {
      await addCustomer(formData as Customer)
    }

    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      gstnumber: '',
    })
    setShowForm(false)
  }

  const handleEdit = (customer: Customer) => {
    setFormData(customer)
    setEditingId(customer.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      await deleteCustomer(id)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      gstnumber: '',
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-[#E5E7EB] bg-white/95 p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6B7280]">Customers</p>
              <h1 className="mt-2 text-3xl font-semibold text-[#111827]">Manage customers</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#4B5563]">Add, edit and organize your customer details in one place.</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2 self-start xl:self-center">
              <Plus className="h-4 w-4" />
              Add customer
            </Button>
          </div>
        </section>

        {showForm && (
          <section className="soft-card rounded-[32px] p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">
                  {editingId ? 'Edit customer' : 'Add new customer'}
                </h2>
                <p className="text-sm text-[#6B7280]">Fill in the customer details below.</p>
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
                  <label className="block text-sm font-medium text-[#374151]">Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                    placeholder="Customer name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151]">Email *</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151]">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151]">GST number</label>
                  <input
                    type="text"
                    value={formData.gstnumber || ''}
                    onChange={(e) => setFormData({ ...formData, gstnumber: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                    placeholder="GST number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151]">State</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                    placeholder="State name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151]">State code</label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                    placeholder="State code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151]">Address</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                  placeholder="Customer address"
                  rows={4}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit">{editingId ? 'Update customer' : 'Save customer'}</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </form>
          </section>
        )}

        {loading ? (
          <div className="rounded-[32px] border border-[#E5E7EB] bg-white/95 p-12 text-center text-[#4B5563] shadow-sm">
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <section className="rounded-[32px] border border-dashed border-[#D1D5DB] bg-white/95 p-12 text-center">
            <p className="text-lg font-semibold text-[#111827]">No customers yet</p>
            <p className="mt-2 text-sm text-[#4B5563]">Start by adding your first customer to manage invoices faster.</p>
            <Button className="mt-6 gap-2" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Add customer
            </Button>
          </section>
        ) : (
          <section className="rounded-[32px] border border-[#E5E7EB] bg-white/95 p-4 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-5 py-3 text-sm font-semibold text-[#111827]">Name</th>
                    <th className="px-5 py-3 text-sm font-semibold text-[#111827]">Email</th>
                    <th className="px-5 py-3 text-sm font-semibold text-[#111827]">Phone</th>
                    <th className="px-5 py-3 text-sm font-semibold text-[#111827]">State</th>
                    <th className="px-5 py-3 text-sm font-semibold text-[#111827]">State code</th>
                    <th className="px-5 py-3 text-sm font-semibold text-[#111827]">GST number</th>
                    <th className="px-5 py-3 text-center text-sm font-semibold text-[#111827]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-[#F9FAFB]">
                      <td className="px-5 py-4 font-medium text-[#111827]">{customer.name}</td>
                      <td className="px-5 py-4 text-sm text-[#4B5563]">{customer.email}</td>
                      <td className="px-5 py-4 text-sm text-[#4B5563]">{customer.phone || '-'}</td>
                      <td className="px-5 py-4 text-sm text-[#4B5563]">{customer.state || '-'}</td>
                      <td className="px-5 py-4 text-sm text-[#4B5563]">{customer.code || '-'}</td>
                      <td className="px-5 py-4 text-sm text-[#4B5563]">{customer.gstnumber || '-'}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[#E5E7EB] text-[#374151] transition hover:bg-[#F9FAFB] hover:text-[#111827]"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
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
