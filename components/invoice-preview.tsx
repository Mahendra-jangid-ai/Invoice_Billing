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

  const getAmountInWords = (num: number): string => {
    if (num <= 0 || isNaN(num)) return 'Zero Only'

    const ones = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ]
    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ]

    const convertTwoDigits = (n: number): string => {
      if (n < 20) return ones[n]
      const tenDigit = Math.floor(n / 10)
      const oneDigit = n % 10
      return (tens[tenDigit] + (oneDigit ? ' ' + ones[oneDigit] : '')).trim()
    }

    const convertThreeDigits = (n: number): string => {
      const hundred = Math.floor(n / 100)
      const remainder = n % 100
      let str = ''
      if (hundred > 0) {
        str += ones[hundred] + ' Hundred'
      }
      if (remainder > 0) {
        str += (str ? ' ' : '') + convertTwoDigits(remainder)
      }
      return str
    }

    const crores = Math.floor(num / 10000000)
    const lakhs = Math.floor((num % 10000000) / 100000)
    const thousands = Math.floor((num % 100000) / 1000)
    const remainder = Math.floor(num % 1000)

    const parts: string[] = []

    if (crores > 0) {
      parts.push(convertTwoDigits(crores) + ' Crore')
    }
    if (lakhs > 0) {
      parts.push(convertTwoDigits(lakhs) + ' Lakh')
    }
    if (thousands > 0) {
      parts.push(convertTwoDigits(thousands) + ' Thousand')
    }
    if (remainder > 0) {
      parts.push(convertThreeDigits(remainder))
    }

    return parts.join(' ') + ' Only'
  }

  const companyName = company.name || 'SK INTERIORS'
  const companyAddress = company.address || 'Office No. 14, Hansraj Molakram Chawl, PP Road, Ambewadi Mumbai Maharashtra - 400069'
  const companyGst = company.gstnumber || '27CAOPK3510K1ZJ'
  const contactPerson = company.contactPerson || ''
  const companyPhone = company.phone || ''
  const companyState = company.state || 'MAHARASHTRA'
  const companyStateCode = company.code || '27'

  const contactLine = [contactPerson, companyPhone].filter(Boolean).join(' • ')

  return (
    <div
      className="printable-area mx-auto w-[760px] max-w-full rounded-xl border border-slate-300 bg-white p-5 text-slate-900 font-sans shadow-md space-y-4"
      style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
    >
      {/* 1. Header Block: Top Left Logo + Right Company Profile */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 gap-4" style={{ borderColor: '#0f172a' }}>
        {/* Top-Left Logo Container */}
        <div className="w-1/3 flex justify-start items-center">
          {company.logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={company.logoUrl}
              alt={companyName}
              className="max-h-20 max-w-[200px] object-contain"
            />
          ) : (
            <div
              className="rounded-lg px-3 py-2"
              style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
            >
              <h1 className="text-xl font-black uppercase tracking-wider" style={{ color: '#ffffff' }}>
                {companyName}
              </h1>
            </div>
          )}
        </div>

        {/* Company Info (Right Aligned) */}
        <div className="w-2/3 flex flex-col items-end text-right space-y-1">
          {company.logoUrl && (
            <h1 className="text-xl font-black uppercase tracking-wide" style={{ color: '#0f172a' }}>
              {companyName}
            </h1>
          )}

          <p className="font-medium text-[11px] leading-snug max-w-md" style={{ color: '#334155' }}>
            {companyAddress}
          </p>

          <div className="flex flex-col items-end pt-1 space-y-0.5 text-[11px]">
            <p className="font-bold" style={{ color: '#0f172a' }}>
              GSTIN NO. : {companyGst}
            </p>
            {contactLine && (
              <p className="font-semibold" style={{ color: '#1e293b' }}>
                {contactLine}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Banner Title: TAX INVOICE */}
      <div
        className="flex items-center justify-between px-4 py-2 rounded-lg"
        style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
      >
        <span className="text-sm font-extrabold uppercase tracking-widest" style={{ color: '#ffffff' }}>
          TAX INVOICE
        </span>
        <span className="text-[11px] font-semibold" style={{ color: '#cbd5e1' }}>
          Original for Recipient
        </span>
      </div>

      {/* 3. Invoice Metadata Grid (Aligned Key-Value Layout) */}
      <div
        className="grid grid-cols-2 gap-4 rounded-lg border p-3 text-[11px]"
        style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
      >
        {/* Left Column Metadata */}
        <div className="space-y-1.5 border-r pr-3" style={{ borderColor: '#cbd5e1' }}>
          <div className="flex items-center">
            <span className="font-semibold w-36 shrink-0" style={{ color: '#475569' }}>Invoice Number:</span>
            <span className="font-bold" style={{ color: '#0f172a' }}>{invoice.invoiceNumber || '-'}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-36 shrink-0" style={{ color: '#475569' }}>Date of Issue:</span>
            <span className="font-medium" style={{ color: '#0f172a' }}>
              {invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '-'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-36 shrink-0" style={{ color: '#475569' }}>Reverse Charge:</span>
            <span className="font-bold" style={{ color: '#0f172a' }}>{invoice.reverseCharge || 'No'}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-36 shrink-0" style={{ color: '#475569' }}>Supplier State & Code:</span>
            <span className="font-bold" style={{ color: '#0f172a' }}>
              {invoice.companyState || companyState} ({invoice.companyStateCode || companyStateCode})
            </span>
          </div>
        </div>

        {/* Right Column Metadata */}
        <div className="space-y-1.5 pl-1">
          <div className="flex items-center">
            <span className="font-semibold w-36 shrink-0" style={{ color: '#475569' }}>Work Order (WO) No:</span>
            <span className="font-bold" style={{ color: '#0f172a' }}>{invoice.woNumber || '-'}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-36 shrink-0" style={{ color: '#475569' }}>Description of Service:</span>
            <span className="font-medium" style={{ color: '#0f172a' }}>{invoice.descriptionOfService || '-'}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-36 shrink-0" style={{ color: '#475569' }}>Period of Service:</span>
            <span className="font-medium" style={{ color: '#0f172a' }}>{invoice.periodOfService || '-'}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-36 shrink-0" style={{ color: '#475569' }}>Place of Service:</span>
            <span className="font-medium" style={{ color: '#0f172a' }}>{invoice.placeOfService || '-'}</span>
          </div>
        </div>
      </div>

      {/* 4. Parties Cards: Bill To vs. Ship To */}
      <div className="grid grid-cols-2 gap-3 text-[11px]">
        {/* Bill to Party Card */}
        <div className="rounded-lg border bg-white p-3 space-y-1 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
          <div className="flex items-center justify-between border-b pb-2 mb-1" style={{ borderColor: '#e2e8f0' }}>
            <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: '#0f172a' }}>
              Bill to Party
            </span>
            <span
              className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-bold leading-none shrink-0"
              style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}
            >
              Billing
            </span>
          </div>
          <p className="font-bold text-xs pt-0.5" style={{ color: '#0f172a' }}>{billTo.name || '-'}</p>
          <p className="leading-snug font-normal" style={{ color: '#334155' }}>{billTo.address || '-'}</p>
          <div className="pt-1 flex flex-wrap items-center gap-2 text-[10px]">
            <span className="font-semibold" style={{ color: '#475569' }}>GSTIN: <span className="font-bold" style={{ color: '#0f172a' }}>{billTo.gstin || '-'}</span></span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span className="font-semibold" style={{ color: '#475569' }}>State: <span className="font-bold" style={{ color: '#0f172a' }}>{billTo.state || '-'} ({billTo.code || '-'})</span></span>
          </div>
        </div>

        {/* Ship to Party Card */}
        <div className="rounded-lg border bg-white p-3 space-y-1 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
          <div className="flex items-center justify-between border-b pb-2 mb-1" style={{ borderColor: '#e2e8f0' }}>
            <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: '#0f172a' }}>
              Ship to Party (Site Address)
            </span>
            <span
              className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-bold leading-none shrink-0"
              style={{ backgroundColor: '#d1fae5', color: '#065f46' }}
            >
              Shipping
            </span>
          </div>
          <p className="font-bold text-xs pt-0.5" style={{ color: '#0f172a' }}>{shipTo.name || billTo.name || '-'}</p>
          <p className="leading-snug font-normal" style={{ color: '#334155' }}>{shipTo.address || billTo.address || '-'}</p>
          <div className="pt-1 flex flex-wrap items-center gap-2 text-[10px]">
            <span className="font-semibold" style={{ color: '#475569' }}>GSTIN: <span className="font-bold" style={{ color: '#0f172a' }}>{shipTo.gstin || billTo.gstin || '-'}</span></span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span className="font-semibold" style={{ color: '#475569' }}>State: <span className="font-bold" style={{ color: '#0f172a' }}>{shipTo.state || billTo.state || '-'} ({shipTo.code || billTo.code || '-'})</span></span>
          </div>
        </div>
      </div>

      {/* 5. Products & Services Table (With Explicit Styles on EVERY TH Cell) */}
      <div className="rounded-lg border overflow-hidden shadow-sm" style={{ borderColor: '#cbd5e1' }}>
        <table className="w-full border-collapse text-[11px] text-left">
          <thead>
            <tr className="align-middle">
              <th rowSpan={2} className="p-2 text-center border-r align-middle font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155', width: '38px' }}>Sr.</th>
              <th rowSpan={2} className="p-2 text-left border-r align-middle font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155' }}>Product / Service Description</th>
              <th rowSpan={2} className="p-2 text-center border-r align-middle font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155', width: '55px' }}>SAC</th>
              <th rowSpan={2} className="p-2 text-center border-r align-middle font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155', width: '45px' }}>Unit</th>
              <th rowSpan={2} className="p-2 text-center border-r align-middle font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155', width: '38px' }}>Qty</th>
              <th rowSpan={2} className="p-2 text-right border-r align-middle font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155', width: '75px' }}>Rate</th>
              <th rowSpan={2} className="p-2 text-right border-r align-middle font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155', width: '85px' }}>Taxable Value</th>
              <th colSpan={2} className="p-1.5 text-center border-r font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155' }}>
                CGST
              </th>
              <th colSpan={2} className="p-1.5 text-center border-r font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155' }}>
                SGST
              </th>
              <th rowSpan={2} className="p-2 text-right align-middle font-bold" style={{ backgroundColor: '#0f172a', color: '#ffffff', width: '90px' }}>Total</th>
            </tr>
            <tr className="align-middle border-b" style={{ borderColor: '#cbd5e1' }}>
              <th className="p-1 text-center border-r font-semibold text-[10px]" style={{ backgroundColor: '#f1f5f9', color: '#0f172a', borderColor: '#cbd5e1', width: '38px' }}>Rate</th>
              <th className="p-1 text-right border-r font-semibold text-[10px]" style={{ backgroundColor: '#f1f5f9', color: '#0f172a', borderColor: '#cbd5e1', width: '65px' }}>Amount</th>
              <th className="p-1 text-center border-r font-semibold text-[10px]" style={{ backgroundColor: '#f1f5f9', color: '#0f172a', borderColor: '#cbd5e1', width: '38px' }}>Rate</th>
              <th className="p-1 text-right border-r font-semibold text-[10px]" style={{ backgroundColor: '#f1f5f9', color: '#0f172a', borderColor: '#cbd5e1', width: '65px' }}>Amount</th>
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
                <tr
                  key={index}
                  className="border-b text-[11px]"
                  style={{ borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}
                >
                  <td className="p-2 text-center font-medium border-r" style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
                    {index + 1}
                  </td>
                  <td className="p-2 font-semibold border-r" style={{ color: '#0f172a', borderColor: '#e2e8f0' }}>
                    {item.description || 'Service / Product'}
                  </td>
                  <td className="p-2 text-center border-r font-mono text-[10px]" style={{ color: '#475569', borderColor: '#e2e8f0' }}>
                    {item.sacCode || '9954'}
                  </td>
                  <td className="p-2 text-center border-r font-medium" style={{ color: '#475569', borderColor: '#e2e8f0' }}>
                    {item.unit || 'Nos'}
                  </td>
                  <td className="p-2 text-center border-r font-bold" style={{ color: '#0f172a', borderColor: '#e2e8f0' }}>
                    {qty}
                  </td>
                  <td className="p-2 text-right border-r font-medium" style={{ color: '#1e293b', borderColor: '#e2e8f0' }}>
                    ₹{rate ? rate.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="p-2 text-right border-r font-medium" style={{ color: '#0f172a', borderColor: '#e2e8f0' }}>
                    ₹{lineAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 text-center border-r text-[10px]" style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
                    {cgstPercentage}%
                  </td>
                  <td className="p-1 text-right border-r text-[10px]" style={{ color: '#334155', borderColor: '#e2e8f0' }}>
                    ₹{lineCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 text-center border-r text-[10px]" style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
                    {sgstPercentage}%
                  </td>
                  <td className="p-1 text-right border-r text-[10px]" style={{ color: '#334155', borderColor: '#e2e8f0' }}>
                    ₹{lineSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-right font-bold" style={{ color: '#0f172a' }}>
                    ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )
            })}

            {/* Total Summary Row */}
            <tr className="border-t-2 font-bold text-[11px]" style={{ backgroundColor: '#f1f5f9', color: '#0f172a', borderColor: '#0f172a' }}>
              <td className="p-2 text-center border-r" colSpan={4} style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>
                TOTAL SUMMARY
              </td>
              <td className="p-2 text-center border-r font-bold" style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>
                {itemsList.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)}
              </td>
              <td className="p-2 border-r" style={{ borderColor: '#cbd5e1' }}></td>
              <td className="p-2 text-right border-r font-bold" style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>
                ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="p-1 border-r" style={{ borderColor: '#cbd5e1' }}></td>
              <td className="p-1 text-right border-r font-bold" style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>
                ₹{totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="p-1 border-r" style={{ borderColor: '#cbd5e1' }}></td>
              <td className="p-1 text-right border-r font-bold" style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>
                ₹{totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="p-2 text-right font-bold" style={{ color: '#0f172a' }}>
                ₹{rawTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 6. Footer Section: Amount in Words, Bank Details, Seal vs. Totals Summary */}
      <div className="space-y-3">
        {/* Amount in Words Card */}
        <div
          className="rounded-lg border p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-[11px]"
          style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
        >
          <span className="font-bold uppercase tracking-wider shrink-0" style={{ color: '#1e3a8a' }}>
            Total Invoice Amount in Words:
          </span>
          <span className="font-extrabold text-xs italic" style={{ color: '#0f172a' }}>
            INR {getAmountInWords(roundedTotal)}
          </span>
        </div>

        <div className="grid grid-cols-12 gap-3 text-[11px]">
          {/* Left Column: Bank Details & Common Seal */}
          <div className="col-span-7 space-y-3">
            {/* Bank Details Box */}
            <div
              className="rounded-lg border p-3 space-y-1.5"
              style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
            >
              <h3 className="font-bold border-b pb-1 uppercase text-[10px] tracking-wider" style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>
                Bank Account Details (Payment via NEFT/RTGS)
              </h3>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center">
                  <span className="font-semibold w-28 shrink-0" style={{ color: '#475569' }}>Bank Name:</span>
                  <span className="font-bold" style={{ color: '#0f172a' }}>{company.bankName || 'Axis Bank'}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-28 shrink-0" style={{ color: '#475569' }}>Bank A/c Name:</span>
                  <span className="font-bold" style={{ color: '#0f172a' }}>
                    {company.bankAccountName || `${companyName} Bank A/c No.`} {company.bankAccountNumber || '923020047215171'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-28 shrink-0" style={{ color: '#475569' }}>IFSC Code:</span>
                  <span className="font-bold" style={{ color: '#0f172a' }}>{company.bankIfsc || 'UTIB0001584'}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-28 shrink-0" style={{ color: '#475569' }}>Branch:</span>
                  <span className="font-bold" style={{ color: '#0f172a' }}>{company.bankBranch || 'OLD NAGARDAS ROAD'}</span>
                </div>
              </div>
            </div>

            {/* Common Seal Box */}
            <div
              className="rounded-lg border border-dashed p-2.5 text-center font-semibold uppercase text-[10px] tracking-widest"
              style={{ backgroundColor: '#f8fafc', color: '#94a3b8', borderColor: '#cbd5e1' }}
            >
              Common Seal
            </div>
          </div>

          {/* Right Column: Totals Breakdown & Authorised Signatory */}
          <div className="col-span-5 flex flex-col justify-between space-y-3">
            <div
              className="rounded-lg border p-3 space-y-1 text-[11px]"
              style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
            >
              <div className="flex justify-between py-0.5">
                <span style={{ color: '#475569' }}>Total Amount before Tax:</span>
                <span className="font-bold" style={{ color: '#0f172a' }}>
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span style={{ color: '#475569' }}>Add: CGST ({cgstPercentage}%):</span>
                <span className="font-semibold" style={{ color: '#0f172a' }}>
                  ₹{totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span style={{ color: '#475569' }}>Add: SGST ({sgstPercentage}%):</span>
                <span className="font-semibold" style={{ color: '#0f172a' }}>
                  ₹{totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-t pt-1" style={{ borderColor: '#cbd5e1' }}>
                <span className="font-semibold" style={{ color: '#334155' }}>Total Tax Amount:</span>
                <span className="font-bold" style={{ color: '#0f172a' }}>
                  ₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span style={{ color: '#475569' }}>Round Off:</span>
                <span className="font-mono" style={{ color: '#1e293b' }}>
                  {roundOff >= 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}
                </span>
              </div>
              <div
                className="flex justify-between items-center border-t-2 pt-1.5 p-2 rounded mt-1"
                style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#0f172a' }}
              >
                <span className="font-bold text-[10px] uppercase tracking-wider" style={{ color: '#ffffff' }}>Total Amount after Tax:</span>
                <span className="font-extrabold text-sm" style={{ color: '#ffffff' }}>
                  ₹{roundedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Authorised Signatory Box */}
            <div
              className="rounded-lg border p-2.5 flex flex-col justify-between h-20 text-right bg-white"
              style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
            >
              <p className="font-bold text-[10px]" style={{ color: '#0f172a' }}>
                For {companyName}
              </p>
              <p className="font-bold text-[10px] border-t pt-1 inline-block ml-auto" style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
                Authorised Signatory
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
