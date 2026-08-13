import type { Document, Filter } from 'mongodb'
import { z } from 'zod'

export const ItemListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  hsnsac: z.string().trim().max(20).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
})

export type ItemListQuery = z.infer<typeof ItemListQuerySchema>

export interface ItemSearchResult {
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
    avgPrice: number
    minCatalogPrice: number
    maxCatalogPrice: number
    filteredAvgPrice: number
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildItemFilterMatch(query: ItemListQuery): Filter<Document> {
  const match: Filter<Document> = {}

  if (query.search) {
    const pattern = escapeRegex(query.search)
    match.$or = [
      { name: { $regex: pattern, $options: 'i' } },
      { description: { $regex: pattern, $options: 'i' } },
      { hsnsac: { $regex: pattern, $options: 'i' } },
    ]
  }

  if (query.hsnsac) {
    match.hsnsac = { $regex: escapeRegex(query.hsnsac), $options: 'i' }
  }

  const price: Filter<Document> = {}
  if (query.minPrice !== undefined) price.$gte = query.minPrice
  if (query.maxPrice !== undefined) price.$lte = query.maxPrice
  if (Object.keys(price).length > 0) {
    match.unitprice = price
  }

  return match
}

export function buildItemSearchPipeline(userId: string, query: ItemListQuery): Document[] {
  const filterMatch = buildItemFilterMatch(query)
  const skip = (query.page - 1) * query.limit

  return [
    { $match: { userId } },
    {
      $addFields: {
        unitpriceNum: { $toDouble: { $ifNull: ['$unitprice', 0] } },
      },
    },
    {
      $facet: {
        globalStats: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              avgPrice: { $avg: '$unitpriceNum' },
              minCatalogPrice: { $min: '$unitpriceNum' },
              maxCatalogPrice: { $max: '$unitpriceNum' },
            },
          },
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
              description: 1,
              hsnsac: 1,
              unitprice: '$unitpriceNum',
            },
          },
        ],
        filteredMeta: [
          { $match: filterMatch },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              filteredAvgPrice: { $avg: '$unitpriceNum' },
            },
          },
        ],
      },
    },
  ]
}

export function parseItemSearchResult(
  query: ItemListQuery,
  raw: Record<string, unknown>[],
): ItemSearchResult {
  const facetRoot = (raw[0] || {}) as {
    globalStats?: Array<{
      total?: number
      avgPrice?: number
      minCatalogPrice?: number
      maxCatalogPrice?: number
    }>
    filteredData?: Record<string, unknown>[]
    filteredMeta?: Array<{ total?: number; filteredAvgPrice?: number }>
  }

  const global = facetRoot.globalStats?.[0]
  const meta = facetRoot.filteredMeta?.[0]
  const filteredTotal = meta?.total ?? 0
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
      total: global?.total ?? 0,
      avgPrice: global?.avgPrice ?? 0,
      minCatalogPrice: global?.minCatalogPrice ?? 0,
      maxCatalogPrice: global?.maxCatalogPrice ?? 0,
      filteredAvgPrice: meta?.filteredAvgPrice ?? 0,
    },
  }
}

export function hasItemSearchParams(query: Record<string, unknown>): boolean {
  const keys = ['page', 'limit', 'search', 'hsnsac', 'minPrice', 'maxPrice']
  return keys.some((key) => query[key] !== undefined && query[key] !== '')
}
