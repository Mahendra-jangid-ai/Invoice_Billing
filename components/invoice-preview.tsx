'use client'

import { useBilling, Invoice } from '@/lib/context'

interface InvoicePreviewProps {
  invoice: Invoice
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const { customers, items, company } = useBilling()

  const customer = customers.find(
    (c) => String(c.id) === String(invoice.customerId)
  )

  const itemsList = invoice.items || []

  const subtotal = itemsList.reduce((sum, lineItem) => {
    const catalogItem = items.find(
      (i) => String(i.id) === String(lineItem.itemId)
    )
    const rate = Number(lineItem.rate) || Number(catalogItem?.unitprice) || 0
    const qty = Number(lineItem.quantity) || 0
    return sum + qty * rate
  }, 0)

  const taxPercentage = Number(invoice.taxPercentage) || 0
  const tax = (subtotal * taxPercentage) / 100
  const total = subtotal + tax

  const getAmountInWords = (num: number) => {
    const ones = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
    ]
    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ]
    const hundreds = [
      '',
      'One Hundred',
      'Two Hundred',
      'Three Hundred',
      'Four Hundred',
      'Five Hundred',
      'Six Hundred',
      'Seven Hundred',
      'Eight Hundred',
      'Nine Hundred',
    ]

    if (num <= 0 || isNaN(num)) return 'Zero'

    const crores = Math.floor(num / 10000000)
    const lakhs = Math.floor((num % 10000000) / 100000)
    const thousands = Math.floor((num % 100000) / 1000)
    const hundreds_part = Math.floor((num % 1000) / 100)
    const tens_part = Math.floor((num % 100) / 10)
    const ones_part = num % 10

    let result = ''

    if (crores > 0) {
      result += ones[crores] + ' Crore '
    }
    if (lakhs > 0) {
      result += ones[lakhs] + ' Lakh '
    }
    if (thousands > 0) {
      result += ones[thousands] + ' Thousand '
    }
    if (hundreds_part > 0) {
      result += hundreds[hundreds_part] + ' '
    }
    if (tens_part > 0) {
      result += tens[tens_part] + ' '
    }
    if (ones_part > 0) {
      result += ones[ones_part] + ' '
    }

    return result.trim() + ' Only'
  }

  const companyName = company.name || 'Your Business Name'
  const companyAddress = company.address || 'Business Address'
  const companyGst = company.gstnumber || '-'
  const companyEmail = company.email || ''
  const companyPhone = company.phone || ''

  return (
    <div className="printable-area relative overflow-hidden rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
      {/* Slanted / Diagonal Watermark of Company Name */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-10 select-none z-0">
        <span className="-rotate-45 transform text-5xl md:text-7xl font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center leading-tight">
          {companyName}
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b-2 border-slate-900 pb-6 dark:border-white">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {companyName}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {companyAddress}
            </p>
            {companyGst !== '-' && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                GST: {companyGst}
              </p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              TAX INVOICE
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Invoice #: {invoice.invoiceNumber}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Date: {invoice.date ? new Date(invoice.date).toLocaleDateString() : '-'}
            </p>
          </div>
        </div>

        {/* Invoice Details Grid */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded border border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
              Bill To:
            </h3>
            <p className="font-medium text-slate-900 dark:text-white">
              {customer?.name || 'Customer Name'}
            </p>
            {customer?.address && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {customer.address}
              </p>
            )}
            {customer?.email && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {customer.email}
              </p>
            )}
            {customer?.phone && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {customer.phone}
              </p>
            )}
            {customer?.gstnumber && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                GST: {customer.gstnumber}
              </p>
            )}
          </div>

          <div className="rounded border border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
              Seller:
            </h3>
            <p className="font-medium text-slate-900 dark:text-white">
              {companyName}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {companyAddress}
            </p>
            {companyEmail && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {companyEmail}
              </p>
            )}
            {companyPhone && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {companyPhone}
              </p>
            )}
            {companyGst !== '-' && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                GST: {companyGst}
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-b border-slate-900 dark:border-white">
                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  S.No
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Item(s)
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  HSN/SAC
                </th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Qty
                </th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-slate-900 dark:text-white">
                  Rate
                </th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-slate-900 dark:text-white">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {itemsList.map((lineItem, index) => {
                const catalogItem = items.find(
                  (i) => String(i.id) === String(lineItem.itemId)
                )
                const rate = Number(lineItem.rate) || Number(catalogItem?.unitprice) || 0
                const qty = Number(lineItem.quantity) || 0
                const amount = qty * rate
                const itemName = catalogItem?.name || 'Item'

                return (
                  <tr
                    key={index}
                    className="border-b border-slate-200 dark:border-slate-700"
                  >
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      <div className="font-medium">{itemName}</div>
                      {catalogItem?.description && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {catalogItem.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      {catalogItem?.hsnsac || '-'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-900 dark:text-white">
                      {qty}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-900 dark:text-white">
                      ₹{rate.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-slate-900 dark:text-white">
                      ₹{amount.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-8 flex justify-end">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between border-b border-slate-300 pb-2 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-300">Subtotal:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-300 pb-2 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-300">
                Tax ({taxPercentage}%):
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                ₹{tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t-2 border-slate-900 pt-2 font-bold text-slate-900 dark:border-white dark:text-white">
              <span>Total Invoice Value</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="mb-8 rounded border border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm">
            <span className="font-semibold text-slate-900 dark:text-white">
              Amount (in words):
            </span>{' '}
            <span className="text-slate-900 dark:text-white">
              INR {getAmountInWords(Math.round(total))}
            </span>
          </p>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8">
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
              Terms & Conditions:
            </h3>
            <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-end justify-between border-t-2 border-slate-900 pt-6 dark:border-white">
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Authorized Signature
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-900 dark:text-white">
              For {companyName}
            </p>
            <p className="mt-8 text-xs text-slate-600 dark:text-slate-400">
              (Authorized Signatory)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
