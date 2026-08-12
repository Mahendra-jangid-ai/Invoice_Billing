import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { handleApiError, parseBody } from '@/lib/api-errors'
import { CompanySchema } from '@/lib/schemas/api-schemas'

const EMPTY_COMPANY = {
  name: '',
  address: '',
  phone: '',
  email: '',
  gstnumber: '',
  pan: '',
  state: '',
  code: '',
  logoUrl: '',
  contactPerson: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankIfsc: '',
  bankBranch: '',
}

export async function GET() {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const db = await getDatabase()
    const company = await db.collection('company').findOne({ userId: user.userId })
    if (!company) {
      return NextResponse.json(EMPTY_COMPANY)
    }

    return NextResponse.json({
      name: company.name || '',
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || '',
      contactPerson: company.contactPerson || '',
      gstnumber: company.gstnumber || '',
      pan: company.pan || '',
      state: company.state || '',
      code: company.code || '',
      logoUrl: company.logoUrl || '',
      bankName: company.bankName || '',
      bankAccountName: company.bankAccountName || '',
      bankAccountNumber: company.bankAccountNumber || '',
      bankIfsc: company.bankIfsc || '',
      bankBranch: company.bankBranch || '',
    })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch company profile')
  }
}

export async function PUT(request: Request) {
  const { user, errorResponse } = await requireAuth()
  if (errorResponse) return errorResponse

  try {
    const parsed = await parseBody(request, CompanySchema)
    if (parsed instanceof NextResponse) return parsed

    const db = await getDatabase()
    const companyData = {
      ...parsed,
      updatedAt: new Date(),
    }

    await db.collection('company').updateOne(
      { userId: user.userId },
      { $set: { ...companyData, userId: user.userId } },
      { upsert: true }
    )

    return NextResponse.json(companyData)
  } catch (error) {
    return handleApiError(error, 'Failed to update company profile')
  }
}
