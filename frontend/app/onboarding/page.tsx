'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useBilling, type Company } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField, fieldClassName } from '@/components/form-field'
import { StateCodeFields } from '@/components/state-select'
import { COMPANY_PLACEHOLDERS } from '@/lib/form-placeholders'
import { getErrorMessage } from '@/lib/api-client'
import { useFeedback } from '@/components/confirm-provider'
import { formatFieldErrors, hasErrors, validateCompanyForm, type FieldErrors } from '@/lib/validation'
import { isOnboardingComplete } from '@/lib/onboarding'
import { clearPendingOnboarding } from '@/lib/pending-onboarding'
import { Building2, CheckCircle2, Landmark, Loader2 } from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Company profile', icon: Building2 },
  { id: 2, title: 'Bank details', icon: Landmark },
] as const

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { company, updateCompany, loading } = useBilling()
  const { warning, error: showError } = useFeedback()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Company>(company)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFormData((prev) => ({
      ...company,
      email: company.email || user?.email || prev.email,
      name: company.name || user?.name || prev.name,
    }))
  }, [company, user])

  useEffect(() => {
    if (!loading && isOnboardingComplete(company)) {
      clearPendingOnboarding()
      router.replace('/dashboard')
    }
  }, [company, loading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      const nextErrors = validateCompanyForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gstnumber: formData.gstnumber,
        pan: formData.pan,
        state: formData.state,
        address: formData.address,
      })
      setErrors(nextErrors)
      if (hasErrors(nextErrors)) {
        warning({
          title: 'Please complete company details',
          description: formatFieldErrors(nextErrors),
        })
        return false
      }
      return true
    }

    const bankErrors: FieldErrors = {}
    if (!formData.bankName?.trim()) bankErrors.bankName = 'Bank name is required'
    if (!formData.bankAccountName?.trim()) bankErrors.bankAccountName = 'Account name is required'
    if (!formData.bankAccountNumber?.trim()) bankErrors.bankAccountNumber = 'Account number is required'
    if (!formData.bankIfsc?.trim()) bankErrors.bankIfsc = 'IFSC is required'
    if (!formData.bankBranch?.trim()) bankErrors.bankBranch = 'Branch is required'
    const ifscErrors = validateCompanyForm({ bankIfsc: formData.bankIfsc })
    if (ifscErrors.bankIfsc) bankErrors.bankIfsc = ifscErrors.bankIfsc

    setErrors(bankErrors)
    if (hasErrors(bankErrors)) {
      warning({
        title: 'Please complete bank details',
        description: formatFieldErrors(bankErrors),
      })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep(1)) return
    setStep(2)
  }

  const handleFinish = async () => {
    if (!validateStep(1) || !validateStep(2)) return

    setSaving(true)
    try {
      await updateCompany(formData)
      clearPendingOnboarding()
      router.replace('/dashboard')
      router.refresh()
    } catch (err) {
      showError({
        title: 'Could not save',
        description: getErrorMessage(err, 'Failed to save your company profile'),
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F7FB]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EFF6FF] to-[#F6F7FB] px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="" className="mx-auto mb-4 h-10 w-auto object-contain" />
          <h1 className="text-2xl font-bold text-slate-900">Set up your business</h1>
          <p className="mt-2 text-sm text-slate-600">
            Add your company and bank details once. They will appear on every invoice you create.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-3">
          {STEPS.map((item) => {
            const Icon = item.icon
            const active = step === item.id
            const done = step > item.id
            return (
              <div key={item.id} className="flex items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${
                    done
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : active
                        ? 'border-[#2563EB] bg-[#2563EB] text-white'
                        : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`hidden text-sm font-medium sm:inline ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                  {item.title}
                </span>
              </div>
            )
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Company profile</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField label="Company name" required error={errors.name}>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={COMPANY_PLACEHOLDERS.name}
                      className={fieldClassName(errors.name, 'border-slate-300')}
                    />
                  </FormField>
                </div>
                <FormField label="Email" required error={errors.email}>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={COMPANY_PLACEHOLDERS.email}
                    className={fieldClassName(errors.email, 'border-slate-300')}
                  />
                </FormField>
                <FormField label="Phone" required error={errors.phone}>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={COMPANY_PLACEHOLDERS.phone}
                    className={fieldClassName(errors.phone, 'border-slate-300')}
                  />
                </FormField>
                <FormField label="GST number" required error={errors.gstnumber}>
                  <Input
                    name="gstnumber"
                    value={formData.gstnumber}
                    onChange={handleChange}
                    placeholder={COMPANY_PLACEHOLDERS.gstnumber}
                    className={fieldClassName(errors.gstnumber, 'border-slate-300')}
                  />
                </FormField>
                <FormField label="PAN" required error={errors.pan}>
                  <Input
                    name="pan"
                    value={formData.pan || ''}
                    onChange={handleChange}
                    placeholder={COMPANY_PLACEHOLDERS.pan}
                    className={fieldClassName(errors.pan, 'border-slate-300')}
                  />
                </FormField>
                <FormField label="Contact person">
                  <Input
                    name="contactPerson"
                    value={formData.contactPerson || ''}
                    onChange={handleChange}
                    placeholder={COMPANY_PLACEHOLDERS.contactPerson}
                    className="field-input border-slate-300"
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <StateCodeFields
                    stateValue={formData.state || ''}
                    codeValue={formData.code || ''}
                    onChange={(state, code) => setFormData((prev) => ({ ...prev, state, code }))}
                    stateError={errors.state}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <FormField label="Address" required error={errors.address}>
                    <Textarea
                      name="address"
                      value={formData.address || ''}
                      onChange={handleChange}
                      placeholder={COMPANY_PLACEHOLDERS.address}
                      rows={3}
                      className={fieldClassName(errors.address, 'border-slate-300 min-h-[88px]')}
                    />
                  </FormField>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="button" onClick={handleNext} className="min-w-[120px]">
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Bank details</h2>
              <p className="text-sm text-slate-600">Shown on invoice PDFs for payment collection.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField label="Bank name" required error={errors.bankName}>
                    <Input
                      name="bankName"
                      value={formData.bankName || ''}
                      onChange={handleChange}
                      placeholder={COMPANY_PLACEHOLDERS.bankName}
                      className={fieldClassName(errors.bankName, 'border-slate-300')}
                    />
                  </FormField>
                </div>
                <FormField label="Account name" required error={errors.bankAccountName}>
                  <Input
                    name="bankAccountName"
                    value={formData.bankAccountName || ''}
                    onChange={handleChange}
                    placeholder={COMPANY_PLACEHOLDERS.bankAccountName}
                    className={fieldClassName(errors.bankAccountName, 'border-slate-300')}
                  />
                </FormField>
                <FormField label="Account number" required error={errors.bankAccountNumber}>
                  <Input
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber || ''}
                    onChange={handleChange}
                    placeholder={COMPANY_PLACEHOLDERS.bankAccountNumber}
                    className={fieldClassName(errors.bankAccountNumber, 'border-slate-300')}
                  />
                </FormField>
                <FormField label="IFSC" required error={errors.bankIfsc}>
                  <Input
                    name="bankIfsc"
                    value={formData.bankIfsc || ''}
                    onChange={handleChange}
                    placeholder={COMPANY_PLACEHOLDERS.bankIfsc}
                    className={fieldClassName(errors.bankIfsc, 'border-slate-300')}
                  />
                </FormField>
                <FormField label="Branch" required error={errors.bankBranch}>
                  <Input
                    name="bankBranch"
                    value={formData.bankBranch || ''}
                    onChange={handleChange}
                    placeholder={COMPANY_PLACEHOLDERS.bankBranch}
                    className={fieldClassName(errors.bankBranch, 'border-slate-300')}
                  />
                </FormField>
              </div>
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" onClick={handleFinish} disabled={saving} className="min-w-[140px] gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Open app
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
