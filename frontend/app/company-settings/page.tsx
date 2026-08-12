'use client'

import { useState, useEffect } from 'react'
import { useBilling } from '@/lib/context'
import { AppLayout } from '@/app/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Upload, Trash2 } from 'lucide-react'
import { ApiErrorBanner } from '@/components/api-error-banner'
import { getErrorMessage } from '@/lib/api-client'
import { COMPANY_PLACEHOLDERS } from '@/lib/form-placeholders'
import { PageHero } from '@/components/page-hero'
import { FormActions } from '@/components/form-actions'

export default function CompanySettingsPage() {
  const { company, updateCompany } = useBilling()
  const [formData, setFormData] = useState(company)
  const [savedMessage, setSavedMessage] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setFormData(company)
  }, [company])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 500 * 1024) {
        alert('File size is too large. Please select an image under 500KB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    try {
      await updateCompany(formData)
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to save company profile'))
    }
  }

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 animate-fade-in">
        <ApiErrorBanner message={saveError} onDismiss={() => setSaveError(null)} />

        <PageHero
          label="Manage"
          title="Company profile"
          description="This info appears on your invoices — logo, GST, bank details, and contact."
          footer={
            savedMessage ? (
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
                <CheckCircle className="h-4 w-4" />
                Changes saved
              </div>
            ) : null
          }
        />

        <div className="premium-card p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <h2 className="card-heading">Live preview</h2>
                <p className="card-subtext">How clients see you on invoices.</p>

                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <p><span className="text-slate-500">Name</span><br />{formData.name || '—'}</p>
                  <p><span className="text-slate-500">Email</span><br />{formData.email || '—'}</p>
                  <p><span className="text-slate-500">Phone</span><br />{formData.phone || '—'}</p>
                  <p><span className="text-slate-500">GST</span><br />{formData.gstnumber || '—'}</p>
                  <p><span className="text-slate-500">Address</span><br />{formData.address || '—'}</p>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-500 mb-3">Logo</p>
                <div className="flex h-20 items-center justify-center rounded-lg bg-slate-50">
                  {formData.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.logoUrl} alt="Company logo" className="max-h-full object-contain" />
                  ) : (
                    <p className="text-sm text-slate-400">No logo yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <label className="mb-2 block text-sm font-medium text-slate-800">Upload logo</label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                    <Upload className="h-4 w-4" />
                    Choose image
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <Button type="button" variant="outline" onClick={handleRemoveLogo} className="gap-2 w-full sm:w-auto">
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
                <p className="mt-2 text-xs text-slate-500">PNG, JPG or SVG — max 5MB.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company name</label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.name} className="field-input border-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.email} className="field-input border-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.phone} className="field-input border-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">GST number</label>
                  <Input id="gstnumber" name="gstnumber" value={formData.gstnumber} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.gstnumber} className="field-input border-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">PAN</label>
                  <Input id="pan" name="pan" value={formData.pan || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.pan} className="field-input border-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact person</label>
                  <Input id="contactPerson" name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.contactPerson} className="field-input border-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">State</label>
                  <Input id="state" name="state" value={formData.state || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.state} className="field-input border-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">State code</label>
                  <Input id="code" name="code" value={formData.code || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.code} className="field-input border-slate-300" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address</label>
                  <Textarea id="address" name="address" value={formData.address || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.address} rows={3} className="field-input border-slate-300 min-h-[88px]" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <h3 className="card-heading mb-4">Bank details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bank name</label>
                    <Input id="bankName" name="bankName" value={formData.bankName || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.bankName} className="field-input border-slate-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account name</label>
                    <Input id="bankAccountName" name="bankAccountName" value={formData.bankAccountName || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.bankAccountName} className="field-input border-slate-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account number</label>
                    <Input id="bankAccountNumber" name="bankAccountNumber" value={formData.bankAccountNumber || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.bankAccountNumber} className="field-input border-slate-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">IFSC</label>
                    <Input id="bankIfsc" name="bankIfsc" value={formData.bankIfsc || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.bankIfsc} className="field-input border-slate-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Branch</label>
                    <Input id="bankBranch" name="bankBranch" value={formData.bankBranch || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.bankBranch} className="field-input border-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FormActions className="is-sticky mt-6">
            <Button type="submit" className="gap-2">
              Save changes
            </Button>
          </FormActions>
        </div>
      </form>
    </AppLayout>
  )
}