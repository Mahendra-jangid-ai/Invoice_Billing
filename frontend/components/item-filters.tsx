'use client'

import { RotateCcw, Search } from 'lucide-react'
import type { ItemSearchFilters } from '@/lib/item-search'
import { Button } from '@/components/ui/button'

interface ItemFiltersProps {
  filters: ItemSearchFilters
  onChange: (filters: ItemSearchFilters) => void
  onReset: () => void
  priceRange?: { min: number; max: number }
}

const fieldClass =
  'h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10'

const labelClass = 'mb-1 block text-xs font-semibold text-slate-600 whitespace-nowrap'

export function ItemFilters({ filters, onChange, onReset, priceRange }: ItemFiltersProps) {
  const update = (patch: Partial<ItemSearchFilters>) => {
    onChange({ ...filters, ...patch, page: 1 })
  }

  return (
    <div className="premium-card overflow-hidden p-4 space-y-3">
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="min-w-0 sm:col-span-2 md:col-span-1 xl:col-span-1">
          <label className={labelClass}>Search</label>
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => update({ search: e.target.value })}
              placeholder="Name, description, HSN..."
              className={`${fieldClass} pl-10`}
            />
          </div>
        </div>

        <div className="min-w-0">
          <label className={labelClass}>HSN / SAC</label>
          <input
            type="text"
            value={filters.hsnsac}
            onChange={(e) => update({ hsnsac: e.target.value })}
            placeholder="9983"
            className={fieldClass}
          />
        </div>

        <div className="min-w-0">
          <label className={labelClass}>Min price (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filters.minPrice}
            onChange={(e) => update({ minPrice: e.target.value })}
            placeholder="0"
            className={fieldClass}
          />
        </div>

        <div className="min-w-0">
          <label className={labelClass}>Max price (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: e.target.value })}
            placeholder="10000"
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

      {priceRange && priceRange.max > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="font-semibold">Catalog range:</span>
          <span className="inr-amount font-medium">₹{priceRange.min.toLocaleString('en-IN')}</span>
          <span>—</span>
          <span className="inr-amount font-medium">₹{priceRange.max.toLocaleString('en-IN')}</span>
        </div>
      )}
    </div>
  )
}
