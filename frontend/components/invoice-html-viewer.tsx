'use client'

import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useBilling, type Invoice } from '@/lib/context'
import {
  buildInvoiceDisplayData,
  formatInvoiceCurrency,
  formatInvoiceCurrencyPlain,
  type InvoiceDisplayData,
} from '@/lib/invoice-display-data'
import { displayValue } from '@/lib/onboarding'

const COL = {
  sr: '5.2%',
  desc: '29.5%',
  sac: '6.9%',
  unit: '5.9%',
  qty: '5.9%',
  rate: '10.5%',
  taxable: '10.5%',
  cgst: '7.5%',
  sgst: '7.5%',
  total: '10.5%',
} as const

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1.5 flex justify-between gap-1">
      <span className="w-[48%] text-[7.5px] leading-tight text-slate-500">{label}</span>
      <span className="w-[48%] text-right text-[8.5px] font-bold leading-tight text-slate-900">{value}</span>
    </div>
  )
}

function InvoiceHtmlContent({ data }: { data: InvoiceDisplayData }) {
  const { invoice, company, companyName, companyAddress, companyGst, companyState, companyStateCode, contactLine } =
    data

  const invoiceDate = invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '-'

  return (
    <article
      className="mx-auto w-full bg-white text-slate-900 shadow-sm"
      style={{
        maxWidth: '210mm',
        padding: '10px',
        fontFamily: 'Roboto, system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div className="mb-1 flex items-start justify-between border-b border-slate-900 pb-1">
        <div className="w-[35%]">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt="" className="max-h-20 max-w-[160px] object-contain" />
          ) : (
            <div className="inline-block rounded-md bg-slate-900 px-3 py-2 text-xl font-bold uppercase text-white">
              {companyName}
            </div>
          )}
        </div>
        <div className="w-[65%] text-right">
          {company.logoUrl ? (
            <p className="mb-0.5 text-base font-bold uppercase text-slate-900">{companyName}</p>
          ) : null}
          <p className="text-[9px] leading-snug text-slate-600">{companyAddress}</p>
          <p className="mt-0.5 text-[10px] font-bold text-slate-900">GSTIN NO. : {companyGst}</p>
          {contactLine ? <p className="mt-0.5 text-[9px] text-slate-600">{contactLine}</p> : null}
        </div>
      </div>

      {/* Banner */}
      <div className="mb-2.5 flex items-center justify-between rounded-[10px] bg-slate-900 px-2.5 py-1.5 text-white">
        <span className="text-[10.5px] font-bold uppercase">Tax Invoice</span>
        <span className="text-[7.5px] opacity-85">Original for Recipient</span>
      </div>

      {/* Supplier + meta */}
      <div className="mb-3 flex gap-2">
        <div className="w-1/2 rounded-[10px] border border-slate-200 bg-slate-50 p-2.5">
          <p className="mb-1.5 text-[10px] font-bold uppercase text-slate-900">Supplier</p>
          <p className="text-[8px] leading-snug text-slate-600">{companyName}</p>
          <p className="text-[8px] leading-snug text-slate-600">{companyAddress}</p>
          <p className="text-[8px] leading-snug text-slate-600">GSTIN: {companyGst}</p>
          {contactLine ? <p className="text-[8px] leading-snug text-slate-600">{contactLine}</p> : null}
        </div>
        <div className="w-1/2 rounded-[10px] border border-slate-200 bg-white p-2.5">
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

      {/* Bill / Ship */}
      <div className="mb-3.5 flex gap-2.5">
        <div className="w-1/2 rounded-[10px] border border-slate-200 bg-white p-2.5">
          <p className="mb-1.5 text-[9.5px] font-bold uppercase text-slate-900">Bill To</p>
          <p className="text-[10px] font-bold text-slate-900">{data.billTo.name || '-'}</p>
          <p className="text-[9px] text-slate-600">{data.billTo.address || '-'}</p>
          <p className="text-[9px] text-slate-600">GSTIN: {data.billTo.gstin || '-'}</p>
          <p className="text-[9px] text-slate-600">
            State: {data.billTo.state || '-'} ({data.billTo.code || '-'})
          </p>
        </div>
        <div className="w-1/2 rounded-[10px] border border-slate-200 bg-white p-2.5">
          <p className="mb-1.5 text-[9.5px] font-bold uppercase text-slate-900">Ship To</p>
          <p className="text-[10px] font-bold text-slate-900">{data.shipTo.name || data.billTo.name || '-'}</p>
          <p className="text-[9px] text-slate-600">{data.shipTo.address || data.billTo.address || '-'}</p>
          <p className="text-[9px] text-slate-600">GSTIN: {data.shipTo.gstin || data.billTo.gstin || '-'}</p>
          <p className="text-[9px] text-slate-600">
            State: {data.shipTo.state || data.billTo.state || '-'} ({data.shipTo.code || data.billTo.code || '-'})
          </p>
        </div>
      </div>

      {/* Items table */}
      <div className="mb-2.5 overflow-x-auto rounded-[10px] border border-slate-300">
        <table className="w-full min-w-[560px] table-fixed border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              {(
                [
                  ['Sr.', COL.sr],
                  ['Description', COL.desc],
                  ['SAC', COL.sac],
                  ['Unit', COL.unit],
                  ['Qty', COL.qty],
                  ['Rate', COL.rate],
                  ['Taxable', COL.taxable],
                  ['CGST', COL.cgst],
                  ['SGST', COL.sgst],
                  ['Total', COL.total],
                ] as const
              ).map(([label, width]) => (
                <th
                  key={label}
                  style={{ width }}
                  className="border-r border-slate-700 px-0.5 py-1 text-center text-[7px] font-bold last:border-r-0"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((item, index) => (
              <tr key={item.index} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                <td className="border-b border-r border-slate-200 px-0.5 py-1 text-center text-[7.5px]">{item.index}</td>
                <td className="border-b border-r border-slate-200 px-0.5 py-1 text-[7.5px]">{item.description}</td>
                <td className="border-b border-r border-slate-200 px-0.5 py-1 text-center text-[7.5px]">{item.sacCode}</td>
                <td className="border-b border-r border-slate-200 px-0.5 py-1 text-center text-[7.5px]">{item.unit}</td>
                <td className="border-b border-r border-slate-200 px-0.5 py-1 text-center text-[7.5px]">{item.qty}</td>
                <td className="border-b border-r border-slate-200 px-0.5 py-1 text-right text-[7.5px] whitespace-nowrap">
                  {item.rate ? formatInvoiceCurrency(item.rate) : '-'}
                </td>
                <td className="border-b border-r border-slate-200 px-0.5 py-1 text-right text-[7.5px] whitespace-nowrap">
                  {formatInvoiceCurrency(item.lineAmount)}
                </td>
                <td className="border-b border-r border-slate-200 px-0.5 py-1 text-right text-[7.5px] whitespace-nowrap">
                  {formatInvoiceCurrency(item.lineCgst)}
                </td>
                <td className="border-b border-r border-slate-200 px-0.5 py-1 text-right text-[7.5px] whitespace-nowrap">
                  {formatInvoiceCurrency(item.lineSgst)}
                </td>
                <td className="border-b border-slate-200 px-0.5 py-1 text-right text-[7.5px] whitespace-nowrap">
                  {formatInvoiceCurrency(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mb-2.5 rounded-[10px] border border-slate-300 bg-white p-2.5">
        <div className="mb-1 flex justify-between text-[8.5px]">
          <span className="text-slate-600">Taxable Value</span>
          <span className="font-bold text-slate-900">{formatInvoiceCurrencyPlain(data.subtotal)}</span>
        </div>
        <div className="mb-1 flex justify-between text-[8.5px]">
          <span className="text-slate-600">Total CGST ({data.cgstPercentage}%)</span>
          <span className="font-bold text-slate-900">{formatInvoiceCurrencyPlain(data.totalCgst)}</span>
        </div>
        <div className="mb-1 flex justify-between text-[8.5px]">
          <span className="text-slate-600">Total SGST ({data.sgstPercentage}%)</span>
          <span className="font-bold text-slate-900">{formatInvoiceCurrencyPlain(data.totalSgst)}</span>
        </div>
        <div className="mb-1 flex justify-between text-[8.5px]">
          <span className="text-slate-600">Cash Discount</span>
          <span className="font-bold text-slate-900">-{formatInvoiceCurrencyPlain(data.cashDiscountAmount)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
          <span className="text-[9.5px] font-bold text-slate-900">Total Amount Payable</span>
          <span className="text-[11px] font-bold text-slate-900">{formatInvoiceCurrencyPlain(data.roundedNetTotal)}</span>
        </div>
      </div>

      {/* Amount in words */}
      <div className="mb-2.5 rounded-[10px] border border-slate-300 bg-slate-50 p-2.5">
        <p className="text-[9px] font-bold text-blue-900">Amount in Words</p>
        <p className="mt-1 text-[9px] text-slate-900">INR {data.amountInWords}</p>
      </div>

      {/* Footer */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-[10px] border border-slate-300 bg-slate-50 p-2">
          <p className="mb-1.5 text-[8.5px] font-bold text-slate-900">Bank Details</p>
          <p className="text-[9px] text-slate-600">Bank Name: {displayValue(company.bankName)}</p>
          <p className="text-[9px] text-slate-600">A/C Name: {displayValue(company.bankAccountName)}</p>
          <p className="text-[9px] text-slate-600">A/C No: {displayValue(company.bankAccountNumber)}</p>
          <p className="text-[9px] text-slate-600">IFSC: {displayValue(company.bankIfsc)}</p>
          <p className="text-[9px] text-slate-600">Branch: {displayValue(company.bankBranch)}</p>
        </div>
        <div className="flex-1 rounded-[10px] border border-slate-300 bg-slate-50 p-2">
          <p className="mb-1.5 text-[8.5px] font-bold text-slate-900">Terms & Signature</p>
          <p className="text-[9px] text-slate-600">
            Payment due within 15 days of invoice date. Late payment may attract interest.
          </p>
          <div className="mt-4 border-t border-slate-300 pt-1.5">
            <p className="text-[9px] font-bold text-slate-900">Authorised Signature</p>
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
    <>
      {/* Roboto — same font family as PDF */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
      />
      <div className="fixed inset-0 z-[200] flex flex-col bg-slate-200" style={{ height: '100dvh' }}>
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <InvoiceHtmlContent data={displayData} />
        </div>
      </div>
    </>,
    document.body,
  )
}
