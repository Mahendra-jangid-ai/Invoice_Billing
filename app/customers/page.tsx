'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useBilling, Customer } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, X, Users } from 'lucide-react'
import { SkeletonListPage } from '@/components/ui/skeleton'
import { PageHero } from '@/components/page-hero'
import { FormActions } from '@/components/form-actions'

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

        <PageHero
          label="People"
          title="Customer Management"
          description="Keep client details handy for faster invoicing — add anyone you bill regularly."
          actions={
            <Button onClick={() => setShowForm(true)} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Add Customer
            </Button>
          }
          footer={
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <Users className="h-3.5 w-3.5 text-[#2563EB]" />
              {customers.length} customer{customers.length !== 1 ? 's' : ''} on file
            </div>
          }
        />

        {/* ── Add/Edit form ── */}
        {showForm && (
          <div className="premium-card p-6 animate-scale-in">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="card-heading">
                  {editingId ? 'Edit customer' : 'New customer'}
                </h2>
                <p className="card-subtext">Fields marked * are required.</p>
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
              <FormActions className="is-sticky">
                <Button type="submit" className="gap-2">
                  {editingId ? 'Update customer' : 'Save customer'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </FormActions>
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
            <div className="table-scroll">
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
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#2563EB]">
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
