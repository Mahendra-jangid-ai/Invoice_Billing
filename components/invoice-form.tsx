'use client'

import { useState, useEffect } from 'react'
import { useBilling, Invoice, InvoiceLineItem } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

interface InvoiceFormProps {
  onSubmit: (invoice: Invoice) => void
  initialInvoice?: Invoice
}

export function InvoiceForm({ onSubmit, initialInvoice }: InvoiceFormProps) {
  const { customers, items, getNextInvoiceNumber } = useBilling()
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [customerId, setCustomerId] = useState('')
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([])
  const [taxPercentage, setTaxPercentage] = useState(18)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (initialInvoice) {
      setInvoiceNumber(initialInvoice.invoiceNumber)
      setDate(initialInvoice.date)
      setCustomerId(initialInvoice.customerId)
      setLineItems(initialInvoice.items || [])
      setTaxPercentage(initialInvoice.taxPercentage ?? 18)
      setNotes(initialInvoice.notes || '')
    } else {
      setInvoiceNumber(getNextInvoiceNumber())
    }
  }, [initialInvoice, getNextInvoiceNumber])

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        itemId: '',
        quantity: 1,
        rate: 0,
      },
    ])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (
    index: number,
    updates: Partial<InvoiceLineItem>
  ) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], ...updates }
    setLineItems(updated)
  }

  const handleItemSelect = (index: number, selectedItemId: string) => {
    const catalogItem = items.find((i) => String(i.id) === String(selectedItemId))
    const defaultRate = catalogItem ? Number(catalogItem.unitprice) || 0 : 0
    
    updateLineItem(index, {
      itemId: selectedItemId,
      rate: defaultRate,
    })
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, lineItem) => {
      const catalogItem = items.find((i) => String(i.id) === String(lineItem.itemId))
      const rate = Number(lineItem.rate) || Number(catalogItem?.unitprice) || 0
      const qty = Number(lineItem.quantity) || 0
      return sum + qty * rate
    }, 0)
  }

  const subtotal = calculateSubtotal()
  const tax = (subtotal * (Number(taxPercentage) || 0)) / 100
  const total = subtotal + tax

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerId) {
      alert('Please select a customer')
      return
    }

    if (lineItems.length === 0) {
      alert('Please add at least one item')
      return
    }

    // Ensure all line items have proper numerical rates and quantities
    const formattedLineItems = lineItems.map((lineItem) => {
      const catalogItem = items.find((i) => String(i.id) === String(lineItem.itemId))
      const rate = Number(lineItem.rate) || Number(catalogItem?.unitprice) || 0
      return {
        itemId: lineItem.itemId,
        quantity: Number(lineItem.quantity) || 1,
        rate: rate,
      }
    })

    const invoice: Invoice = {
      id: initialInvoice?.id || Date.now().toString(),
      invoiceNumber,
      date,
      customerId,
      items: formattedLineItems,
      taxPercentage: Number(taxPercentage) || 0,
      notes: notes || undefined,
      status: initialInvoice?.status || 'draft',
    }

    onSubmit(invoice)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Invoice Number
          </label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            required
          />
        </div>
      </div>

      {/* Customer Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Customer *
        </label>
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          required
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} ({customer.email})
            </option>
          ))}
        </select>
      </div>

      {/* Line Items Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Items
          </h3>
          <Button
            type="button"
            onClick={addLineItem}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        {lineItems.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">
            No items added. Click &quot;Add Item&quot; to start.
          </p>
        ) : (
          <div className="space-y-4">
            {lineItems.map((item, index) => {
              const selectedItem = items.find((i) => String(i.id) === String(item.itemId))
              const effectiveRate = Number(item.rate) || Number(selectedItem?.unitprice) || 0
              const itemAmount = (Number(item.quantity) || 0) * effectiveRate

              return (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                >
                  <select
                    value={item.itemId}
                    onChange={(e) => handleItemSelect(index, e.target.value)}
                    className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    required
                  >
                    <option value="">Select item</option>
                    {items.map((itm) => (
                      <option key={itm.id} value={itm.id}>
                        {itm.name} (₹{itm.unitprice})
                      </option>
                    ))}
                  </select>

                  <div className="w-full md:w-24">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(index, {
                          quantity: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      placeholder="Qty"
                      required
                    />
                  </div>

                  <div className="w-full md:w-32">
                    <input
                      type="number"
                      step="0.01"
                      value={item.rate ?? ''}
                      onChange={(e) =>
                        updateLineItem(index, {
                          rate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      placeholder="Rate"
                      required
                    />
                  </div>

                  <div className="w-full md:w-32 flex items-center justify-end rounded bg-slate-100 px-3 py-2 font-medium text-slate-900 dark:bg-slate-700 dark:text-white">
                    ₹{itemAmount.toFixed(2)}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="inline-flex items-center justify-center rounded px-2 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tax Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tax Percentage (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={taxPercentage}
            onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Terms & Conditions / Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholder="Payment terms, bank details, etc."
          />
        </div>
      </div>

      {/* Totals Summary */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex justify-between py-1 text-sm text-slate-700 dark:text-slate-300">
          <span>Subtotal:</span>
          <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1 text-sm text-slate-700 dark:text-slate-300">
          <span>Tax ({taxPercentage}%):</span>
          <span className="font-semibold">₹{tax.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-slate-300 pt-2 text-base font-bold text-slate-900 dark:border-slate-600 dark:text-white">
          <span>Grand Total:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex gap-4">
        <Button type="submit" className="w-full md:w-auto">
          {initialInvoice ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  )
}
