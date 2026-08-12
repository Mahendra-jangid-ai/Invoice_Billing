'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useBilling, Customer } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, X, Users } from 'lucide-react'
import { SkeletonListPage } from '@/components/ui/skeleton'

// ── Lazy-load layout ──────────────────────────────────────────────────────────
const AppLayout = dynamic(
  () => import('@/app/app-layout').then((m) => ({ default: m.AppLayout })),
  { ssr: false, loading: () => null }
)

import { CUSTOMER_PLACEHOLDERS } from '@/lib/form-placeholders'

const EMPTY_FORM: Partial<Customer> = {
  name: '', email: '', phone: '', address: '', gstnumber: '', state: '', code: '',
}

export default function CustomersPage() {
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer } = useBilling()
  const [showForm, setShowForm]   = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData]   = useState<Partial<Customer>>(EMPTY_FORM)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      alert('Please fill in required fields (Name and Email)')
      return
    }
    try {
      if (editingId) {
        await updateCustomer(editingId, formData as Customer)
        setEditingId(null)
      } else {
        await addCustomer(formData as Customer)
      }
      setFormData(EMPTY_FORM)
      setShowForm(false)
    } catch {
      // Error shown via billing context banner
    }
  }

  const handleEdit = (c: Customer) => {
    setFormData(c)
    setEditingId(c.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this customer?')) await deleteCustomer(id)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(EMPTY_FORM)
  }

  if (loading) {
    return (
      <AppLayout>
        <SkeletonListPage cols={7} />
      </AppLayout>
    )
  }

  const field = (
    label: string,
    key: keyof Customer,
    opts?: { type?: string; required?: boolean; placeholder?: string }
  ) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label} {opts?.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={opts?.type || 'text'}
        value={(formData[key] as string) || ''}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        className="field-input"
        placeholder={opts?.placeholder}
        required={opts?.required}
      />
    </div>
  )

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">

        {/* ── Hero ── */}
        <div className="hero-card px-8 py-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="section-label">People</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">
                Customer Management
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Add and manage all your billing clients in one place.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/80 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                <Users className="h-3.5 w-3.5 text-indigo-500" />
                {customers.length} customer{customers.length !== 1 ? 's' : ''} registered
              </div>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2 shadow-md shadow-indigo-200/50 self-start xl:self-center">
              <Plus className="h-4 w-4" /> Add Customer
            </Button>
          </div>
        </div>

        {/* ── Add/Edit form ── */}
        {showForm && (
          <div className="premium-card p-6 animate-scale-in">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {editingId ? 'Edit Customer' : 'New Customer'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Fill in the customer details below.</p>
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
                {field('Name',        'name',      { required: true,  placeholder: CUSTOMER_PLACEHOLDERS.name })}
                {field('Email',       'email',     { type: 'email', required: true, placeholder: CUSTOMER_PLACEHOLDERS.email })}
                {field('Phone',       'phone',     { type: 'tel',  placeholder: CUSTOMER_PLACEHOLDERS.phone })}
                {field('GST Number',  'gstnumber', { placeholder: CUSTOMER_PLACEHOLDERS.gstnumber })}
                {field('State',       'state',     { placeholder: CUSTOMER_PLACEHOLDERS.state })}
                {field('State Code',  'code',      { placeholder: CUSTOMER_PLACEHOLDERS.code })}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="field-input resize-none"
                  placeholder={CUSTOMER_PLACEHOLDERS.address}
                  rows={3}
                />
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button type="submit" className="gap-2">
                  {editingId ? 'Update Customer' : 'Save Customer'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {/* ── List ── */}
        {customers.length === 0 ? (
          <div className="premium-card flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">No customers yet</p>
              <p className="mt-1 text-sm text-slate-400">Add your first customer to start billing.</p>
            </div>
            <Button className="mt-1 gap-2" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Add Customer
            </Button>
          </div>
        ) : (
          <div className="premium-card overflow-hidden p-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">All Customers</h2>
              <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {customers.length} total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left">Name</th>
                    <th className="px-6 py-3.5 text-left">Email</th>
                    <th className="px-6 py-3.5 text-left">Phone</th>
                    <th className="px-6 py-3.5 text-left">State</th>
                    <th className="px-6 py-3.5 text-left">Code</th>
                    <th className="px-6 py-3.5 text-left">GST</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                            {customer.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-semibold text-slate-900">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{customer.email}</td>
                      <td className="px-6 py-4 text-slate-500">{customer.phone || '—'}</td>
                      <td className="px-6 py-4 text-slate-500">{customer.state || '—'}</td>
                      <td className="px-6 py-4 text-slate-500">{customer.code || '—'}</td>
                      <td className="px-6 py-4">
                        {customer.gstnumber ? (
                          <span className="font-mono text-xs text-slate-700">{customer.gstnumber}</span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
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
