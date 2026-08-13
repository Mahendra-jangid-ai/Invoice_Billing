import type { Customer } from '@/lib/context'

export type CustomerGstFilter = 'all' | 'with' | 'without'

export interface CustomerSearchFilters {
  page: number
  limit: number
  search: string
  state: string
  gst: CustomerGstFilter
}

export interface CustomerSearchPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface CustomerSearchFacets {
  total: number
  withGst: number
  withoutGst: number
  topStates: Array<{ state: string; count: number }>
}

export interface CustomerSearchResponse {
  data: Customer[]
  pagination: CustomerSearchPagination
  facets: CustomerSearchFacets
}

export const DEFAULT_CUSTOMER_FILTERS: CustomerSearchFilters = {
  page: 1,
  limit: 20,
  search: '',
  state: '',
  gst: 'all',
}

export function buildCustomerSearchQuery(filters: CustomerSearchFilters): string {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('limit', String(filters.limit))

  if (filters.search) params.set('search', filters.search)
  if (filters.state) params.set('state', filters.state)
  if (filters.gst !== 'all') params.set('gst', filters.gst)

  return params.toString()
}

export function parseCustomerFiltersFromParams(searchParams: URLSearchParams): CustomerSearchFilters {
  const gstParam = searchParams.get('gst')
  const gst: CustomerGstFilter =
    gstParam === 'with' || gstParam === 'without' || gstParam === 'all' ? gstParam : 'all'

  return {
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    limit: Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20)),
    search: searchParams.get('search') || '',
    state: searchParams.get('state') || '',
    gst,
  }
}

export function filtersToSearchParams(filters: CustomerSearchFilters): URLSearchParams {
  return new URLSearchParams(buildCustomerSearchQuery(filters))
}

export function countActiveFilters(filters: CustomerSearchFilters): number {
  let count = 0
  if (filters.search) count++
  if (filters.state) count++
  if (filters.gst !== 'all') count++
  return count
}

export function filtersAreEqual(a: CustomerSearchFilters, b: CustomerSearchFilters): boolean {
  return (
    a.page === b.page &&
    a.limit === b.limit &&
    a.search === b.search &&
    a.state === b.state &&
    a.gst === b.gst
  )
}
