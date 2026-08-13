import type { Company } from '@/lib/context'
import { hasErrors, validateCompanyForm } from '@/lib/validation'

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim())
}

/** True when company profile + bank details are saved and valid for invoicing. */
export function isOnboardingComplete(company: Company): boolean {
  const errors = validateCompanyForm(company)
  if (hasErrors(errors)) return false

  if (!hasText(company.bankName)) return false
  if (!hasText(company.bankAccountName)) return false
  if (!hasText(company.bankAccountNumber)) return false
  if (!hasText(company.bankIfsc)) return false
  if (!hasText(company.bankBranch)) return false

  return true
}

export function displayValue(value: string | undefined | null, fallback = '—'): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}
