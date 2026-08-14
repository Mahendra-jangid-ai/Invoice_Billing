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

function DefaultHtmlLayout({ data }: { data: InvoiceDisplayData }) {
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

function ModernHtmlLayout({ data }: { data: InvoiceDisplayData }) {
  const { invoice, company, companyName, companyAddress, companyGst, companyState, companyStateCode, contactLine } = data
  const invoiceDate = invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '-'

  return (
    <article
      className="mx-auto w-full bg-slate-50 text-slate-800 shadow-sm rounded-lg overflow-hidden"
      style={{
        maxWidth: '210mm',
        fontFamily: 'Roboto, system-ui, sans-serif',
      }}
    >
      {/* Header Banner */}
      <div className="bg-blue-600 text-white p-5 flex items-start justify-between">
        <div className="w-[50%]">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt="" className="max-h-16 max-w-[140px] object-contain rounded bg-white p-1" />
          ) : (
            <div className="text-2xl font-bold uppercase tracking-wider">{companyName}</div>
          )}
          <div className="mt-3 text-[9px] text-blue-100 opacity-90">{companyAddress}</div>
          <div className="mt-1 text-[9px] text-blue-100 font-semibold tracking-wide">GSTIN: {companyGst}</div>
        </div>
        <div className="w-[50%] text-right">
          <div className="text-3xl font-light uppercase tracking-widest opacity-90">Invoice</div>
          <div className="mt-2 text-[10px]">No: <span className="font-bold">{invoice.invoiceNumber || '-'}</span></div>
          <div className="text-[10px]">Date: <span className="font-bold">{invoiceDate}</span></div>
        </div>
      </div>

      <div className="p-5">
        {/* Bill / Ship */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <p className="mb-1 text-[8px] font-bold uppercase tracking-wider text-blue-600">Billed To</p>
            <p className="text-[11px] font-bold text-slate-900">{data.billTo.name || '-'}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">{data.billTo.address || '-'}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">GSTIN: {data.billTo.gstin || '-'}</p>
          </div>
          <div className="w-1/2">
            <p className="mb-1 text-[8px] font-bold uppercase tracking-wider text-blue-600">Shipped To</p>
            <p className="text-[11px] font-bold text-slate-900">{data.shipTo.name || data.billTo.name || '-'}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">{data.shipTo.address || data.billTo.address || '-'}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">GSTIN: {data.shipTo.gstin || data.billTo.gstin || '-'}</p>
          </div>
        </div>

        {/* Items */}
        <div className="mb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-blue-100">
                <th className="py-2 text-[8px] font-bold text-blue-600 uppercase">Item</th>
                <th className="py-2 text-[8px] font-bold text-blue-600 uppercase text-center">Qty</th>
                <th className="py-2 text-[8px] font-bold text-blue-600 uppercase text-right">Rate</th>
                <th className="py-2 text-[8px] font-bold text-blue-600 uppercase text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item, i) => (
                <tr key={item.index} className="border-b border-slate-200 last:border-0">
                  <td className="py-2 text-[9px] text-slate-800">
                    <div className="font-semibold">{item.description}</div>
                    <div className="text-[7.5px] text-slate-500">SAC: {item.sacCode}</div>
                  </td>
                  <td className="py-2 text-[9px] text-slate-800 text-center">{item.qty} {item.unit}</td>
                  <td className="py-2 text-[9px] text-slate-800 text-right">{item.rate ? formatInvoiceCurrency(item.rate) : '-'}</td>
                  <td className="py-2 text-[9px] text-slate-900 font-semibold text-right">{formatInvoiceCurrency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-4">
          <div className="w-1/2 bg-blue-50/50 p-4 rounded-lg">
            <div className="flex justify-between text-[9px] mb-1 text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">{formatInvoiceCurrencyPlain(data.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[9px] mb-1 text-slate-600">
              <span>CGST ({data.cgstPercentage}%)</span>
              <span className="font-medium text-slate-900">{formatInvoiceCurrencyPlain(data.totalCgst)}</span>
            </div>
            <div className="flex justify-between text-[9px] mb-1 text-slate-600">
              <span>SGST ({data.sgstPercentage}%)</span>
              <span className="font-medium text-slate-900">{formatInvoiceCurrencyPlain(data.totalSgst)}</span>
            </div>
            <div className="flex justify-between text-[9px] mb-2 text-slate-600">
              <span>Discount</span>
              <span className="font-medium text-slate-900">-{formatInvoiceCurrencyPlain(data.cashDiscountAmount)}</span>
            </div>
            <div className="flex justify-between text-[11px] pt-2 border-t border-blue-200 font-bold text-blue-900">
              <span>Total</span>
              <span>{formatInvoiceCurrencyPlain(data.roundedNetTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[8px] text-slate-500 border-t border-slate-200 pt-3 flex justify-between">
          <div>
            <div className="font-bold text-slate-700 mb-0.5">Bank Details</div>
            <div>{displayValue(company.bankName)} • A/C: {displayValue(company.bankAccountNumber)}</div>
            <div>IFSC: {displayValue(company.bankIfsc)}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-700 mb-6">Authorised Signatory</div>
            <div className="border-t border-slate-300 pt-1 inline-block text-[7px] px-4">Signature</div>
          </div>
        </div>
      </div>
    </article>
  )
}

function ClassicHtmlLayout({ data }: { data: InvoiceDisplayData }) {
  const { invoice, company, companyName, companyAddress, companyGst, contactLine } = data
  const invoiceDate = invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '-'

  return (
    <article
      className="mx-auto w-full bg-white text-black border border-black p-3"
      style={{
        maxWidth: '210mm',
        fontFamily: 'Times New Roman, serif',
      }}
    >
      <div className="text-center font-bold text-lg mb-2 underline">TAX INVOICE</div>
      
      <div className="border border-black p-2 mb-2 flex justify-between">
        <div>
          <div className="font-bold text-sm uppercase">{companyName}</div>
          <div className="text-[10px]">{companyAddress}</div>
          <div className="text-[10px] font-bold">GSTIN: {companyGst}</div>
          {contactLine && <div className="text-[10px]">{contactLine}</div>}
        </div>
        <div className="text-right text-[10px]">
          <div><span className="font-bold">Invoice No:</span> {invoice.invoiceNumber || '-'}</div>
          <div><span className="font-bold">Date:</span> {invoiceDate}</div>
        </div>
      </div>

      <div className="flex border border-black mb-2 divide-x divide-black text-[10px]">
        <div className="w-1/2 p-2">
          <div className="font-bold underline mb-1">Billed To:</div>
          <div className="font-bold">{data.billTo.name || '-'}</div>
          <div>{data.billTo.address || '-'}</div>
          <div>GSTIN: {data.billTo.gstin || '-'}</div>
        </div>
        <div className="w-1/2 p-2">
          <div className="font-bold underline mb-1">Shipped To:</div>
          <div className="font-bold">{data.shipTo.name || data.billTo.name || '-'}</div>
          <div>{data.shipTo.address || data.billTo.address || '-'}</div>
          <div>GSTIN: {data.shipTo.gstin || data.billTo.gstin || '-'}</div>
        </div>
      </div>

      <table className="w-full border-collapse border border-black text-[9px] mb-2">
        <thead>
          <tr className="border-b border-black">
            <th className="border-r border-black p-1">S.N.</th>
            <th className="border-r border-black p-1">Particulars</th>
            <th className="border-r border-black p-1">Qty</th>
            <th className="border-r border-black p-1">Rate</th>
            <th className="border-r border-black p-1">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.map((item, i) => (
            <tr key={item.index} className="border-b border-black">
              <td className="border-r border-black p-1 text-center">{item.index}</td>
              <td className="border-r border-black p-1">{item.description}</td>
              <td className="border-r border-black p-1 text-center">{item.qty} {item.unit}</td>
              <td className="border-r border-black p-1 text-right">{item.rate ? formatInvoiceCurrency(item.rate) : '-'}</td>
              <td className="border-r border-black p-1 text-right">{formatInvoiceCurrency(item.lineAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex border border-black text-[10px]">
        <div className="w-2/3 p-2 border-r border-black flex flex-col justify-between">
          <div>
            <div className="font-bold underline">Amount in Words:</div>
            <div>INR {data.amountInWords}</div>
          </div>
          <div className="mt-4">
            <div className="font-bold underline">Bank Details:</div>
            <div>Bank: {displayValue(company.bankName)}</div>
            <div>A/C No: {displayValue(company.bankAccountNumber)} | IFSC: {displayValue(company.bankIfsc)}</div>
          </div>
        </div>
        <div className="w-1/3 p-2">
          <div className="flex justify-between mb-1"><span>Subtotal:</span> <span>{formatInvoiceCurrencyPlain(data.subtotal)}</span></div>
          <div className="flex justify-between mb-1"><span>CGST:</span> <span>{formatInvoiceCurrencyPlain(data.totalCgst)}</span></div>
          <div className="flex justify-between mb-1"><span>SGST:</span> <span>{formatInvoiceCurrencyPlain(data.totalSgst)}</span></div>
          <div className="flex justify-between mb-2"><span>Discount:</span> <span>-{formatInvoiceCurrencyPlain(data.cashDiscountAmount)}</span></div>
          <div className="flex justify-between font-bold border-t border-black pt-1">
            <span>Grand Total:</span> <span>{formatInvoiceCurrencyPlain(data.roundedNetTotal)}</span>
          </div>
        </div>
      </div>
      <div className="text-right text-[10px] p-2 mt-4">
        <div className="font-bold">For {companyName}</div>
        <div className="mt-8">Authorised Signatory</div>
      </div>
    </article>
  )
}

function DetailedHtmlLayout({ data }: { data: InvoiceDisplayData }) {
  const { invoice, company, companyName, companyAddress, companyGst, contactLine, companyState, companyStateCode } = data
  const invoiceDate = invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '-'

  return (
    <article
      className="mx-auto w-full bg-white text-black border-2 border-black p-1 text-[9px]"
      style={{
        maxWidth: '210mm',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {company.logoUrl ? (
        <div className="flex justify-between items-center mb-1 pb-1">
          <div className="w-1/3 text-left">
            <img src={company.logoUrl} alt="Logo" className="max-h-16 object-contain" />
          </div>
          <div className="w-2/3 text-right">
            <div className="font-bold text-2xl uppercase tracking-wider">{companyName}</div>
            <div className="whitespace-pre-wrap">{companyAddress}</div>
            <div className="font-bold">GSTIN NO. : {companyGst}</div>
            {contactLine && <div className="font-bold">{contactLine}</div>}
          </div>
        </div>
      ) : (
        <div className="text-center mb-1 flex flex-col items-center">
          <div className="font-bold text-2xl uppercase tracking-wider">{companyName}</div>
          <div className="whitespace-pre-wrap text-center">{companyAddress}</div>
          <div className="font-bold">GSTIN NO. : {companyGst}</div>
          {contactLine && <div className="font-bold">{contactLine}</div>}
        </div>
      )}

      <div className="bg-gray-200 text-center font-bold border border-black py-1 uppercase text-[10px]">
        Invoice
      </div>

      <div className="flex border-x border-black divide-x divide-black">
        <div className="w-1/2 flex flex-col divide-y divide-black">
          <div className="flex px-1 py-0.5"><span className="font-bold w-1/3">Invoice:</span><span>{invoice.invoiceNumber || '-'}</span></div>
          <div className="flex px-1 py-0.5"><span className="font-bold w-1/3">Date:</span><span>{invoiceDate}</span></div>
          <div className="flex px-1 py-0.5"><span className="font-bold w-1/3">Reverse Charge (Y/N):</span><span>{invoice.reverseCharge || 'No'}</span></div>
          <div className="flex px-1 py-0.5 justify-between">
            <span className="font-bold">State: {companyState || '-'}</span>
            <span className="border-l border-black pl-1 font-bold">Code: {companyStateCode || '-'}</span>
          </div>
        </div>
        <div className="w-1/2 flex flex-col divide-y divide-black">
          <div className="flex px-1 py-0.5"><span className="font-bold w-1/3">WO No:</span><span>{invoice.woNumber || '-'}</span></div>
          <div className="flex px-1 py-0.5"><span className="font-bold w-1/3">Description of Service:</span><span>{invoice.descriptionOfService || '-'}</span></div>
          <div className="flex px-1 py-0.5"><span className="font-bold w-1/3">Period of Service:</span><span>{invoice.periodOfService || '-'}</span></div>
          <div className="flex px-1 py-0.5"><span className="font-bold w-1/3">Place of Service:</span><span>{invoice.placeOfService || '-'}</span></div>
        </div>
      </div>

      <div className="flex border border-black divide-x divide-black bg-gray-200">
        <div className="w-1/2 text-center font-bold py-0.5">Bill to Party</div>
        <div className="w-1/2 text-center font-bold py-0.5">Ship to Party (Site Address)</div>
      </div>

      <div className="flex border-x border-b border-black divide-x divide-black">
        <div className="w-1/2 flex flex-col divide-y divide-black">
          <div className="flex px-1 py-0.5"><span className="font-bold w-1/5">Name:</span><span className="font-bold">{data.billTo.name || '-'}</span></div>
          <div className="flex px-1 py-0.5"><span className="font-bold w-1/5">Address:</span><span>{data.billTo.address || '-'}</span></div>
          <div className="flex px-1 py-0.5"><span className="font-bold w-1/5">GSTIN:</span><span className="font-bold">{data.billTo.gstin || '-'}</span></div>
          <div className="flex px-1 py-0.5 justify-between">
            <span className="font-bold">State: {data.billTo.state || '-'}</span>
            <span className="border-l border-black pl-1 font-bold">Code: {data.billTo.code || '-'}</span>
          </div>
        </div>
        <div className="w-1/2 flex flex-col divide-y divide-black">
          <div className="flex px-1 py-0.5"><span className="font-bold w-1/5">Name:</span><span className="font-bold">{data.shipTo.name || data.billTo.name || '-'}</span></div>
          <div className="flex px-1 py-0.5"><span className="font-bold w-1/5">Address:</span><span>{data.shipTo.address || data.billTo.address || '-'}</span></div>
          <div className="flex px-1 py-0.5"><span className="font-bold w-1/5">GSTIN:</span><span className="font-bold">{data.shipTo.gstin || data.billTo.gstin || '-'}</span></div>
          <div className="flex px-1 py-0.5 justify-between">
            <span className="font-bold">State: {data.shipTo.state || data.billTo.state || '-'}</span>
            <span className="border-l border-black pl-1 font-bold">Code: {data.shipTo.code || data.billTo.code || '-'}</span>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse border border-black mt-1 text-[8px] table-fixed">
        <colgroup>
          <col style={{ width: '5%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '6%' }} />
          <col style={{ width: '6%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '4%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '4%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '12%' }} />
        </colgroup>
        <thead>
          <tr className="bg-gray-200 border-b border-black">
            <th className="border-r border-black p-1 text-center font-bold" rowSpan={2}>Sr. No.</th>
            <th className="border-r border-black p-1 font-bold text-left" rowSpan={2}>Product Description</th>
            <th className="border-r border-black p-1 font-bold" rowSpan={2}>SAC Code</th>
            <th className="border-r border-black p-1 font-bold" rowSpan={2}>Unit</th>
            <th className="border-r border-black p-1 font-bold" rowSpan={2}>Qty</th>
            <th className="border-r border-black p-1 font-bold text-right" rowSpan={2}>Rate</th>
            <th className="border-r border-black p-1 font-bold text-right" rowSpan={2}>Amount</th>
            <th className="border-r border-black p-1 font-bold text-right" rowSpan={2}>Taxable Value</th>
            <th className="border-r border-black p-0 font-bold text-center" colSpan={2}>CGST</th>
            <th className="border-r border-black p-0 font-bold text-center" colSpan={2}>SGST</th>
            <th className="p-1 font-bold text-right" rowSpan={2}>Total</th>
          </tr>
          <tr className="bg-gray-200 border-b border-black">
            <th className="border-r border-black border-t border-black p-1 font-bold text-center">Rate</th>
            <th className="border-r border-black border-t border-black p-1 font-bold text-right">Amount</th>
            <th className="border-r border-black border-t border-black p-1 font-bold text-center">Rate</th>
            <th className="border-r border-black border-t border-black p-1 font-bold text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.map((item, i) => (
            <tr key={item.index} className="border-b border-black">
              <td className="border-r border-black p-1 text-center">{item.index}</td>
              <td className="border-r border-black p-1">{item.description}</td>
              <td className="border-r border-black p-1 text-center">{item.sacCode}</td>
              <td className="border-r border-black p-1 text-center">{item.unit}</td>
              <td className="border-r border-black p-1 text-center">{item.qty}</td>
              <td className="border-r border-black p-1 text-right">{item.rate ? formatInvoiceCurrencyPlain(item.rate) : '-'}</td>
              <td className="border-r border-black p-1 text-right">{formatInvoiceCurrencyPlain(item.lineAmount)}</td>
              <td className="border-r border-black p-1 text-right">{formatInvoiceCurrencyPlain(item.lineAmount)}</td>
              <td className="border-r border-black p-1 text-center">{data.cgstPercentage}%</td>
              <td className="border-r border-black p-1 text-right">{formatInvoiceCurrencyPlain(item.lineCgst)}</td>
              <td className="border-r border-black p-1 text-center">{data.sgstPercentage}%</td>
              <td className="border-r border-black p-1 text-right">{formatInvoiceCurrencyPlain(item.lineSgst)}</td>
              <td className="p-1 text-right">{formatInvoiceCurrencyPlain(item.lineTotal)}</td>
            </tr>
          ))}
          <tr className="border-b border-black font-bold">
            <td className="border-r border-black p-1 text-center" colSpan={8}>Total</td>
            <td className="border-r border-black p-1 text-center"></td>
            <td className="border-r border-black p-1 text-right">{formatInvoiceCurrencyPlain(data.totalCgst)}</td>
            <td className="border-r border-black p-1 text-center"></td>
            <td className="border-r border-black p-1 text-right">{formatInvoiceCurrencyPlain(data.totalSgst)}</td>
            <td className="p-1 text-right"></td>
          </tr>
        </tbody>
      </table>

      <div className="flex border border-black border-t-0 text-[8px] divide-x divide-black">
        <div className="w-[66%] flex flex-col">
          <div className="border-b border-black bg-gray-200 font-bold p-1 text-center">Total Invoice amount in words</div>
          <div className="p-1 font-bold text-center flex-1 flex items-center justify-center">{data.amountInWords} Only</div>
        </div>
        <div className="w-[34%] flex flex-col divide-y divide-black font-bold">
          <div className="flex justify-between p-1"><span>Total Amount before Tax</span><span>{formatInvoiceCurrencyPlain(data.subtotal)}</span></div>
          <div className="flex justify-between p-1"><span>Add: CGST</span><span>{formatInvoiceCurrencyPlain(data.totalCgst)}</span></div>
          <div className="flex justify-between p-1"><span>Add: SGST</span><span>{formatInvoiceCurrencyPlain(data.totalSgst)}</span></div>
          <div className="flex justify-between p-1"><span>Total Tax Amount</span><span>{formatInvoiceCurrencyPlain(data.totalCgst + data.totalSgst)}</span></div>
          <div className="flex justify-between p-1"><span>Discount</span><span>-{formatInvoiceCurrencyPlain(data.cashDiscountAmount)}</span></div>
          <div className="flex justify-between p-1 text-[9px]"><span>Total Amount after Tax:</span><span>{formatInvoiceCurrencyPlain(data.roundedNetTotal)}</span></div>
        </div>
      </div>

      <div className="flex border border-black border-t-0">
        <div className="w-[66%] flex flex-col border-r border-black">
          <div className="bg-gray-200 border-b border-black font-bold text-center p-1">Bank Details</div>
          <div className="p-1 text-[8px]">
            <div className="font-bold">Bank Name: {displayValue(company.bankName)}</div>
            <div className="font-bold">Bank A/c Name: {displayValue(company.bankAccountName)} A/c No. {displayValue(company.bankAccountNumber)}</div>
            <div className="font-bold flex gap-4">
              <span>Bank IFSC code: {displayValue(company.bankIfsc)}</span>
              <span>Branch: {displayValue(company.bankBranch)}</span>
            </div>
          </div>
        </div>
        <div className="w-[34%] flex divide-x divide-black relative">
          <div className="w-1/3 flex flex-col justify-end p-1 text-[7px] text-center">Common Seal</div>
          <div className="w-2/3 flex flex-col text-center text-[8px] font-bold p-1 pt-2">
            <div>For {companyName}</div>
            <div className="mt-8">Authorised signatory</div>
          </div>
        </div>
      </div>
    </article>
  )
}

function InvoiceHtmlContent({ data }: { data: InvoiceDisplayData }) {
  const layout = data.company.invoiceLayout || 'default'
  if (layout === 'modern') return <ModernHtmlLayout data={data} />
  if (layout === 'classic') return <ClassicHtmlLayout data={data} />
  if (layout === 'detailed') return <DetailedHtmlLayout data={data} />
  return <DefaultHtmlLayout data={data} />
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
