'use client'

import { RotateCcw, Search } from 'lucide-react'
import type { CustomerGstFilter, CustomerSearchFilters } from '@/lib/customer-search'
import { Button } from '@/components/ui/button'

interface CustomerFiltersProps {
  filters: CustomerSearchFilters
  onChange: (filters: CustomerSearchFilters) => void
  onReset: () => void
  topStates?: Array<{ state: string; count: number }>
}

const GST_OPTIONS: { value: CustomerGstFilter; label: string }[] = [
  { value: 'all', label: 'All GST' },
  { value: 'with', label: 'With GST' },
  { value: 'without', label: 'Without GST' },
]

const fieldClass =
  'h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10'

const labelClass = 'mb-1 block text-xs font-semibold text-slate-600 whitespace-nowrap'

export function CustomerFilters({ filters, onChange, onReset, topStates }: CustomerFiltersProps) {
  const update = (patch: Partial<CustomerSearchFilters>) => {
    onChange({ ...filters, ...patch, page: 1 })
  }

  return (
    <div className="premium-card overflow-hidden p-4 space-y-3">
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="min-w-0 sm:col-span-2 md:col-span-1 xl:col-span-1">
          <label className={labelClass}>Search</label>
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => update({ search: e.target.value })}
              placeholder="Name, email, phone, GST..."
              className={`${fieldClass} pl-10`}
            />
          </div>
        </div>

        <div className="min-w-0">
          <label className={labelClass}>State</label>
          <input
            type="text"
            value={filters.state}
            onChange={(e) => update({ state: e.target.value })}
            placeholder="Maharashtra"
            className={fieldClass}
          />
        </div>

        <div className="min-w-0">
          <label className={labelClass}>GST</label>
          <select
            value={filters.gst}
            onChange={(e) => update({ gst: e.target.value as CustomerGstFilter })}
            className={fieldClass}
          >
            {GST_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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

      {topStates && topStates.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-xs font-semibold text-slate-500">Top states:</span>
          {topStates.map((row) => (
            <button
              key={row.state}
              type="button"
              onClick={() => update({ state: row.state })}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                filters.state.toLowerCase() === row.state.toLowerCase()
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {row.state}
              <span className="font-semibold opacity-80">{row.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
