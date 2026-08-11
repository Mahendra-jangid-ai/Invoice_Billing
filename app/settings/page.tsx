'use client'

import { useState, useEffect } from 'react'
import { useBilling } from '@/lib/context'
import { AppLayout } from '@/app/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Upload, Image as ImageIcon, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const { company, updateCompany } = useBilling()
  const [formData, setFormData] = useState(company)
  const [savedMessage, setSavedMessage] = useState(false)

  useEffect(() => {
    setFormData(company)
  }, [company])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size is too large. Please select an image under 5MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logoUrl: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setFormData(prev => ({
      ...prev,
      logoUrl: ''
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCompany(formData)
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 3000)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Company settings</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Company profile and branding</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">Update your company details, logo, and contact information for invoices and reports.</p>
            </div>
            <div className="flex items-center gap-3">
              {savedMessage && (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-950/70 dark:text-emerald-200">
                  <CheckCircle className="h-4 w-4" />
                  Saved
                </div>
              )}
              <Button type="button" onClick={handleSubmit} className="gap-2">
                Save changes
              </Button>
            </div>
          </div>
        </section>

        <section className="soft-card rounded-[32px] p-6">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Company information</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">The details shown on invoices and customer communications.</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-slate-700">Live data</div>
                </div>

                <div className="mt-5 grid gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Company name</p>
                    <p className="mt-2 text-sm text-slate-900 dark:text-white">{formData.name || 'Not configured yet'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Email</p>
                    <p className="mt-2 text-sm text-slate-900 dark:text-white">{formData.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="mt-2 text-sm text-slate-900 dark:text-white">{formData.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">PAN</p>
                    <p className="mt-2 text-sm text-slate-900 dark:text-white">{formData.pan || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">GST number</p>
                    <p className="mt-2 text-sm text-slate-900 dark:text-white">{formData.gstnumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Contact person</p>
                    <p className="mt-2 text-sm text-slate-900 dark:text-white">{formData.contactPerson || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">State</p>
                    <p className="mt-2 text-sm text-slate-900 dark:text-white">{formData.state || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">State code</p>
                    <p className="mt-2 text-sm text-slate-900 dark:text-white">{formData.code || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Address</p>
                    <p className="mt-2 text-sm text-slate-900 dark:text-white">{formData.address || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Logo preview</p>
                <div className="mt-4 flex h-24 w-full items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                  {formData.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.logoUrl} alt="Company logo" className="h-full object-contain" />
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No logo uploaded yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Upload logo</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900">
                    <Upload className="h-4 w-4" />
                    Choose image
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <Button type="button" variant="outline" onClick={handleRemoveLogo} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Accepted PNG, JPG, SVG files under 5MB.</p>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">Company name</label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Company name" className="border-slate-300 dark:border-slate-700" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">Email</label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="border-slate-300 dark:border-slate-700" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">Phone</label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" className="border-slate-300 dark:border-slate-700" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">GST number</label>
                  <Input id="gstnumber" name="gstnumber" value={formData.gstnumber} onChange={handleChange} placeholder="GST number" className="border-slate-300 dark:border-slate-700" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">PAN</label>
                  <Input id="pan" name="pan" value={formData.pan || ''} onChange={handleChange} placeholder="PAN" className="border-slate-300 dark:border-slate-700" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">Contact person</label>
                  <Input id="contactPerson" name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} placeholder="Contact person" className="border-slate-300 dark:border-slate-700" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">State</label>
                  <Input id="state" name="state" value={formData.state || ''} onChange={handleChange} placeholder="State" className="border-slate-300 dark:border-slate-700" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">State code</label>
                  <Input id="code" name="code" value={formData.code || ''} onChange={handleChange} placeholder="State code" className="border-slate-300 dark:border-slate-700" />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">Address</label>
                  <Textarea id="address" name="address" value={formData.address || ''} onChange={handleChange} placeholder="Company address" rows={3} className="border-slate-300 dark:border-slate-700" />
                </div>
              </div>

              <section className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Bank details</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">Bank name</label>
                    <Input id="bankName" name="bankName" value={formData.bankName || ''} onChange={handleChange} placeholder="Bank name" className="border-slate-300 dark:border-slate-700" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">Account name</label>
                    <Input id="bankAccountName" name="bankAccountName" value={formData.bankAccountName || ''} onChange={handleChange} placeholder="Account name" className="border-slate-300 dark:border-slate-700" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">Account number</label>
                    <Input id="bankAccountNumber" name="bankAccountNumber" value={formData.bankAccountNumber || ''} onChange={handleChange} placeholder="Account number" className="border-slate-300 dark:border-slate-700" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">IFSC code</label>
                    <Input id="bankIfsc" name="bankIfsc" value={formData.bankIfsc || ''} onChange={handleChange} placeholder="IFSC code" className="border-slate-300 dark:border-slate-700" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">Branch</label>
                    <Input id="bankBranch" name="bankBranch" value={formData.bankBranch || ''} onChange={handleChange} placeholder="Branch" className="border-slate-300 dark:border-slate-700" />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
