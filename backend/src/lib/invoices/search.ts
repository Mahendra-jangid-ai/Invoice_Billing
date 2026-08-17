import type { Document, Filter } from 'mongodb'
import { z } from 'zod'

export const InvoiceListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['draft', 'finalized', 'paid', 'all']).default('all'),
  customerName: z.string().trim().max(200).optional(),
  invoiceNumber: z.string().trim().max(50).optional(),
  search: z.string().trim().max(200).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export type InvoiceListQuery = z.infer<typeof InvoiceListQuerySchema>

export interface InvoiceSearchResult {
  data: Record<string, unknown>[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
  facets: {
    statusCounts: { draft: number; finalized: number; paid: number; total: number }
    filteredAmount: number
    globalAmount: number
  }
}

const COMPUTED_FIELDS_STAGE: Document = {
  $addFields: {
    subtotal: {
      $reduce: {
        input: { $ifNull: ['$items', []] },
        initialValue: 0,
        in: {
          $add: [
            '$$value',
            {
              $multiply: [
                { $toDouble: { $ifNull: ['$$this.quantity', 0] } },
                { $toDouble: { $ifNull: ['$$this.rate', 0] } },
              ],
            },
          ],
        },
      },
    },
    customerName: {
      $ifNull: ['$billTo.name', ''],
    },
  },
}

const TOTAL_AMOUNT_STAGE: Document = {
  $addFields: {
    totalAmount: {
      $max: [
        0,
        {
          $subtract: [
            {
              $add: [
                '$subtotal',
                {
                  $multiply: [
                    '$subtotal',
                    {
                      $divide: [
                        { $toDouble: { $ifNull: ['$taxPercentage', 0] } },
                        100,
                      ],
                    },
                  ],
                },
              ],
            },
            { $toDouble: { $ifNull: ['$cashDiscount.discountAmount', 0] } },
          ],
        },
      ],
    },
  },
}

function cleanSearchTerm(value: string | undefined): string | undefined {
  if (!value) return undefined
  const sanitized = value.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, 100)
  return sanitized.length > 0 ? sanitized : undefined
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildInvoiceFilterMatch(query: InvoiceListQuery): Filter<Document> {
  const match: Filter<Document> = {}

  if (query.status !== 'all') {
    match.status = query.status
  }

  const customerName = cleanSearchTerm(query.customerName)
  if (customerName) {
    match.customerName = { $regex: escapeRegex(customerName), $options: 'i' }
  }

  const invoiceNumber = cleanSearchTerm(query.invoiceNumber)
  if (invoiceNumber) {
    match.invoiceNumber = { $regex: escapeRegex(invoiceNumber), $options: 'i' }
  }

  const search = cleanSearchTerm(query.search)
  if (search) {
    const pattern = escapeRegex(search)
    match.$or = [
      { invoiceNumber: { $regex: pattern, $options: 'i' } },
      { customerName: { $regex: pattern, $options: 'i' } },
      { 'billTo.gstin': { $regex: pattern, $options: 'i' } },
      { woNumber: { $regex: pattern, $options: 'i' } },
    ]
  }

  if (query.date) {
    match.date = query.date
  }

  return match
}

export function buildInvoiceSearchPipeline(userId: string, query: InvoiceListQuery): Document[] {
  const filterMatch = buildInvoiceFilterMatch(query)
  const skip = (query.page - 1) * query.limit

  return [
    { $match: { userId } },
    COMPUTED_FIELDS_STAGE,
    TOTAL_AMOUNT_STAGE,
    {
      $facet: {
        globalStats: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              globalAmount: { $sum: '$totalAmount' },
              draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
              finalized: { $sum: { $cond: [{ $eq: ['$status', 'finalized'] }, 1, 0] } },
              paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
            },
          },
        ],
        filteredData: [
          { $match: filterMatch },
          { $sort: { date: -1, invoiceNumber: -1 } },
          { $skip: skip },
          { $limit: query.limit },
          {
            $project: {
              _id: 0,
              id: { $ifNull: ['$id', { $toString: '$_id' }] },
              invoiceNumber: 1,
              date: 1,
              dueDate: 1,
              paymentTermsDays: 1,
              reverseCharge: 1,
              companyState: 1,
              companyStateCode: 1,
              woNumber: 1,
              descriptionOfService: 1,
              periodOfService: 1,
              placeOfService: 1,
              placeOfServiceCode: 1,
              customerId: 1,
              customerName: 1,
              billTo: 1,
              shipTo: 1,
              sameAsBillTo: 1,
              items: 1,
              taxPercentage: 1,
              notes: 1,
              cashDiscount: 1,
              payments: 1,
              status: 1,
              totalAmount: 1,
              subtotal: 1,
            },
          },
        ],
        filteredMeta: [
          { $match: filterMatch },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              filteredAmount: { $sum: '$totalAmount' },
            },
          },
        ],
      },
    },
  ]
}

export function parseInvoiceSearchResult(
  query: InvoiceListQuery,
  raw: Record<string, unknown>[],
): InvoiceSearchResult {
  const facetRoot = (raw[0] || {}) as {
    globalStats?: Array<{
      total?: number
      globalAmount?: number
      draft?: number
      finalized?: number
      paid?: number
    }>
    filteredData?: Record<string, unknown>[]
    filteredMeta?: Array<{ total?: number; filteredAmount?: number }>
  }

  const global = facetRoot.globalStats?.[0]
  const meta = facetRoot.filteredMeta?.[0]
  const total = meta?.total ?? 0
  const totalPages = total > 0 ? Math.ceil(total / query.limit) : 0

  return {
    data: facetRoot.filteredData ?? [],
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasMore: query.page < totalPages,
    },
    facets: {
      statusCounts: {
        draft: global?.draft ?? 0,
        finalized: global?.finalized ?? 0,
        paid: global?.paid ?? 0,
        total: global?.total ?? 0,
      },
      filteredAmount: meta?.filteredAmount ?? 0,
      globalAmount: global?.globalAmount ?? 0,
    },
  }
}

export function hasInvoiceSearchParams(query: Record<string, unknown>): boolean {
  const keys = ['page', 'limit', 'status', 'customerName', 'invoiceNumber', 'search', 'date']
  return keys.some((key) => query[key] !== undefined && query[key] !== '')
}
