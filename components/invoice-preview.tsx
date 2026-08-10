'use client'

import { useBilling, Invoice } from '@/lib/context'

interface InvoicePreviewProps {
  invoice: Invoice
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const { customers, company } = useBilling()

  // Find customer if billTo is not directly stored
  const customer = customers.find(
    (c) => String(c.id) === String(invoice.customerId)
  )

  const billTo = invoice.billTo || {
    name: customer?.name || 'Customer Name',
    address: customer?.address || '',
    gstin: customer?.gstnumber || '',
    state: customer?.state || company.state || '',
    code: customer?.code || company.code || '',
  }

  const shipTo = invoice.sameAsBillTo
    ? billTo
    : invoice.shipTo || billTo

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
  const totalTax = totalCgst + totalSgst

  const rawTotal = subtotal + totalTax
  const roundedTotal = Math.round(rawTotal)
  const roundOff = roundedTotal - rawTotal

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

    if (crores > 0) result += ones[crores] + ' Crore '
    if (lakhs > 0) result += ones[lakhs] + ' Lakh '
    if (thousands > 0) result += ones[thousands] + ' Thousand '
    if (hundreds_part > 0) result += hundreds[hundreds_part] + ' '
    if (tens_part > 0) result += tens[tens_part] + ' '
    if (ones_part > 0) result += ones[ones_part] + ' '

