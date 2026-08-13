'use client'

import { RotateCcw, Search } from 'lucide-react'
import type { InvoiceSearchFilters, InvoiceStatusFilter } from '@/lib/invoice-search'
import { Button } from '@/components/ui/button'

interface InvoiceFiltersProps {
  filters: InvoiceSearchFilters
  onChange: (filters: InvoiceSearchFilters) => void
  onReset: () => void
}

const STATUS_OPTIONS: { value: InvoiceStatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'finalized', label: 'Finalized' },
  { value: 'paid', label: 'Paid' },
]

const fieldClass =
  'h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10'

const labelClass = 'mb-1 block text-xs font-semibold text-slate-600 whitespace-nowrap'

export function InvoiceFilters({ filters, onChange, onReset }: InvoiceFiltersProps) {
  const update = (patch: Partial<InvoiceSearchFilters>) => {
    onChange({ ...filters, ...patch, page: 1 })
  }

  return (
    <div className="premium-card overflow-hidden p-4">
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="min-w-0 sm:col-span-2 md:col-span-1 xl:col-span-1">
          <label className={labelClass}>Search</label>
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => update({ search: e.target.value })}
              placeholder="Invoice #, customer..."
              className={`${fieldClass} pl-10`}
            />
          </div>
        </div>

        <div className="min-w-0">
          <label className={labelClass}>Status</label>
          <select
            value={filters.status}
            onChange={(e) => update({ status: e.target.value as InvoiceStatusFilter })}
            className={fieldClass}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <label className={labelClass}>Invoice number</label>
          <input
            type="text"
            value={filters.invoiceNumber}
            onChange={(e) => update({ invoiceNumber: e.target.value })}
            placeholder="INV-0001"
            className={fieldClass}
          />
        </div>

        <div className="min-w-0">
          <label className={labelClass}>Customer name</label>
          <input
            type="text"
            value={filters.customerName}
            onChange={(e) => update({ customerName: e.target.value })}
            placeholder="Bill-to name"
            className={fieldClass}
          />
        </div>

        <div className="min-w-0">
          <label className={labelClass}>Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => update({ date: e.target.value })}
            className={fieldClass}
          />
        </div>

        <div className="sm:col-span-2 md:col-span-1 xl:col-span-1">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="h-10 w-full gap-2 px-3 xl:w-auto"
            title="Reset filters"
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            <span>Reset</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
