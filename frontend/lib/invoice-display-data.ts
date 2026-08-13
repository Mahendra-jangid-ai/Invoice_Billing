import type { Company, Customer, Invoice, InvoiceLineItem, InvoiceParty } from '@/lib/context'
import { displayValue } from '@/lib/onboarding'

export interface InvoiceLineDisplay {
  index: number
  description: string
  sacCode: string
  unit: string
  qty: number
  rate: number
  lineAmount: number
  lineCgst: number
  lineSgst: number
  lineTotal: number
}

export interface InvoiceDisplayData {
  invoice: Invoice
  company: Company
  companyName: string
  companyAddress: string
  companyGst: string
  companyState: string
  companyStateCode: string
  contactLine: string
  billTo: InvoiceParty
  shipTo: InvoiceParty
  itemsList: InvoiceLineItem[]
  subtotal: number
  cgstPercentage: number
  sgstPercentage: number
  totalCgst: number
  totalSgst: number
  rawTotal: number
  cashDiscountAmount: number
  roundedNetTotal: number
  amountInWords: string
  lineItems: InvoiceLineDisplay[]
}

export function formatInvoiceCurrency(value: number): string {
  return `₹\u00A0${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

export function formatInvoiceCurrencyPlain(value: number): string {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

export function getAmountInWords(num: number): string {
  if (num <= 0 || Number.isNaN(num)) return 'Zero Only'

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
  ]
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const convertTwoDigits = (n: number): string => {
    if (n < 20) return ones[n]
    const tenDigit = Math.floor(n / 10)
    const oneDigit = n % 10
    return (tens[tenDigit] + (oneDigit ? ` ${ones[oneDigit]}` : '')).trim()
  }

  const convertThreeDigits = (n: number): string => {
    const hundred = Math.floor(n / 100)
    const remainder = n % 100
    let str = ''
    if (hundred > 0) str += `${ones[hundred]} Hundred`
    if (remainder > 0) str += (str ? ' ' : '') + convertTwoDigits(remainder)
    return str
  }

  const crores = Math.floor(num / 10000000)
  const lakhs = Math.floor((num % 10000000) / 100000)
  const thousands = Math.floor((num % 100000) / 1000)
  const remainder = Math.floor(num % 1000)

  const parts: string[] = []
  if (crores > 0) parts.push(`${convertTwoDigits(crores)} Crore`)
  if (lakhs > 0) parts.push(`${convertTwoDigits(lakhs)} Lakh`)
  if (thousands > 0) parts.push(`${convertTwoDigits(thousands)} Thousand`)
  if (remainder > 0) parts.push(convertThreeDigits(remainder))

  return `${parts.join(' ')} Only`
}

export function buildInvoiceDisplayData(
  invoice: Invoice,
  company: Company,
  customers: Customer[],
): InvoiceDisplayData {
  const customer = customers.find((c) => String(c.id) === String(invoice.customerId))

  const billTo: InvoiceParty = invoice.billTo || {
    name: customer?.name || '',
    address: customer?.address || '',
    gstin: customer?.gstnumber || '',
    state: customer?.state || company.state || '',
    code: customer?.code || company.code || '',
  }

  const shipTo = invoice.sameAsBillTo ? billTo : invoice.shipTo || billTo
  const itemsList = invoice.items || []

  const subtotal = itemsList.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0
    const rate = Number(item.rate) || 0
    return sum + qty * rate
  }, 0)

  const taxPercentage = Number(invoice.taxPercentage) || 0
  const cgstPercentage = taxPercentage / 2
  const sgstPercentage = taxPercentage / 2
  const totalCgst = (subtotal * cgstPercentage) / 100
  const totalSgst = (subtotal * sgstPercentage) / 100
  const rawTotal = subtotal + totalCgst + totalSgst
  const cashDiscountAmount = invoice.cashDiscount?.discountAmount || 0
  const totalAfterDiscount = rawTotal - cashDiscountAmount
  const roundedNetTotal = Math.round(totalAfterDiscount)

  const lineItems: InvoiceLineDisplay[] = itemsList.map((item, index) => {
    const qty = Number(item.quantity) || 0
    const rate = Number(item.rate) || 0
    const lineAmount = qty * rate
    const lineCgst = (lineAmount * cgstPercentage) / 100
    const lineSgst = (lineAmount * sgstPercentage) / 100
    return {
      index: index + 1,
      description: item.description || '',
      sacCode: item.sacCode || '',
      unit: item.unit || '',
      qty,
      rate,
      lineAmount,
      lineCgst,
      lineSgst,
      lineTotal: lineAmount + lineCgst + lineSgst,
    }
  })

  return {
    invoice,
    company,
    companyName: displayValue(company.name),
    companyAddress: displayValue(company.address),
    companyGst: displayValue(company.gstnumber),
    companyState: displayValue(company.state),
    companyStateCode: displayValue(company.code),
    contactLine: [company.contactPerson || '', company.phone || ''].filter(Boolean).join(' • '),
    billTo,
    shipTo,
    itemsList,
    subtotal,
    cgstPercentage,
    sgstPercentage,
    totalCgst,
    totalSgst,
    rawTotal,
    cashDiscountAmount,
    roundedNetTotal,
    amountInWords: getAmountInWords(roundedNetTotal),
    lineItems,
  }
}