    return result.trim() + ' Only'
  }

  const companyName = company.name || 'SK INTERIORS'
  const companyAddress = company.address || 'Office No. 14, Hansraj Molakram Chawl, PP Road, Ambewadi Mumbai Maharashtra - 400069'
  const companyGst = company.gstnumber || '27CAOPK3510K1ZJ'
  const contactPerson = company.contactPerson || ''
  const companyPhone = company.phone || ''
  const companyState = company.state || 'MAHARASHTRA'
  const companyStateCode = company.code || '27'

  const contactLine = [contactPerson, companyPhone].filter(Boolean).join(' - ')

  return (
    <div className="printable-area mx-auto max-w-5xl rounded-none border-2 border-black bg-white p-3 text-slate-900 font-sans text-xs shadow-md dark:bg-white dark:text-slate-900">
      {/* 1. Header Block with Top-Left Logo */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-black px-1 gap-4">
        {/* Top-Left Logo Container */}
        <div className="w-1/3 flex justify-start items-center">
          {company.logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={company.logoUrl}
              alt={companyName}
              className="max-h-20 max-w-[220px] object-contain"
            />
          ) : (
            <h1 className="text-2xl font-extrabold uppercase tracking-wide text-slate-900">
              {companyName}
            </h1>
          )}
        </div>

        {/* Company Info (Center / Right) */}
        <div className="w-2/3 flex flex-col items-end text-right">
          {company.logoUrl && (
            <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900 mb-0.5">
              {companyName}
            </h1>
          )}

          <p className="font-semibold text-[11px] leading-tight text-slate-800 max-w-md">
            {companyAddress}
          </p>

          <p className="font-bold text-[11px] mt-0.5 text-slate-900">
            GSTIN NO. : {companyGst}
          </p>

          {contactLine && (
            <p className="font-bold text-[11px] mt-0.5 text-slate-900">
              {contactLine}
            </p>
          )}
        </div>
      </div>

      {/* 2. Document Title Bar */}
      <div className="bg-slate-200 py-1 text-center font-bold uppercase tracking-wider text-xs border-b border-black">
        Invoice
      </div>

      {/* 3. Invoice Metadata Grid */}
      <div className="grid grid-cols-2 text-xs border-b border-black">
        {/* Left Column Metadata */}
        <div className="border-r border-black space-y-0.5 p-1.5">
          <div className="flex">
            <span className="font-bold w-36 shrink-0">Invoice :</span>
            <span>{invoice.invoiceNumber || '-'}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-36 shrink-0">Date:</span>
            <span>{invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '-'}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-36 shrink-0">Reverse Charge (Y/N):</span>
            <span>{invoice.reverseCharge || 'No'}</span>
          </div>
          <div className="flex items-center">
            <span className="font-bold w-36 shrink-0">State:</span>
            <span className="font-medium uppercase flex-1">{invoice.companyState || companyState}</span>
            <span className="font-bold px-2 border-l border-r border-black">Code</span>
            <span className="font-medium px-3">{invoice.companyStateCode || companyStateCode}</span>
          </div>
        </div>

        {/* Right Column Metadata */}
        <div className="space-y-0.5 p-1.5">
          <div className="flex">
            <span className="font-bold w-36 shrink-0">WO No:</span>
            <span>{invoice.woNumber || '-'}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-36 shrink-0">Description of Service:</span>
            <span>{invoice.descriptionOfService || '-'}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-36 shrink-0">Period of Service:</span>
            <span>{invoice.periodOfService || '-'}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-36 shrink-0">Place of Service:</span>
            <span>{invoice.placeOfService || '-'}</span>
          </div>
        </div>
      </div>

      {/* 4. Parties Grid Header */}
      <div className="grid grid-cols-2 text-xs border-b border-black bg-slate-200 font-bold text-center">
        <div className="py-1 border-r border-black">Bill to Party</div>
        <div className="py-1">Ship to Party (Site Address)</div>
      </div>

      {/* Parties Grid Content */}
      <div className="grid grid-cols-2 text-xs border-b border-black">
        {/* Bill to Party */}
        <div className="p-2 border-r border-black space-y-1">
          <div className="flex">
            <span className="font-bold w-16 shrink-0">Name:</span>
            <span className="font-bold">{billTo.name || '-'}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-16 shrink-0">Address:</span>
            <span>{billTo.address || '-'}</span>
          </div>
          <div className="flex pt-1">
            <span className="font-bold w-16 shrink-0">GSTIN:</span>
            <span className="font-bold">{billTo.gstin || '-'}</span>
          </div>
          <div className="flex items-center pt-1 border-t border-slate-300">
            <span className="font-bold w-16 shrink-0">State:</span>
            <span className="font-medium uppercase flex-1">{billTo.state || '-'}</span>
            <span className="font-bold px-2 border-l border-r border-black">Code</span>
            <span className="font-medium px-2">{billTo.code || '-'}</span>
          </div>
        </div>

        {/* Ship to Party */}
        <div className="p-2 space-y-1">
          <div className="flex">
            <span className="font-bold w-16 shrink-0">Name:</span>
            <span className="font-bold">{shipTo.name || billTo.name || '-'}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-16 shrink-0">Address:</span>
            <span>{shipTo.address || billTo.address || '-'}</span>
          </div>
          <div className="flex pt-1">
            <span className="font-bold w-16 shrink-0">GSTIN:</span>
            <span className="font-bold">{shipTo.gstin || billTo.gstin || '-'}</span>
          </div>
          <div className="flex items-center pt-1 border-t border-slate-300">
            <span className="font-bold w-16 shrink-0">State:</span>
            <span className="font-medium uppercase flex-1">{shipTo.state || billTo.state || '-'}</span>
            <span className="font-bold px-2 border-l border-r border-black">Code</span>
            <span className="font-medium px-2">{shipTo.code || billTo.code || '-'}</span>
          </div>
        </div>
      </div>

      {/* 5. Products / Services Table */}
      <div className="border-b border-black overflow-x-auto">
        <table className="w-full border-collapse text-xs text-left">
          <thead>
            <tr className="bg-slate-200 border-b border-black text-[11px] font-bold text-center">
              <th className="border-r border-black p-1 w-10">Sr. No.</th>
              <th className="border-r border-black p-1 text-left">Product Description</th>
              <th className="border-r border-black p-1 w-16">SAC Code</th>
              <th className="border-r border-black p-1 w-12">Unit</th>
              <th className="border-r border-black p-1 w-12">Qty</th>
              <th className="border-r border-black p-1 w-20 text-right">Rate</th>
              <th className="border-r border-black p-1 w-24 text-right">Amount</th>
              <th className="border-r border-black p-1 w-24 text-right">Taxable Value</th>
              <th className="border-r border-black p-1 w-28 text-center" colSpan={2}>
                CGST
              </th>
              <th className="border-r border-black p-1 w-28 text-center" colSpan={2}>
                SGST
              </th>
              <th className="p-1 w-24 text-right">Total</th>
            </tr>
            <tr className="bg-slate-100 border-b border-black text-[10px] font-bold text-center">
              <th className="border-r border-black p-0.5"></th>
              <th className="border-r border-black p-0.5"></th>
              <th className="border-r border-black p-0.5"></th>
              <th className="border-r border-black p-0.5"></th>
              <th className="border-r border-black p-0.5"></th>
              <th className="border-r border-black p-0.5"></th>
              <th className="border-r border-black p-0.5"></th>
              <th className="border-r border-black p-0.5"></th>
              <th className="border-r border-black p-0.5 w-10">Rate</th>
              <th className="border-r border-black p-0.5 w-16">Amount</th>
              <th className="border-r border-black p-0.5 w-10">Rate</th>
              <th className="border-r border-black p-0.5 w-16">Amount</th>
              <th className="p-0.5"></th>
            </tr>
          </thead>
          <tbody>
            {itemsList.map((item, index) => {
              const qty = Number(item.quantity) || 0
              const rate = Number(item.rate) || 0
              const lineAmount = qty * rate
              const lineCgst = (lineAmount * cgstPercentage) / 100
              const lineSgst = (lineAmount * sgstPercentage) / 100
              const lineTotal = lineAmount + lineCgst + lineSgst

              return (
                <tr key={index} className="border-b border-slate-300 text-[11px]">
                  <td className="border-r border-black p-1 text-center font-medium">
                    {index + 1}
                  </td>
                  <td className="border-r border-black p-1 font-medium">
                    {item.description || 'Service/Product'}
                  </td>
                  <td className="border-r border-black p-1 text-center font-medium">
                    {item.sacCode || '9954'}
                  </td>
                  <td className="border-r border-black p-1 text-center font-medium">
                    {item.unit || 'Nos'}
                  </td>
                  <td className="border-r border-black p-1 text-center font-medium">
                    {qty}
                  </td>
                  <td className="border-r border-black p-1 text-right font-medium">
                    {rate ? rate.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="border-r border-black p-1 text-right font-medium">
                    {lineAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border-r border-black p-1 text-right font-medium">
                    {lineAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border-r border-black p-1 text-center font-medium">
                    {cgstPercentage}%
                  </td>
                  <td className="border-r border-black p-1 text-right font-medium">
                    {lineCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border-r border-black p-1 text-center font-medium">
                    {sgstPercentage}%
                  </td>
                  <td className="border-r border-black p-1 text-right font-medium">
                    {lineSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 text-right font-bold">
                    {lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )
            })}

            {/* Total Row */}
            <tr className="border-t-2 border-black bg-slate-100 font-bold text-[11px]">
              <td className="border-r border-black p-1 text-center" colSpan={4}>
                Total
              </td>
              <td className="border-r border-black p-1 text-center">
                {itemsList.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)}
              </td>
              <td className="border-r border-black p-1"></td>
              <td className="border-r border-black p-1 text-right">
                {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="border-r border-black p-1 text-right">
                {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="border-r border-black p-1"></td>
              <td className="border-r border-black p-1 text-right">
                {totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="border-r border-black p-1"></td>
              <td className="border-r border-black p-1 text-right">
                {totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="p-1 text-right">
                {rawTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 6. Footer Section (Amount in Words, Bank Details, Seal vs. Totals) */}
      <div className="grid grid-cols-12 text-xs">
        {/* Left Column (Words + Bank Details + Common Seal) */}
        <div className="col-span-7 border-r border-black flex flex-col justify-between">
          <div className="p-2 border-b border-black">
            <span className="font-bold block mb-1">Total Invoice amount in words</span>
            <span className="font-semibold text-slate-800 text-[11px]">
              {getAmountInWords(roundedTotal)}
            </span>
          </div>

          <div className="border-b border-black">
            <div className="bg-slate-200 font-bold px-2 py-0.5 border-b border-black">
              Bank Details
            </div>
            <div className="p-2 space-y-0.5 text-[11px]">
              <div className="flex">
                <span className="font-bold w-32 shrink-0">Bank Name:</span>
                <span>{company.bankName || 'Axis Bank'}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-32 shrink-0">Bank A/c Name:</span>
                <span>{company.bankAccountName || `${companyName} Bank A/c No.`} {company.bankAccountNumber || '923020047215171'}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-32 shrink-0">Bank IFSC code:</span>
                <span className="mr-4">{company.bankIfsc || 'UTIB0001584'}</span>
                <span className="font-bold mr-1">Branch:</span>
                <span>{company.bankBranch || 'OLD NAGARDAS ROAD'}</span>
              </div>
            </div>
          </div>

          {/* Common Seal Box */}
          <div className="h-24 p-2 flex items-center justify-center text-slate-400 font-semibold border-t border-black">
            Common Seal
          </div>
        </div>

        {/* Right Column (Totals Breakdown + Authorised Signatory) */}
        <div className="col-span-5 flex flex-col justify-between">
          <div className="p-2 space-y-1 border-b border-black text-xs">
            <div className="flex justify-between">
              <span className="font-bold">Total Amount before Tax</span>
              <span className="font-semibold">
                {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Add: CGST</span>
              <span className="font-semibold">
                {totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Add: SGST</span>
              <span className="font-semibold">
                {totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-300 pt-1">
              <span className="font-bold">Total Tax Amount</span>
              <span className="font-semibold">
                {totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Round Off</span>
              <span className="font-semibold">
                {roundOff >= 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t-2 border-black pt-1 font-extrabold text-sm">
              <span>Total Amount after Tax:</span>
              <span>{roundedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Signatory Box */}
          <div className="h-28 p-2 flex flex-col justify-between text-right border-t border-black">
            <div className="font-bold text-[11px]">
              For {companyName}
            </div>
            <div className="font-semibold text-[11px]">
              Authorised signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

