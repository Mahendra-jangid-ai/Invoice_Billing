'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useBilling, type Invoice, type InvoiceParty } from '@/lib/context'

function formatInr(value: number): string {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getAmountInWords(num: number): string {
  if (num <= 0 || Number.isNaN(num)) return 'Zero Only'

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
  ]
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const two = (n: number) => (n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ''}`.trim())
  const three = (n: number) => {
    const h = Math.floor(n / 100)
    const r = n % 100
    return `${h ? `${ones[h]} Hundred` : ''}${h && r ? ' ' : ''}${r ? two(r) : ''}`.trim()
  }

  const parts: string[] = []
  const crores = Math.floor(num / 10000000)
  const lakhs = Math.floor((num % 10000000) / 100000)
  const thousands = Math.floor((num % 100000) / 1000)
  const remainder = Math.floor(num % 1000)

  if (crores) parts.push(`${two(crores)} Crore`)
  if (lakhs) parts.push(`${two(lakhs)} Lakh`)
  if (thousands) parts.push(`${two(thousands)} Thousand`)
  if (remainder) parts.push(three(remainder))

  return `${parts.join(' ')} Only`
}

function PartyBlock({ title, party }: { title: string; party: InvoiceParty }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{party.name || '—'}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{party.address || '—'}</p>
      <p className="mt-1 text-xs text-slate-600">GSTIN: {party.gstin || '—'}</p>
      <p className="text-xs text-slate-600">State: {party.state || '—'} ({party.code || '—'})</p>
    </div>
  )
}

export function InvoiceHtmlViewer({
  invoice,
  open,
  onClose,
}: {
  invoice: Invoice
  open: boolean
  onClose: () => void
}) {
  const { customers, company } = useBilling()

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  const customer = customers.find((c) => String(c.id) === String(invoice.customerId))
  const billTo: InvoiceParty = invoice.billTo || {
    name: customer?.name || 'Customer',
    address: customer?.address || '',
    gstin: customer?.gstnumber || '',
    state: customer?.state || company.state || '',
    code: customer?.code || company.code || '',
  }
  const shipTo = invoice.sameAsBillTo ? billTo : invoice.shipTo || billTo
  const items = invoice.items || []

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0)
  const taxPct = Number(invoice.taxPercentage) || 0
  const cgstPct = taxPct / 2
  const sgstPct = taxPct / 2
  const totalCgst = (subtotal * cgstPct) / 100
  const totalSgst = (subtotal * sgstPct) / 100
  const rawTotal = subtotal + totalCgst + totalSgst
  const discount = invoice.cashDiscount?.discountAmount || 0
  const netTotal = Math.round(rawTotal - discount)

  const companyName = company.name || 'Company'
  const title = invoice.invoiceNumber || 'Invoice'

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col bg-white" style={{ height: '100dvh' }}>
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{title}</p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 active:bg-slate-200"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-100 p-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <article className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="border-b border-slate-900 pb-3">
            <div className="flex items-start justify-between gap-3">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logoUrl} alt="" className="max-h-16 max-w-[140px] object-contain" />
              ) : (
                <p className="text-lg font-bold uppercase text-slate-900">{companyName}</p>
              )}
              <div className="text-right text-xs text-slate-600">
                <p className="font-bold text-slate-900">{companyName}</p>
                <p className="mt-1">{company.address}</p>
                <p className="mt-1 font-semibold">GSTIN: {company.gstnumber}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-white">
            Tax Invoice
          </div>

          <div className="mt-3 grid gap-2 text-xs">
            <div className="flex justify-between gap-2 border-b border-slate-100 py-1.5">
              <span className="text-slate-500">Invoice No</span>
              <span className="font-semibold text-slate-900">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-slate-100 py-1.5">
              <span className="text-slate-500">Date</span>
              <span className="font-semibold text-slate-900">
                {invoice.date ? new Date(invoice.date).toLocaleDateString('en-IN') : '—'}
              </span>
            </div>
            <div className="flex justify-between gap-2 border-b border-slate-100 py-1.5">
              <span className="text-slate-500">WO No.</span>
              <span className="font-semibold text-slate-900">{invoice.woNumber || '—'}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-slate-100 py-1.5">
              <span className="text-slate-500">Place of Supply</span>
              <span className="text-right font-semibold text-slate-900">{invoice.placeOfService || company.state}</span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <PartyBlock title="Bill To" party={billTo} />
            <PartyBlock title="Ship To" party={shipTo} />
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-left text-[11px]">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-2 py-2">#</th>
                  <th className="px-2 py-2">Item</th>
                  <th className="px-2 py-2 text-right">Qty</th>
                  <th className="px-2 py-2 text-right">Rate</th>
                  <th className="px-2 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const qty = Number(item.quantity) || 0
                  const rate = Number(item.rate) || 0
                  const line = qty * rate
                  const lineCgst = (line * cgstPct) / 100
                  const lineSgst = (line * sgstPct) / 100
                  const lineTotal = line + lineCgst + lineSgst
                  return (
                    <tr key={index} className="border-t border-slate-100">
                      <td className="px-2 py-2 text-slate-500">{index + 1}</td>
                      <td className="px-2 py-2 font-medium text-slate-900">{item.description || 'Service'}</td>
                      <td className="px-2 py-2 text-right">{qty}</td>
                      <td className="px-2 py-2 text-right">{formatInr(rate)}</td>
                      <td className="px-2 py-2 text-right font-semibold">{formatInr(lineTotal)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-1.5 rounded-lg border border-slate-200 p-3 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">Taxable Value</span><span>{formatInr(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">CGST ({cgstPct}%)</span><span>{formatInr(totalCgst)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">SGST ({sgstPct}%)</span><span>{formatInr(totalSgst)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between"><span className="text-slate-500">Discount</span><span>-{formatInr(discount)}</span></div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
              <span>Total Payable</span>
              <span>{formatInr(netTotal)}</span>
            </div>
          </div>

          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            <span className="font-semibold">Amount in words: </span>
            INR {getAmountInWords(netTotal)}
          </p>

          {company.bankName && (
            <div className="mt-3 rounded-lg border border-slate-200 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">Bank Details</p>
              <p className="mt-1">{company.bankName} · A/C {company.bankAccountNumber}</p>
              <p>IFSC {company.bankIfsc}</p>
            </div>
          )}
        </article>
      </div>
    </div>,
    document.body,
  )
}
