import type { Db } from 'mongodb'

const COUNTERS_COLLECTION = 'invoice_counters'
export const MIN_INVOICE_DIGITS = 4

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

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

export async function getMaxInvoiceSequence(db: Db, userId: string, prefix: string): Promise<number> {
  const pattern = new RegExp(`^${escapeRegExp(prefix)}-(\\d+)$`)
  const invoices = await db
    .collection('invoices')
    .find({ userId })
    .project({ invoiceNumber: 1 })
    .toArray()

  let maxNum = 0
  for (const inv of invoices) {
    const match = String(inv.invoiceNumber || '').match(pattern)
    if (match) {
      maxNum = Math.max(maxNum, parseInt(match[1], 10))
    }
  }
  return maxNum
}

export async function allocateNextInvoiceNumber(db: Db, userId: string): Promise<string> {
  const company = await db.collection('company').findOne({ userId })
  const prefix = String(company?.invoicePrefix || 'INV').trim() || 'INV'
  const counters = db.collection(COUNTERS_COLLECTION)

  const existingCounter = await counters.findOne({ userId, prefix })
  if (!existingCounter) {
    const maxFromInvoices = await getMaxInvoiceSequence(db, userId, prefix)
    try {
      await counters.insertOne({ userId, prefix, seq: maxFromInvoices })
    } catch {
      // Another request may have initialized the counter first.
    }
  }

  const updated = await counters.findOneAndUpdate(
    { userId, prefix },
    { $inc: { seq: 1 } },
    { returnDocument: 'after' },
  )

  const sequence = updated?.seq
  if (typeof sequence !== 'number' || sequence < 1) {
    throw new Error('Failed to allocate invoice number')
  }

  return formatInvoiceNumber(prefix, sequence)
}
