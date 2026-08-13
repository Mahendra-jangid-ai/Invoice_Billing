import { findIndianState } from '@/lib/indian-states'

export type FieldErrors = Record<string, string>

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}

export function required(value: string | undefined, label: string): string | null {
  if (!value?.trim()) return `${label} is required`
  return null
}

export function email(value: string | undefined): string | null {
  if (!value?.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Enter a valid email address'
  return null
}

export function phone(value: string | undefined, requiredField = false): string | null {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return requiredField ? 'Phone number is required' : null
  const digits = trimmed.replace(/\D/g, '')
  if (!/^[6-9]\d{9}$/.test(digits)) return 'Enter a valid 10-digit Indian mobile number'
  return null
}

export function gstNumber(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return null
  const gst = trimmed.toUpperCase()
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)) {
    return 'Enter a valid 15-character GST number'
  }
  return null
}

export function panNumber(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return null
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(trimmed.toUpperCase())) {
    return 'Enter a valid PAN (e.g. ABCDE1234F)'
  }
  return null
}

export function ifscCode(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return null
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(trimmed.toUpperCase())) {
    return 'Enter a valid IFSC code'
  }
  return null
}

export function indianState(value: string | undefined, requiredField = false): string | null {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return requiredField ? 'Please select a state' : null
  if (!findIndianState(trimmed)) return 'Please select a valid Indian state'
  return null
}

export function positiveNumber(value: number | string | undefined, label: string): string | null {
  const num = Number(value)
  if (Number.isNaN(num)) return `${label} must be a number`
  if (num < 0) return `${label} cannot be negative`
  return null
}

export function positiveNumberStrict(value: number | string | undefined, label: string): string | null {
  const num = Number(value)
  if (Number.isNaN(num)) return `${label} must be a number`
  if (num <= 0) return `${label} must be greater than zero`
  return null
}

export function minLength(value: string | undefined, min: number, label: string): string | null {
  if (!value?.trim()) return `${label} is required`
  if (value.trim().length < min) return `${label} must be at least ${min} characters`
  return null
}

export function setFieldError(errors: FieldErrors, field: string, message: string | null) {
  if (message) errors[field] = message
}

export const setError = setFieldError

export function formatFieldErrors(errors: FieldErrors, limit = 4): string {
  const messages = Object.values(errors).filter(Boolean)
  if (messages.length === 0) return 'Please check the form and try again.'
  const shown = messages.slice(0, limit)
  const suffix = messages.length > limit ? `\n…and ${messages.length - limit} more issue(s).` : ''
  return `${shown.join('\n')}${suffix}`
}

export function validateCustomerForm(data: {
  name?: string
  email?: string
  phone?: string
  gstnumber?: string
  state?: string
  address?: string
}) {
  const errors: FieldErrors = {}
  setError(errors, 'name', minLength(data.name, 2, 'Name'))
  setError(errors, 'email', email(data.email))
  setError(errors, 'phone', phone(data.phone))
  setError(errors, 'gstnumber', gstNumber(data.gstnumber))
  setError(errors, 'state', indianState(data.state))
  return errors
}

export function validateItemForm(data: {
  name?: string
  unitprice?: number
  hsnsac?: string
}) {
  const errors: FieldErrors = {}
  setError(errors, 'name', minLength(data.name, 2, 'Item name'))
  setError(errors, 'unitprice', positiveNumber(data.unitprice, 'Unit price'))
  if (data.hsnsac?.trim() && !/^\d{4,8}$/.test(data.hsnsac.trim())) {
    errors.hsnsac = 'HSN/SAC must be 4–8 digits'
  }
  return errors
}

export function validateCompanyForm(data: {
  name?: string
  email?: string
  phone?: string
  gstnumber?: string
  pan?: string
  state?: string
  address?: string
  bankIfsc?: string
}) {
  const errors: FieldErrors = {}
  setError(errors, 'name', minLength(data.name, 2, 'Company name'))
  setError(errors, 'email', email(data.email))
  setError(errors, 'phone', phone(data.phone, true))
  setError(errors, 'gstnumber', gstNumber(data.gstnumber))
  setError(errors, 'pan', panNumber(data.pan))
  setError(errors, 'state', indianState(data.state, true))
  setError(errors, 'address', minLength(data.address, 5, 'Address'))
  setError(errors, 'bankIfsc', ifscCode(data.bankIfsc))
  return errors
}

export function validateWebSettings(data: {
  websiteName?: string
  supportEmail?: string
  supportPhone?: string
}) {
  const errors: FieldErrors = {}
  setError(errors, 'websiteName', minLength(data.websiteName, 2, 'Website name'))
  if (data.supportEmail?.trim()) {
    setError(errors, 'supportEmail', email(data.supportEmail))
  }
  if (data.supportPhone?.trim()) {
    setError(errors, 'supportPhone', phone(data.supportPhone))
  }
  return errors
}

export function validateInvoiceForm(data: {
  invoiceNumber?: string
  date?: string
  billToName?: string
  billToGstin?: string
  billToState?: string
  shipToName?: string
  shipToGstin?: string
  shipToState?: string
  sameAsBillTo?: boolean
  placeOfService?: string
  lineItems?: Array<{ description?: string; quantity?: number; rate?: number }>
}) {
  const errors: FieldErrors = {}
  setError(errors, 'invoiceNumber', required(data.invoiceNumber, 'Invoice number'))
  setError(errors, 'date', required(data.date, 'Invoice date'))
  setError(errors, 'billToName', minLength(data.billToName, 2, 'Bill to party name'))
  setError(errors, 'billToGstin', gstNumber(data.billToGstin))
  setError(errors, 'billToState', indianState(data.billToState))

  if (!data.sameAsBillTo) {
    setError(errors, 'shipToName', minLength(data.shipToName, 2, 'Ship to party name'))
    setError(errors, 'shipToGstin', gstNumber(data.shipToGstin))
    setError(errors, 'shipToState', indianState(data.shipToState))
  }

  setError(errors, 'placeOfService', indianState(data.placeOfService))

  if (!data.lineItems?.length) {
    errors.lineItems = 'Add at least one line item'
  } else {
    data.lineItems.forEach((item, index) => {
      if (!item.description?.trim()) {
        errors[`lineItems.${index}.description`] = 'Description is required'
      }
      if (positiveNumberStrict(item.quantity, 'Quantity')) {
        errors[`lineItems.${index}.quantity`] = positiveNumberStrict(item.quantity, 'Quantity')!
      }
      if (positiveNumberStrict(item.rate, 'Rate')) {
        errors[`lineItems.${index}.rate`] = positiveNumberStrict(item.rate, 'Rate')!
      }
    })
  }

  return errors
}
