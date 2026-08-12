import type { Invoice } from '@/lib/context'

export type InvoiceStatusFilter = 'all' | 'draft' | 'finalized' | 'paid'

export interface InvoiceSearchFilters {
  page: number
  limit: number
  status: InvoiceStatusFilter
  customerName: string
  invoiceNumber: string
  search: string
  date: string
}

export interface InvoiceSearchPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface InvoiceSearchFacets {
  statusCounts: {
    draft: number
    finalized: number
    paid: number
    total: number
  }
  filteredAmount: number
  globalAmount: number
}

export interface InvoiceListItem extends Invoice {
  customerName?: string
  totalAmount?: number
  subtotal?: number
}

export interface InvoiceSearchResponse {
  data: InvoiceListItem[]
  pagination: InvoiceSearchPagination
  facets: InvoiceSearchFacets
}

export const DEFAULT_INVOICE_FILTERS: InvoiceSearchFilters = {
  page: 1,
  limit: 20,
  status: 'all',
  customerName: '',
  invoiceNumber: '',
  search: '',
  date: '',
}

export function buildInvoiceSearchQuery(filters: InvoiceSearchFilters): string {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('limit', String(filters.limit))

  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.customerName) params.set('customerName', filters.customerName)
  if (filters.invoiceNumber) params.set('invoiceNumber', filters.invoiceNumber)
  if (filters.search) params.set('search', filters.search)
  if (filters.date) params.set('date', filters.date)

  return params.toString()
}

export function parseInvoiceFiltersFromParams(searchParams: URLSearchParams): InvoiceSearchFilters {
  const statusParam = searchParams.get('status')
  const status: InvoiceStatusFilter =
    statusParam === 'draft' || statusParam === 'finalized' || statusParam === 'paid' || statusParam === 'all'
      ? statusParam
      : 'all'

  return {
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    limit: Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20)),
    status,
    customerName: searchParams.get('customerName') || '',
    invoiceNumber: searchParams.get('invoiceNumber') || '',
    search: searchParams.get('search') || '',
    date: searchParams.get('date') || '',
  }
}

export function filtersToSearchParams(filters: InvoiceSearchFilters): URLSearchParams {
  return new URLSearchParams(buildInvoiceSearchQuery(filters))
}

export function countActiveFilters(filters: InvoiceSearchFilters): number {
  let count = 0
  if (filters.status !== 'all') count++
  if (filters.customerName) count++
  if (filters.invoiceNumber) count++
  if (filters.search) count++
  if (filters.date) count++
  return count
}

export function filtersAreEqual(a: InvoiceSearchFilters, b: InvoiceSearchFilters): boolean {
  return (
    a.page === b.page &&
    a.limit === b.limit &&
    a.status === b.status &&
    a.customerName === b.customerName &&
    a.invoiceNumber === b.invoiceNumber &&
    a.search === b.search &&
    a.date === b.date
  )
}
