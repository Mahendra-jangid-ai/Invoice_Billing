'use client'

import { useState, useEffect } from 'react'
import { useBilling, Invoice, InvoiceLineItem, InvoiceParty } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { FormActions } from '@/components/form-actions'
import { Plus, Trash2 } from 'lucide-react'
import { INVOICE_PLACEHOLDERS } from '@/lib/form-placeholders'
import { useConfirm, useFeedback } from '@/components/confirm-provider'
import { StateCodeFields } from '@/components/state-select'
import { fieldClassName } from '@/components/form-field'
import { type FieldErrors, formatFieldErrors, hasErrors, validateInvoiceForm } from '@/lib/validation'

interface InvoiceFormProps {
  onSubmit: (invoice: Invoice) => void
  initialInvoice?: Invoice
}

const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5'

export function InvoiceForm({ onSubmit, initialInvoice }: InvoiceFormProps) {
  const { customers, items, company, getNextInvoiceNumber } = useBilling()
  const { confirm } = useConfirm()
  const { warning } = useFeedback()

  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [reverseCharge, setReverseCharge] = useState('No')
  const [woNumber, setWoNumber] = useState('')
  const [descriptionOfService, setDescriptionOfService] = useState('')
  const [periodOfService, setPeriodOfService] = useState('')
  const [placeOfService, setPlaceOfService] = useState('')
  const [placeOfServiceCode, setPlaceOfServiceCode] = useState('')

  const [customerId, setCustomerId] = useState('')
  const [billTo, setBillTo] = useState<InvoiceParty>({
    name: '',
    address: '',
    gstin: '',
    state: '',
    code: '',
  })
  const [sameAsBillTo, setSameAsBillTo] = useState(true)
  const [shipTo, setShipTo] = useState<InvoiceParty>({
    name: '',
    address: '',
    gstin: '',
    state: '',
    code: '',
  })

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([])
  const [taxPercentage, setTaxPercentage] = useState(18)
  const [cashDiscount, setCashDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (initialInvoice) {
      setInvoiceNumber(initialInvoice.invoiceNumber || '')
      setDate(initialInvoice.date || new Date().toISOString().split('T')[0])
      setReverseCharge(initialInvoice.reverseCharge || 'No')
      setWoNumber(initialInvoice.woNumber || '')
      setDescriptionOfService(initialInvoice.descriptionOfService || '')
      setPeriodOfService(initialInvoice.periodOfService || '')
      setPlaceOfService(initialInvoice.placeOfService || company.state || '')
      setPlaceOfServiceCode(initialInvoice.placeOfServiceCode || company.code || '')
      setCustomerId(initialInvoice.customerId || '')
      setBillTo(
        initialInvoice.billTo || {
          name: '',
          address: '',
          gstin: '',
          state: '',
          code: '',
        }
      )
      setSameAsBillTo(initialInvoice.sameAsBillTo ?? true)
      setShipTo(
        initialInvoice.shipTo || {
          name: '',
          address: '',
          gstin: '',
          state: '',
          code: '',
        }
      )
      setLineItems(initialInvoice.items || [])
      setTaxPercentage(initialInvoice.taxPercentage ?? 18)
      setCashDiscount(initialInvoice.cashDiscount?.discountAmount ?? 0)
      setNotes(initialInvoice.notes || '')
    } else {
      setInvoiceNumber(getNextInvoiceNumber())
      setPlaceOfService(company.state || '')
      setPlaceOfServiceCode(company.code || '')
    }
  }, [initialInvoice, getNextInvoiceNumber, company])

  const handleCustomerSelect = (selectedCustomerId: string) => {
    setCustomerId(selectedCustomerId)
    const cust = customers.find((c) => String(c.id) === String(selectedCustomerId))
    if (cust) {
      const partyData: InvoiceParty = {
        name: cust.name || '',
        address: cust.address || '',
        gstin: cust.gstnumber || '',
        state: cust.state || company.state || '',
        code: cust.code || company.code || '',
      }
      setBillTo(partyData)
      if (sameAsBillTo) {
        setShipTo(partyData)
      }
    }
  }

  const handleCopyBillTo = () => {
    setShipTo({ ...billTo })
  }

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        itemId: '',
        description: '',
        sacCode: '9954',
        unit: 'Nos',
        quantity: 1,
        rate: 0,
        taxRate: taxPercentage,
      },
    ])
  }

  const removeLineItem = (index: number) => {
    confirm({
      title: 'Remove line item?',
      description: 'Are you sure you want to remove this line item?',
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm: () => {
        setLineItems(lineItems.filter((_, i) => i !== index))
      },
    })
  }

  const updateLineItem = (index: number, updates: Partial<InvoiceLineItem>) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], ...updates }
    setLineItems(updated)
  }

  const handleCatalogItemSelect = (index: number, selectedItemId: string) => {
    const catalogItem = items.find((i) => String(i.id) === String(selectedItemId))
    if (catalogItem) {
      updateLineItem(index, {
        itemId: selectedItemId,
        description: catalogItem.name + (catalogItem.description ? ` - ${catalogItem.description}` : ''),
        sacCode: catalogItem.hsnsac || '9954',
        rate: Number(catalogItem.unitprice) || 0,
      })
    } else {
      updateLineItem(index, { itemId: selectedItemId })
    }
  }

  const subtotal = lineItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0
    const rate = Number(item.rate) || 0
    return sum + qty * rate
  }, 0)

  const totalTax = (subtotal * (Number(taxPercentage) || 0)) / 100
  const discountAmount = Number(cashDiscount) || 0
  const grandTotal = subtotal + totalTax
  const totalAfterDiscount = Math.max(grandTotal - discountAmount, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const nextErrors = validateInvoiceForm({
      invoiceNumber,
      date,
      billToName: billTo.name,
      billToGstin: billTo.gstin,
      billToState: billTo.state,
      sameAsBillTo,
      shipToName: shipTo.name,
      shipToGstin: shipTo.gstin,
      shipToState: shipTo.state,
      placeOfService,
      lineItems,
    })
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) {
      warning({
        title: 'Please fix the invoice',
        description: formatFieldErrors(nextErrors),
      })
      return
    }

    const formattedLineItems: InvoiceLineItem[] = lineItems.map((item) => ({
      itemId: item.itemId || Date.now().toString(),
      description: item.description || 'Service/Product Item',
      sacCode: item.sacCode || '9954',
      unit: item.unit || 'Nos',
      quantity: Number(item.quantity) || 1,
      rate: Number(item.rate) || 0,
      taxRate: Number(taxPercentage) || 0,
    }))

    const finalShipTo = sameAsBillTo ? { ...billTo } : shipTo

    const invoice: Invoice = {
      id: initialInvoice?.id || Date.now().toString(),
      invoiceNumber,
      date,
      reverseCharge,
      companyState: company.state || '',
      companyStateCode: company.code || '',
      woNumber,
      descriptionOfService,
      periodOfService,
      placeOfService,
      placeOfServiceCode,
      customerId,
      billTo,
      shipTo: finalShipTo,
      sameAsBillTo,
      items: formattedLineItems,
      taxPercentage: Number(taxPercentage) || 0,
      cashDiscount: discountAmount ? { discountAmount } : undefined,
      notes,
      status: initialInvoice?.status || 'draft',
    }

    onSubmit(invoice)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Invoice metadata */}
      <div className="premium-card p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">Invoice Details</h2>
          <p className="text-xs text-slate-400 mt-0.5">Basic invoice and service information.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelClass}>
              Invoice Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={invoiceNumber}
              readOnly
              tabIndex={-1}
              className="field-input cursor-not-allowed bg-slate-50 text-slate-600"
              required
              aria-readonly="true"
            />
            <p className="mt-1 text-xs text-slate-400">Auto-generated — cannot be edited</p>
          </div>

          <div>
            <label className={labelClass}>
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="field-input"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Reverse Charge (Y/N)</label>
            <select
              value={reverseCharge}
              onChange={(e) => setReverseCharge(e.target.value)}
              className="field-input"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>WO No. (Work Order)</label>
            <input
              type="text"
              value={woNumber}
              onChange={(e) => setWoNumber(e.target.value)}
              placeholder={INVOICE_PLACEHOLDERS.woNumber}
              className="field-input"
            />
          </div>

          <div>
            <label className={labelClass}>Description of Service</label>
            <input
              type="text"
              value={descriptionOfService}
              onChange={(e) => setDescriptionOfService(e.target.value)}
              placeholder={INVOICE_PLACEHOLDERS.descriptionOfService}
              className="field-input"
            />
          </div>

          <div>
            <label className={labelClass}>Period of Service</label>
            <input
              type="text"
              value={periodOfService}
              onChange={(e) => setPeriodOfService(e.target.value)}
              placeholder={INVOICE_PLACEHOLDERS.periodOfService}
              className="field-input"
            />
          </div>

          <div>
            <label className={labelClass}>Place of Service (State)</label>
            <StateCodeFields
              stateValue={placeOfService}
              codeValue={placeOfServiceCode}
              onChange={(state, code) => {
                setPlaceOfService(state)
                setPlaceOfServiceCode(code)
                if (errors.placeOfService) {
                  setErrors((prev) => {
                    const next = { ...prev }
                    delete next.placeOfService
                    return next
                  })
                }
              }}
              stateLabel="Place of Service"
              codeLabel="Place of Service Code"
              stateError={errors.placeOfService}
            />
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="premium-card p-6 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Bill To & Ship To</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select a customer or enter party details manually.</p>
          </div>

          <div className="w-full sm:w-72">
            <label className={labelClass}>Select Customer</label>
            <select
              value={customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="field-input"
            >
              <option value="">— Select customer (auto-fill) —</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.gstnumber || 'No GST'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Bill to Party</h3>

            <div>
              <label className={labelClass}>
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={billTo.name}
                onChange={(e) => setBillTo({ ...billTo, name: e.target.value })}
                placeholder={INVOICE_PLACEHOLDERS.partyName}
                className={fieldClassName(errors.billToName)}
              />
              {errors.billToName && <p className="mt-1 text-xs text-red-600">{errors.billToName}</p>}
            </div>

            <div>
              <label className={labelClass}>Address</label>
              <textarea
                value={billTo.address}
                onChange={(e) => setBillTo({ ...billTo, address: e.target.value })}
                placeholder={INVOICE_PLACEHOLDERS.partyAddress}
                rows={3}
                className="field-input resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>GSTIN</label>
                <input
                  type="text"
                  value={billTo.gstin}
                  onChange={(e) => setBillTo({ ...billTo, gstin: e.target.value.toUpperCase() })}
                  placeholder={INVOICE_PLACEHOLDERS.gstin}
                  className={fieldClassName(errors.billToGstin)}
                />
                {errors.billToGstin && <p className="mt-1 text-xs text-red-600">{errors.billToGstin}</p>}
              </div>
              <div className="sm:col-span-2">
                <StateCodeFields
                  stateValue={billTo.state}
                  codeValue={billTo.code}
                  onChange={(state, code) => setBillTo({ ...billTo, state, code })}
                  stateError={errors.billToState}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900">Ship to Party</h3>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={sameAsBillTo}
                  onChange={(e) => {
                    setSameAsBillTo(e.target.checked)
                    if (e.target.checked) handleCopyBillTo()
                  }}
                  className="rounded border-slate-300 text-[#2563EB]"
                />
                Same as Bill To
              </label>
            </div>

            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                value={sameAsBillTo ? billTo.name : shipTo.name}
                onChange={(e) => setShipTo({ ...shipTo, name: e.target.value })}
                disabled={sameAsBillTo}
                placeholder={INVOICE_PLACEHOLDERS.shipPartyName}
                className="field-input disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className={labelClass}>Address</label>
              <textarea
                value={sameAsBillTo ? billTo.address : shipTo.address}
                onChange={(e) => setShipTo({ ...shipTo, address: e.target.value })}
                disabled={sameAsBillTo}
                placeholder={INVOICE_PLACEHOLDERS.shipPartyAddress}
                rows={3}
                className="field-input resize-none disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>GSTIN</label>
                <input
                  type="text"
                  value={sameAsBillTo ? billTo.gstin : shipTo.gstin}
                  onChange={(e) => setShipTo({ ...shipTo, gstin: e.target.value })}
                  disabled={sameAsBillTo}
                  className="field-input disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
              <div className="sm:col-span-2">
                <StateCodeFields
                  stateValue={sameAsBillTo ? billTo.state : shipTo.state}
                  codeValue={sameAsBillTo ? billTo.code : shipTo.code}
                  onChange={(state, code) => setShipTo({ ...shipTo, state, code })}
                  stateError={errors.shipToState}
                  disabled={sameAsBillTo}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="premium-card p-6 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Products & Services</h2>
            <p className="text-xs text-slate-400 mt-0.5">Add line items with SAC/HSN codes, quantity, and rates.</p>
          </div>
          <Button type="button" onClick={addLineItem} variant="outline" className="gap-2 self-start">
            <Plus className="h-4 w-4" />
            Add Row
          </Button>
        </div>

        {lineItems.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center">
            <p className="text-sm text-slate-500">No items yet. Click &quot;Add Row&quot; to add a line item.</p>
            {errors.lineItems && <p className="mt-2 text-xs text-red-600">{errors.lineItems}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {lineItems.map((item, index) => {
              const qty = Number(item.quantity) || 0
              const rate = Number(item.rate) || 0
              const lineAmount = qty * rate

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-semibold text-slate-500">Item #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className={labelClass}>Catalog Item</label>
                      <select
                        value={item.itemId}
                        onChange={(e) => handleCatalogItemSelect(index, e.target.value)}
                        className="field-input"
                      >
                        <option value="">Custom item</option>
                        {items.map((itm) => (
                          <option key={itm.id} value={itm.id}>
                            {itm.name} (₹{itm.unitprice})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>
                        Description <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => updateLineItem(index, { description: e.target.value })}
                        placeholder={INVOICE_PLACEHOLDERS.lineDescription}
                        className={fieldClassName(errors[`lineItems.${index}.description`])}
                      />
                      {errors[`lineItems.${index}.description`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`lineItems.${index}.description`]}</p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>SAC / HSN Code</label>
                      <input
                        type="text"
                        value={item.sacCode || ''}
                        onChange={(e) => updateLineItem(index, { sacCode: e.target.value })}
                        placeholder={INVOICE_PLACEHOLDERS.sacCode}
                        className="field-input"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Unit</label>
                      <input
                        type="text"
                        value={item.unit || ''}
                        onChange={(e) => updateLineItem(index, { unit: e.target.value })}
                        placeholder={INVOICE_PLACEHOLDERS.unit}
                        className="field-input"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(index, { quantity: parseFloat(e.target.value) || 0 })
                        }
                        className="field-input"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Rate (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.rate}
                        onChange={(e) =>
                          updateLineItem(index, { rate: parseFloat(e.target.value) || 0 })
                        }
                        className="field-input"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Amount (₹)</label>
                      <div className="field-input bg-white font-semibold text-slate-900">
                        ₹{lineAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tax, notes & summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Tax & Notes</h2>
            <p className="text-xs text-slate-400 mt-0.5">GST rate, discounts, and payment terms.</p>
          </div>

          <div>
            <label className={labelClass}>Total GST Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
              placeholder={INVOICE_PLACEHOLDERS.taxRate}
              className="field-input"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              CGST {(taxPercentage / 2).toFixed(1)}% + SGST {(taxPercentage / 2).toFixed(1)}%
            </p>
          </div>

          <div>
            <label className={labelClass}>Cash Discount (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cashDiscount}
              onChange={(e) => setCashDiscount(parseFloat(e.target.value) || 0)}
              placeholder={INVOICE_PLACEHOLDERS.cashDiscount}
              className="field-input"
            />
          </div>

          <div>
            <label className={labelClass}>Notes / Payment Terms</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={INVOICE_PLACEHOLDERS.notes}
              className="field-input resize-none"
            />
          </div>
        </div>

        <div className="premium-card p-6 flex flex-col justify-between space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Calculation Summary</h2>
            <p className="text-xs text-slate-400 mt-0.5">Live totals based on line items.</p>
          </div>

          <div className="space-y-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex justify-between text-slate-600">
              <span>Amount before tax</span>
              <span className="font-semibold text-slate-900">
                ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>CGST ({(taxPercentage / 2).toFixed(1)}%)</span>
              <span className="font-semibold text-slate-900">
                ₹{(totalTax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>SGST ({(taxPercentage / 2).toFixed(1)}%)</span>
              <span className="font-semibold text-slate-900">
                ₹{(totalTax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total tax</span>
              <span className="font-semibold text-slate-900">
                ₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Cash discount</span>
              <span className="font-semibold text-slate-900">
                -₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-bold text-slate-900">
              <span>Payable amount</span>
              <span>₹{totalAfterDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      <FormActions className="is-sticky">
        <Button type="submit" className="gap-2">
          {initialInvoice ? 'Update invoice' : 'Save invoice'}
        </Button>
      </FormActions>
    </form>
  )
}
