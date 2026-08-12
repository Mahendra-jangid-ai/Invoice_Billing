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
      if (file.size > 5 * 1024 * 1024) {
        alert('File size is too large. Please select an image under 5MB.')
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
      <div className="space-y-6">
        <ApiErrorBanner message={saveError} onDismiss={() => setSaveError(null)} />
        <section className="rounded-[32px] border border-[#E5E7EB] bg-white/95 p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6B7280]">Company settings</p>
              <h1 className="mt-2 text-3xl font-semibold text-[#111827]">Company profile and branding</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#4B5563]">Update your company details, logo, and contact information for invoices and reports.</p>
            </div>
            <div className="flex items-center gap-3">
              {savedMessage && (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-2 text-sm text-[#15803D]">
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
              <div className="rounded-[26px] border border-[#E5E7EB] bg-[#F9FAFB] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">Company information</h2>
                    <p className="text-sm text-[#6B7280]">The details shown on invoices and customer communications.</p>
                  </div>
                  <div className="rounded-2xl bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white">Live data</div>
                </div>

                <div className="mt-5 grid gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">Company name</p>
                    <p className="mt-2 text-sm text-[#111827]">{formData.name || 'Not configured yet'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">Email</p>
                    <p className="mt-2 text-sm text-[#111827]">{formData.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">Phone</p>
                    <p className="mt-2 text-sm text-[#111827]">{formData.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">PAN</p>
                    <p className="mt-2 text-sm text-[#111827]">{formData.pan || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">GST number</p>
                    <p className="mt-2 text-sm text-[#111827]">{formData.gstnumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">Contact person</p>
                    <p className="mt-2 text-sm text-[#111827]">{formData.contactPerson || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">State</p>
                    <p className="mt-2 text-sm text-[#111827]">{formData.state || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">State code</p>
                    <p className="mt-2 text-sm text-[#111827]">{formData.code || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">Address</p>
                    <p className="mt-2 text-sm text-[#111827]">{formData.address || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-[#E5E7EB] bg-[#F9FAFB] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">Logo preview</p>
                <div className="mt-4 flex h-24 w-full items-center justify-center rounded-3xl border border-dashed border-[#D1D5DB] bg-white">
                  {formData.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.logoUrl} alt="Company logo" className="h-full object-contain" />
                  ) : (
                    <p className="text-sm text-[#6B7280]">No logo uploaded yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[26px] border border-[#E5E7EB] bg-[#F9FAFB] p-5">
                <label className="mb-2 block text-sm font-medium text-[#111827]">Upload logo</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]">
                    <Upload className="h-4 w-4" />
                    Choose image
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <Button type="button" variant="outline" onClick={handleRemoveLogo} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
                <p className="mt-3 text-sm text-[#6B7280]">Accepted PNG, JPG, SVG files under 5MB.</p>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#111827]">Company name</label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.name} className="border-[#E5E7EB]" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#111827]">Email</label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.email} className="border-[#E5E7EB]" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#111827]">Phone</label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.phone} className="border-[#E5E7EB]" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#111827]">GST number</label>
                  <Input id="gstnumber" name="gstnumber" value={formData.gstnumber} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.gstnumber} className="border-[#E5E7EB]" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#111827]">PAN</label>
                  <Input id="pan" name="pan" value={formData.pan || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.pan} className="border-[#E5E7EB]" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#111827]">Contact person</label>
                  <Input id="contactPerson" name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.contactPerson} className="border-[#E5E7EB]" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#111827]">State</label>
                  <Input id="state" name="state" value={formData.state || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.state} className="border-[#E5E7EB]" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#111827]">State code</label>
                  <Input id="code" name="code" value={formData.code || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.code} className="border-[#E5E7EB]" />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm font-medium text-[#111827]">Address</label>
                  <Textarea id="address" name="address" value={formData.address || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.address} rows={3} className="border-[#E5E7EB]" />
                </div>
              </div>

              <section className="rounded-[26px] border border-[#E5E7EB] bg-[#F9FAFB] p-5">
                <h3 className="mb-4 text-sm font-semibold text-[#111827]">Bank details</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-[#111827]">Bank name</label>
                    <Input id="bankName" name="bankName" value={formData.bankName || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.bankName} className="border-[#E5E7EB]" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-[#111827]">Account name</label>
                    <Input id="bankAccountName" name="bankAccountName" value={formData.bankAccountName || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.bankAccountName} className="border-[#E5E7EB]" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-[#111827]">Account number</label>
                    <Input id="bankAccountNumber" name="bankAccountNumber" value={formData.bankAccountNumber || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.bankAccountNumber} className="border-[#E5E7EB]" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-[#111827]">IFSC code</label>
                    <Input id="bankIfsc" name="bankIfsc" value={formData.bankIfsc || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.bankIfsc} className="border-[#E5E7EB]" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-[#111827]">Branch</label>
                    <Input id="bankBranch" name="bankBranch" value={formData.bankBranch || ''} onChange={handleChange} placeholder={COMPANY_PLACEHOLDERS.bankBranch} className="border-[#E5E7EB]" />
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