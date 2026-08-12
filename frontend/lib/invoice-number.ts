export const MIN_INVOICE_DIGITS = 4

/** Formats invoice numbers: min 4 digits, grows automatically after 9999. */
export function formatInvoiceNumber(
  prefix: string,
  sequence: number,
  minDigits = MIN_INVOICE_DIGITS,
): string {
  const normalizedPrefix = prefix.trim() || 'INV'
  const digitWidth = Math.max(minDigits, String(sequence).length)
  return `${normalizedPrefix}-${String(sequence).padStart(digitWidth, '0')}`
}

export function getNextInvoiceNumberFromList(
  invoices: { invoiceNumber?: string }[],
  prefix: string,
  minDigits = MIN_INVOICE_DIGITS,
): string {
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`^${escapedPrefix}-(\\d+)$`)
  const maxNum = invoices
    .map((inv) => {
      const match = inv.invoiceNumber?.match(pattern)
      return match ? parseInt(match[1], 10) : 0
    })
    .reduce((max, num) => Math.max(max, num), 0)

  return formatInvoiceNumber(prefix, maxNum + 1, minDigits)
}
