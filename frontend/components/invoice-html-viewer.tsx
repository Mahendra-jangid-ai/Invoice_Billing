'use client'

import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useBilling, type Invoice } from '@/lib/context'
import {
  buildInvoiceDisplayData,
  formatInvoiceCurrency,
  formatInvoiceCurrencyPlain,
} from '@/lib/invoice-display-data'

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 border-b border-slate-200 py-1.5 text-[10px]">
      <span className="w-[42%] text-slate-500">{label}</span>
      <span className="w-[55%] text-right font-semibold text-slate-900">{value}</span>
    </div>
  )
}

function InvoiceHtmlContent({ data }: { data: ReturnType<typeof buildInvoiceDisplayData> }) {
  const { invoice, company, companyName, companyAddress, companyGst, companyState, companyStateCode, contactLine } =
    data

  const invoiceDate = invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '-'

  return (
    <article className="mx-auto w-full max-w-[820px] bg-white p-3 text-slate-900 sm:p-4">
      {/* Header — matches PDF */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-900 pb-3">
        <div className="w-[35%]">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt="" className="max-h-20 max-w-[160px] object-contain" />
          ) : (
            <div className="inline-block rounded-md bg-slate-900 px-3 py-2 text-sm font-bold uppercase text-white">
              {companyName}
            </div>
          )}
        </div>
        <div className="w-[65%] text-right text-[10px] leading-relaxed text-slate-600">
          {company.logoUrl && <p className="text-sm font-bold uppercase text-slate-900">{companyName}</p>}
          <p className="mt-1">{companyAddress}</p>
          <p className="mt-1 font-bold text-slate-900">GSTIN NO. : {companyGst}</p>
          {contactLine ? <p className="mt-1">{contactLine}</p> : null}
        </div>
      </div>

      {/* Banner */}
      <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-white">
        <span className="text-[11px] font-bold uppercase tracking-wide">Tax Invoice</span>
        <span className="text-[9px] opacity-85">Original for Recipient</span>
      </div>

      {/* Supplier + Invoice meta */}
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[10px]">
          <p className="mb-2 text-[10px] font-bold uppercase text-slate-900">Supplier</p>
          <p>{companyName}</p>
          <p className="mt-1">{companyAddress}</p>
          <p className="mt-1">GSTIN: {companyGst}</p>
          {contactLine ? <p className="mt-1">{contactLine}</p> : null}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <MetaRow label="Invoice No" value={invoice.invoiceNumber || '-'} />
          <MetaRow label="Invoice Date" value={invoiceDate} />
          <MetaRow label="WO No." value={invoice.woNumber || '-'} />
          <MetaRow label="Description" value={invoice.descriptionOfService || '-'} />
          <MetaRow label="Period of Service" value={invoice.periodOfService || '-'} />
          <MetaRow label="Charge Type" value={invoice.reverseCharge || 'No'} />
          <MetaRow label="Place of Supply" value={invoice.placeOfService || companyState} />
          <MetaRow label="Place of Supply Code" value={invoice.placeOfServiceCode || companyStateCode} />
        </div>
      </div>

      {/* Bill To / Ship To */}
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3 text-[10px]">
          <p className="mb-2 font-bold uppercase text-slate-900">Bill To</p>
          <p className="font-semibold text-slate-900">{data.billTo.name || '-'}</p>
          <p className="mt-1 text-slate-600">{data.billTo.address || '-'}</p>
          <p className="mt-1 text-slate-600">GSTIN: {data.billTo.gstin || '-'}</p>
          <p className="text-slate-600">
            State: {data.billTo.state || '-'} ({data.billTo.code || '-'})
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 text-[10px]">
          <p className="mb-2 font-bold uppercase text-slate-900">Ship To</p>
          <p className="font-semibold text-slate-900">{data.shipTo.name || data.billTo.name || '-'}</p>
          <p className="mt-1 text-slate-600">{data.shipTo.address || data.billTo.address || '-'}</p>
          <p className="mt-1 text-slate-600">GSTIN: {data.shipTo.gstin || data.billTo.gstin || '-'}</p>
          <p className="text-slate-600">
            State: {data.shipTo.state || data.billTo.state || '-'} ({data.shipTo.code || data.billTo.code || '-'})
          </p>
        </div>
      </div>

      {/* Items table — same columns as PDF */}
      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-300">
        <table className="min-w-[640px] w-full border-collapse text-[9px]">
          <thead>
            <tr className="bg-slate-900 text-white">
              {['Sr.', 'Description', 'SAC', 'Unit', 'Qty', 'Rate', 'Taxable', 'CGST', 'SGST', 'Total'].map((h) => (
                <th key={h} className="border-r border-slate-700 px-1.5 py-2 text-center font-bold last:border-r-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((item, index) => (
              <tr key={item.index} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                <td className="border-r border-slate-200 px-1.5 py-1.5 text-center">{item.index}</td>
                <td className="border-r border-slate-200 px-1.5 py-1.5">{item.description}</td>
                <td className="border-r border-slate-200 px-1.5 py-1.5 text-center">{item.sacCode}</td>
                <td className="border-r border-slate-200 px-1.5 py-1.5 text-center">{item.unit}</td>
                <td className="border-r border-slate-200 px-1.5 py-1.5 text-center">{item.qty}</td>
                <td className="border-r border-slate-200 px-1.5 py-1.5 text-right whitespace-nowrap">
                  {item.rate ? formatInvoiceCurrency(item.rate) : '-'}
                </td>
                <td className="border-r border-slate-200 px-1.5 py-1.5 text-right whitespace-nowrap">
                  {formatInvoiceCurrency(item.lineAmount)}
                </td>
                <td className="border-r border-slate-200 px-1.5 py-1.5 text-right whitespace-nowrap">
                  {formatInvoiceCurrency(item.lineCgst)}
                </td>
                <td className="border-r border-slate-200 px-1.5 py-1.5 text-right whitespace-nowrap">
                  {formatInvoiceCurrency(item.lineSgst)}
                </td>
                <td className="px-1.5 py-1.5 text-right whitespace-nowrap">{formatInvoiceCurrency(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-3 rounded-lg border border-slate-300 p-3 text-[10px]">
        <div className="flex justify-between py-1">
          <span className="text-slate-600">Taxable Value</span>
          <span className="font-semibold">{formatInvoiceCurrencyPlain(data.subtotal)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-slate-600">Total CGST ({data.cgstPercentage}%)</span>
          <span className="font-semibold">{formatInvoiceCurrencyPlain(data.totalCgst)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-slate-600">Total SGST ({data.sgstPercentage}%)</span>
          <span className="font-semibold">{formatInvoiceCurrencyPlain(data.totalSgst)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-slate-600">Cash Discount</span>
          <span className="font-semibold">-{formatInvoiceCurrencyPlain(data.cashDiscountAmount)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-[11px] font-bold">
          <span>Total Amount Payable</span>
          <span>{formatInvoiceCurrencyPlain(data.roundedNetTotal)}</span>
        </div>
      </div>

      {/* Amount in words */}
      <div className="mt-3 rounded-lg border border-slate-300 bg-slate-50 p-3 text-[10px]">
        <p className="font-bold text-blue-900">Amount in Words</p>
        <p className="mt-1 text-slate-900">INR {data.amountInWords}</p>
      </div>

      {/* Footer */}
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-[10px] text-slate-600">
          <p className="mb-2 font-bold text-slate-900">Bank Details</p>
          <p>Bank Name: {company.bankName || 'Axis Bank'}</p>
          <p>A/C Name: {company.bankAccountName || `${companyName} Bank A/c No.`}</p>
          <p>A/C No: {company.bankAccountNumber || '923020047215171'}</p>
          <p>IFSC: {company.bankIfsc || 'UTIB0001584'}</p>
          <p>Branch: {company.bankBranch || 'OLD NAGARDAS ROAD'}</p>
        </div>
        <div className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-[10px] text-slate-600">
          <p className="mb-2 font-bold text-slate-900">Terms & Signature</p>
          <p>Payment due within 15 days of invoice date. Late payment may attract interest.</p>
          <div className="mt-6 border-t border-slate-300 pt-2">
            <p className="font-bold text-slate-900">Authorised Signature</p>
          </div>
        </div>
      </div>
    </article>
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

  const displayData = useMemo(
    () => buildInvoiceDisplayData(invoice, company, customers),
    [invoice, company, customers],
  )

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

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

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-100 p-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-3">
        <InvoiceHtmlContent data={displayData} />
      </div>
    </div>,
    document.body,
  )
}
