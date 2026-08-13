import type { Item } from '@/lib/context'

export interface ItemSearchFilters {
  page: number
  limit: number
  search: string
  hsnsac: string
  minPrice: string
  maxPrice: string
}

export interface ItemSearchPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface ItemSearchFacets {
  total: number
  avgPrice: number
  minCatalogPrice: number
  maxCatalogPrice: number
  filteredAvgPrice: number
}

export interface ItemSearchResponse {
  data: Item[]
  pagination: ItemSearchPagination
  facets: ItemSearchFacets
}

export const DEFAULT_ITEM_FILTERS: ItemSearchFilters = {
  page: 1,
  limit: 20,
  search: '',
  hsnsac: '',
  minPrice: '',
  maxPrice: '',
}

export function buildItemSearchQuery(filters: ItemSearchFilters): string {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('limit', String(filters.limit))

  if (filters.search) params.set('search', filters.search)
  if (filters.hsnsac) params.set('hsnsac', filters.hsnsac)
  if (filters.minPrice) params.set('minPrice', filters.minPrice)
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)

  return params.toString()
}

export function parseItemFiltersFromParams(searchParams: URLSearchParams): ItemSearchFilters {
  return {
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    limit: Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20)),
    search: searchParams.get('search') || '',
    hsnsac: searchParams.get('hsnsac') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  }
}

export function filtersToSearchParams(filters: ItemSearchFilters): URLSearchParams {
  return new URLSearchParams(buildItemSearchQuery(filters))
}

export function countActiveFilters(filters: ItemSearchFilters): number {
  let count = 0
  if (filters.search) count++
  if (filters.hsnsac) count++
  if (filters.minPrice) count++
  if (filters.maxPrice) count++
  return count
}

export function filtersAreEqual(a: ItemSearchFilters, b: ItemSearchFilters): boolean {
  return (
    a.page === b.page &&
    a.limit === b.limit &&
    a.search === b.search &&
    a.hsnsac === b.hsnsac &&
    a.minPrice === b.minPrice &&
    a.maxPrice === b.maxPrice
  )
}
