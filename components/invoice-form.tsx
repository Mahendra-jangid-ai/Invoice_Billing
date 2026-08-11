'use client'

import { useState, useEffect } from 'react'
import { useBilling, Invoice, InvoiceLineItem, InvoiceParty } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Copy } from 'lucide-react'

interface InvoiceFormProps {
  onSubmit: (invoice: Invoice) => void
  initialInvoice?: Invoice
}

export function InvoiceForm({ onSubmit, initialInvoice }: InvoiceFormProps) {
  const { customers, items, company, getNextInvoiceNumber } = useBilling()
  
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
    setLineItems(lineItems.filter((_, i) => i !== index))
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

    if (!billTo.name) {
      alert('Please select a customer or enter Bill to Party Name')
      return
    }

    if (lineItems.length === 0) {
      alert('Please add at least one item')
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Header Metadata Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b pb-2 dark:border-slate-800">
          Invoice & Service Metadata (Dynamic)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Invoice Number *
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reverse Charge (Y/N)
            </label>
            <select
              value={reverseCharge}
              onChange={(e) => setReverseCharge(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              WO No. (Work Order)
            </label>
            <input
              type="text"
              value={woNumber}
              onChange={(e) => setWoNumber(e.target.value)}
              placeholder="e.g. WO-2026-99"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description of Service
            </label>
            <input
              type="text"
              value={descriptionOfService}
              onChange={(e) => setDescriptionOfService(e.target.value)}
              placeholder="e.g. Carpentry / Interior Work"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Period of Service
            </label>
            <input
              type="text"
              value={periodOfService}
              onChange={(e) => setPeriodOfService(e.target.value)}
              placeholder="e.g. July 2026"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Place of Service (State)
            </label>
            <input
              type="text"
              value={placeOfService}
              onChange={(e) => setPlaceOfService(e.target.value)}
              placeholder="e.g. MAHARASHTRA"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Place of Service Code
            </label>
            <input
              type="text"
              value={placeOfServiceCode}
              onChange={(e) => setPlaceOfServiceCode(e.target.value)}
              placeholder="e.g. 27"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 2. Customer & Parties Section (Bill To & Ship To) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Parties (Bill To & Ship To)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an existing customer or type details manually
            </p>
          </div>

          <div className="w-full md:w-72">
            <select
              value={customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-950 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">-- Select Customer (Auto-fill) --</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.gstnumber || 'No GST'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bill To Box */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-3">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Bill to Party</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Name *</label>
              <input
                type="text"
                value={billTo.name}
                onChange={(e) => setBillTo({ ...billTo, name: e.target.value })}
                placeholder="e.g. Salus Advisory LLP"
                className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Address</label>
              <textarea
                value={billTo.address}
                onChange={(e) => setBillTo({ ...billTo, address: e.target.value })}
                placeholder="Full billing address..."
                rows={2}
                className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">GSTIN</label>
                <input
                  type="text"
                  value={billTo.gstin}
                  onChange={(e) => setBillTo({ ...billTo, gstin: e.target.value })}
                  placeholder="27AFEFS5822F1ZY"
                  className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">State</label>
                  <input
                    type="text"
                    value={billTo.state}
                    onChange={(e) => setBillTo({ ...billTo, state: e.target.value })}
                    placeholder="MAHARASHTRA"
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Code</label>
                  <input
                    type="text"
                    value={billTo.code}
                    onChange={(e) => setBillTo({ ...billTo, code: e.target.value })}
                    placeholder="27"
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ship To Box */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Ship to Party (Site Address)
              </h3>
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsBillTo}
                  onChange={(e) => {
                    setSameAsBillTo(e.target.checked)
                    if (e.target.checked) handleCopyBillTo()
                  }}
                  className="rounded border-slate-300 text-slate-900"
                />
                Same as Bill To
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Name</label>
              <input
                type="text"
                value={sameAsBillTo ? billTo.name : shipTo.name}
                onChange={(e) => setShipTo({ ...shipTo, name: e.target.value })}
                disabled={sameAsBillTo}
                placeholder="e.g. Salus Advisory LLP"
                className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Address</label>
              <textarea
                value={sameAsBillTo ? billTo.address : shipTo.address}
                onChange={(e) => setShipTo({ ...shipTo, address: e.target.value })}
                disabled={sameAsBillTo}
                placeholder="Site / Delivery Address..."
                rows={2}
                className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">GSTIN</label>
                <input
                  type="text"
                  value={sameAsBillTo ? billTo.gstin : shipTo.gstin}
                  onChange={(e) => setShipTo({ ...shipTo, gstin: e.target.value })}
                  disabled={sameAsBillTo}
                  placeholder="27AFEFS5822F1ZY"
                  className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">State</label>
                  <input
                    type="text"
                    value={sameAsBillTo ? billTo.state : shipTo.state}
                    onChange={(e) => setShipTo({ ...shipTo, state: e.target.value })}
                    disabled={sameAsBillTo}
                    placeholder="MAHARASHTRA"
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Code</label>
                  <input
                    type="text"
                    value={sameAsBillTo ? billTo.code : shipTo.code}
                    onChange={(e) => setShipTo({ ...shipTo, code: e.target.value })}
                    disabled={sameAsBillTo}
                    placeholder="27"
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Products & Services Line Items Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Products / Services Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add products or services with SAC/HSN codes, units, and rates
            </p>
          </div>
          <Button
            type="button"
            onClick={addLineItem}
            variant="outline"
            className="gap-2 border-slate-300 text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100"
          >
            <Plus className="h-4 w-4" />
            Add Row
          </Button>
        </div>

        {lineItems.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg dark:border-slate-800">
            <p className="text-slate-500 text-sm">No items added yet. Click &quot;Add Row&quot; above.</p>
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
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 border-b pb-2 dark:border-slate-700">
                    <span>Item #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="text-slate-700 hover:text-slate-900 text-xs flex items-center gap-1 dark:text-slate-300 dark:hover:text-slate-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove Row
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Catalog Item Select */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Select Catalog Item (Optional)
                      </label>
                      <select
                        value={item.itemId}
                        onChange={(e) => handleCatalogItemSelect(index, e.target.value)}
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="">Custom Item</option>
                        {items.map((itm) => (
                          <option key={itm.id} value={itm.id}>
                            {itm.name} (₹{itm.unitprice})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Product Description */}
                    <div className="md:col-span-4">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Product / Service Description *
                      </label>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) =>
                          updateLineItem(index, { description: e.target.value })
                        }
                        placeholder="e.g. T.v Unit and Bar Unit And Book Storage"
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        required
                      />
                    </div>

                    {/* SAC Code */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        SAC/HSN Code
                      </label>
                      <input
                        type="text"
                        value={item.sacCode || ''}
                        onChange={(e) =>
                          updateLineItem(index, { sacCode: e.target.value })
                        }
                        placeholder="9954"
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    {/* Unit */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={item.unit || ''}
                        onChange={(e) =>
                          updateLineItem(index, { unit: e.target.value })
                        }
                        placeholder="Nos / Sqft / Pcs"
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    {/* Qty */}
                    <div className="md:col-span-4">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(index, {
                            quantity: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        required
                      />
                    </div>

                    {/* Rate */}
                    <div className="md:col-span-4">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Rate (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) =>
                          updateLineItem(index, {
                            rate: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        required
                      />
                    </div>

                    {/* Total Line Amount */}
                    <div className="md:col-span-4 flex flex-col justify-end">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Amount (₹)
                      </label>
                      <div className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
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

      {/* 4. Tax & Terms Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Total GST Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
              placeholder="e.g. 18 (CGST 9% + SGST 9%)"
              className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-500">
              Auto-calculates CGST ({(taxPercentage / 2).toFixed(1)}%) & SGST ({(taxPercentage / 2).toFixed(1)}%)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cash Discount (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cashDiscount}
              onChange={(e) => setCashDiscount(parseFloat(e.target.value) || 0)}
              placeholder="e.g. 500.00"
              className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Payment Terms
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Enter optional notes..."
              className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-2 dark:border-slate-800">
            Calculation Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Amount before Tax:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>CGST ({(taxPercentage / 2).toFixed(1)}%):</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ₹{(totalTax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>SGST ({(taxPercentage / 2).toFixed(1)}%):</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ₹{(totalTax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Tax Amount:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Cash Discount:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                -₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-base text-slate-900 dark:text-white">
              <span>Payable Amount:</span>
            <span className="text-slate-950 dark:text-slate-100">
                ₹{totalAfterDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <Button type="submit" className="w-full bg-slate-950 hover:bg-slate-800 text-white font-semibold py-3">
            {initialInvoice ? 'Update Invoice' : 'Generate GST Invoice'}
          </Button>
        </div>
      </div>
    </form>
  )
}

