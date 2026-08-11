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
        <section className="rounded-[32px] border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Customers</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Manage customers</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">Add, edit and organize your customer details in one place.</p>
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
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {editingId ? 'Edit customer' : 'Add new customer'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Fill in the customer details below.</p>
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    placeholder="Customer name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email *</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">GST number</label>
                  <input
                    type="text"
                    value={formData.gstnumber || ''}
                    onChange={(e) => setFormData({ ...formData, gstnumber: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    placeholder="GST number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">State</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    placeholder="State name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">State code</label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    placeholder="State code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
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
          <div className="rounded-[32px] border border-slate-200/80 bg-white/95 p-12 text-center text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-400">
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <section className="rounded-[32px] border border-dashed border-slate-300 bg-white/95 p-12 text-center dark:border-slate-700 dark:bg-slate-950/90">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">No customers yet</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Start by adding your first customer to manage invoices faster.</p>
            <Button className="mt-6 gap-2" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Add customer
            </Button>
          </section>
        ) : (
          <section className="rounded-[32px] border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white">Name</th>
                    <th className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white">Email</th>
                    <th className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white">Phone</th>
                    <th className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white">State</th>
                    <th className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white">State code</th>
                    <th className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white">GST number</th>
                    <th className="px-5 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{customer.name}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">{customer.email}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">{customer.phone || '-'}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">{customer.state || '-'}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">{customer.code || '-'}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">{customer.gstnumber || '-'}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
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
