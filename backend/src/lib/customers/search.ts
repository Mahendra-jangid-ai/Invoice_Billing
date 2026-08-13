import type { Document, Filter } from 'mongodb'
import { z } from 'zod'

export const CustomerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  state: z.string().trim().max(100).optional(),
  gst: z.enum(['all', 'with', 'without']).default('all'),
})

export type CustomerListQuery = z.infer<typeof CustomerListQuerySchema>

export interface CustomerSearchResult {
  data: Record<string, unknown>[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
  facets: {
    total: number
    withGst: number
    withoutGst: number
    topStates: Array<{ state: string; count: number }>
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildCustomerFilterMatch(query: CustomerListQuery): Filter<Document> {
  const clauses: Filter<Document>[] = []

  if (query.search) {
    const pattern = escapeRegex(query.search)
    clauses.push({
      $or: [
        { name: { $regex: pattern, $options: 'i' } },
        { email: { $regex: pattern, $options: 'i' } },
        { phone: { $regex: pattern, $options: 'i' } },
        { gstnumber: { $regex: pattern, $options: 'i' } },
        { address: { $regex: pattern, $options: 'i' } },
      ],
    })
  }

  if (query.state) {
    clauses.push({ state: { $regex: escapeRegex(query.state), $options: 'i' } })
  }

  if (query.gst === 'with') {
    clauses.push({ gstnumber: { $exists: true, $nin: ['', null] } })
  } else if (query.gst === 'without') {
    clauses.push({
      $or: [
        { gstnumber: { $exists: false } },
        { gstnumber: '' },
        { gstnumber: null },
      ],
    })
  }

  if (clauses.length === 0) return {}
  if (clauses.length === 1) return clauses[0]
  return { $and: clauses }
}

export function buildCustomerSearchPipeline(userId: string, query: CustomerListQuery): Document[] {
  const filterMatch = buildCustomerFilterMatch(query)
  const skip = (query.page - 1) * query.limit

  return [
    { $match: { userId } },
    {
      $facet: {
        globalStats: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              withGst: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: [{ $ifNull: ['$gstnumber', ''] }, ''] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ],
        topStates: [
          { $match: { state: { $exists: true, $nin: ['', null] } } },
          { $group: { _id: '$state', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ],
        filteredData: [
          { $match: filterMatch },
          { $sort: { name: 1 } },
          { $skip: skip },
          { $limit: query.limit },
          {
            $project: {
              _id: 0,
              id: { $ifNull: ['$id', { $toString: '$_id' }] },
              name: 1,
              email: 1,
              phone: 1,
              address: 1,
              gstnumber: 1,
              state: 1,
              code: 1,
            },
          },
        ],
        filteredMeta: [{ $match: filterMatch }, { $count: 'total' }],
      },
    },
  ]
}

export function parseCustomerSearchResult(
  query: CustomerListQuery,
  raw: Record<string, unknown>[],
): CustomerSearchResult {
  const facetRoot = (raw[0] || {}) as {
    globalStats?: Array<{ total?: number; withGst?: number }>
    topStates?: Array<{ _id?: string; count?: number }>
    filteredData?: Record<string, unknown>[]
    filteredMeta?: Array<{ total?: number }>
  }

  const global = facetRoot.globalStats?.[0]
  const totalGlobal = global?.total ?? 0
  const withGst = global?.withGst ?? 0
  const filteredTotal = facetRoot.filteredMeta?.[0]?.total ?? 0
  const totalPages = filteredTotal > 0 ? Math.ceil(filteredTotal / query.limit) : 0

  return {
    data: facetRoot.filteredData ?? [],
    pagination: {
      page: query.page,
      limit: query.limit,
      total: filteredTotal,
      totalPages,
      hasMore: query.page < totalPages,
    },
    facets: {
      total: totalGlobal,
      withGst,
      withoutGst: Math.max(0, totalGlobal - withGst),
      topStates: (facetRoot.topStates ?? []).map((row) => ({
        state: row._id || 'Unknown',
        count: row.count ?? 0,
      })),
    },
  }
}

export function hasCustomerSearchParams(query: Record<string, unknown>): boolean {
  const keys = ['page', 'limit', 'search', 'state', 'gst']
  return keys.some((key) => query[key] !== undefined && query[key] !== '')
}
