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
      <div className="flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-8 py-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Customers
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Manage your customer information
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          {showForm && (
            <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {editingId ? 'Edit Customer' : 'Add New Customer'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="Customer name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={formData.gstnumber || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, gstnumber: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="GST Number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Address
                  </label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder="Customer address"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit">
                    {editingId ? 'Update Customer' : 'Add Customer'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
            </div>
          ) : customers.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-slate-600 dark:text-slate-400">
                No customers yet.{' '}
                <button
                  onClick={() => setShowForm(true)}
                  className="text-slate-950 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300 font-medium"
                >
                  Add your first customer
                </button>
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      GST Number
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {customer.phone || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {customer.gstnumber || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="inline-flex items-center rounded px-2 py-1 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="inline-flex items-center rounded px-2 py-1 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
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
          )}
        </div>
      </div>
    </AppLayout>
  )
}
