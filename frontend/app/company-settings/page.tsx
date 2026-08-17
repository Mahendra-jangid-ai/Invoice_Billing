'use client'

import { useState, useEffect } from 'react'
import { useBilling } from '@/lib/context'
import { AppLayout } from '@/app/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Trash2, Loader2, Edit, X, Lock, Check } from 'lucide-react'
import { getErrorMessage } from '@/lib/api-client'
import { COMPANY_PLACEHOLDERS } from '@/lib/form-placeholders'
import { PageHero } from '@/components/page-hero'
import { FormActions } from '@/components/form-actions'
import { FormField, fieldClassName } from '@/components/form-field'
import { StateCodeFields } from '@/components/state-select'
import { useConfirm, useFeedback } from '@/components/confirm-provider'
import { type FieldErrors, formatFieldErrors, hasErrors, validateCompanyForm } from '@/lib/validation'
import { cn } from '@/lib/utils'

export default function CompanySettingsPage() {
  const { company, updateCompany } = useBilling()
  const { confirm } = useConfirm()
  const { warning, success, error: showError } = useFeedback()
  const [formData, setFormData] = useState(company)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setFormData(company)
    // If company data exists, start in locked/view mode; otherwise start in edit mode
    if (!company.name) {
      setIsEditing(true)
    } else {
      setIsEditing(false)
    }
  }, [company])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!isEditing) return
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 500 * 1024) {
        warning({
          title: 'File too large',
          description: 'Please select an image under 500KB.',
        })
        return
      }
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        warning({
          title: 'Invalid file type',
          description: 'Please upload a PNG, JPEG, or WebP image.',
        })
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
    if (!isEditing) return
    confirm({
      title: 'Remove logo?',
      description: 'Are you sure you want to remove the company logo?',
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm: () => {
        setFormData((prev) => ({ ...prev, logoUrl: '' }))
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditing) return

    const nextErrors = validateCompanyForm(formData)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) {
      warning({
        title: 'Please fix the form',
        description: formatFieldErrors(nextErrors),
      })
      return
    }

    try {
      setSaving(true)
      await updateCompany(formData)
      setIsEditing(false)
      success({
        title: 'Saved successfully',
        description: 'Company profile has been updated and locked.',
      })
    } catch (err) {
      showError({
        title: 'Save failed',
        description: getErrorMessage(err, 'Failed to save company profile'),
      })
    } finally {
      setSaving(false)
    }
  }

  const disabledInputClass = !isEditing ? 'bg-slate-50 text-slate-700 cursor-not-allowed border-slate-200' : 'border-slate-300'

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 animate-fade-in">
        <PageHero
          label="Manage"
          title="Company profile"
          description="This info appears on your invoices — logo, GST, bank details, and contact."
          actions={
            isEditing ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData(company)
                  setErrors({})
                  setIsEditing(false)
                }}
                className="w-full gap-2 sm:w-auto"
              >
                <X className="h-4 w-4" />
                Cancel Edit
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full gap-2 sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8]"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            )
          }
        />

        <div className="premium-card p-5 sm:p-6 space-y-6">
          {/* Header Status & Quick Edit Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition",
                isEditing
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              )}>
                {isEditing ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Editing Mode
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 text-emerald-600" />
                    Saved & Locked
                  </>
                )}
              </span>
            </div>

            {!isEditing ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData(company)
                  setErrors({})
                  setIsEditing(false)
                }}
                className="gap-1.5 text-xs"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            )}
          </div>

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
                  <label className={cn(
                    "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition",
                    isEditing ? "cursor-pointer hover:bg-slate-50" : "cursor-not-allowed opacity-60"
                  )}>
                    <Upload className="h-4 w-4" />
                    Choose image
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileUpload}
                      disabled={!isEditing}
                      className="hidden"
                    />
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveLogo}
                    disabled={!isEditing || !formData.logoUrl}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
                <p className="mt-2 text-xs text-slate-500">PNG, JPEG or WebP — max 500KB.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField label="Company name" required error={errors.name}>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder={COMPANY_PLACEHOLDERS.name}
                      className={fieldClassName(errors.name, disabledInputClass)}
                    />
                  </FormField>
                </div>
                <FormField label="Email" required error={errors.email}>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={COMPANY_PLACEHOLDERS.email}
                    className={fieldClassName(errors.email, disabledInputClass)}
                  />
                </FormField>
                <FormField label="Phone" required error={errors.phone}>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={COMPANY_PLACEHOLDERS.phone}
                    className={fieldClassName(errors.phone, disabledInputClass)}
                  />
                </FormField>
                <FormField label="GST number" error={errors.gstnumber}>
                  <Input
                    id="gstnumber"
                    name="gstnumber"
                    value={formData.gstnumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={COMPANY_PLACEHOLDERS.gstnumber}
                    className={fieldClassName(errors.gstnumber, disabledInputClass)}
                  />
                </FormField>
                <FormField label="PAN" error={errors.pan}>
                  <Input
                    id="pan"
                    name="pan"
                    value={formData.pan || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={COMPANY_PLACEHOLDERS.pan}
                    className={fieldClassName(errors.pan, disabledInputClass)}
                  />
                </FormField>
                <FormField label="Contact person">
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={COMPANY_PLACEHOLDERS.contactPerson}
                    className={cn('field-input', disabledInputClass)}
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <StateCodeFields
                    stateValue={formData.state || ''}
                    codeValue={formData.code || ''}
                    onChange={(state, code) => setFormData((prev) => ({ ...prev, state, code }))}
                    stateError={errors.state}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <FormField label="Address" required error={errors.address}>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder={COMPANY_PLACEHOLDERS.address}
                      rows={3}
                      className={fieldClassName(errors.address, cn('min-h-[88px]', disabledInputClass))}
                    />
                  </FormField>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <h3 className="card-heading mb-4">Bank details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bank name</label>
                    <Input
                      id="bankName"
                      name="bankName"
                      value={formData.bankName || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder={COMPANY_PLACEHOLDERS.bankName}
                      className={cn('field-input', disabledInputClass)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account name</label>
                    <Input
                      id="bankAccountName"
                      name="bankAccountName"
                      value={formData.bankAccountName || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder={COMPANY_PLACEHOLDERS.bankAccountName}
                      className={cn('field-input', disabledInputClass)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account number</label>
                    <Input
                      id="bankAccountNumber"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder={COMPANY_PLACEHOLDERS.bankAccountNumber}
                      className={cn('field-input', disabledInputClass)}
                    />
                  </div>
                  <div>
                    <FormField label="IFSC" error={errors.bankIfsc}>
                      <Input
                        id="bankIfsc"
                        name="bankIfsc"
                        value={formData.bankIfsc || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder={COMPANY_PLACEHOLDERS.bankIfsc}
                        className={fieldClassName(errors.bankIfsc, disabledInputClass)}
                      />
                    </FormField>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Branch</label>
                    <Input
                      id="bankBranch"
                      name="bankBranch"
                      value={formData.bankBranch || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder={COMPANY_PLACEHOLDERS.bankBranch}
                      className={cn('field-input', disabledInputClass)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <FormActions className="is-sticky mt-6">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving changes…' : 'Save changes'}
              </Button>
            </FormActions>
          )}
        </div>
      </form>
    </AppLayout>
  )
}