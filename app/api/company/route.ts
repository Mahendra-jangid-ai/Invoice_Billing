import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDatabase()
    const company = await db.collection('company').findOne({})
    if (!company) {
      return NextResponse.json({
        name: '',
        address: '',
        phone: '',
        email: '',
        gstnumber: '',
        pan: '',
        state: '',
        code: '',
      })
    }

    return NextResponse.json({
      name: company.name || '',
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || '',
      gstnumber: company.gstnumber || '',
      pan: company.pan || '',
      state: company.state || '',
      code: company.code || '',
    })
  } catch (error) {
    console.error('Failed to fetch company profile:', error)
    return NextResponse.json({ error: 'Failed to fetch company profile' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const db = await getDatabase()

    const companyData = {
      name: body.name || '',
      address: body.address || '',
      phone: body.phone || '',
      email: body.email || '',
      gstnumber: body.gstnumber || '',
      pan: body.pan || '',
      state: body.state || '',
      code: body.code || '',
      updatedAt: new Date(),
    }

    await db.collection('company').updateOne(
      {},
      { $set: companyData },
      { upsert: true }
    )

    return NextResponse.json(companyData)
  } catch (error) {
    console.error('Failed to update company profile:', error)
    return NextResponse.json({ error: 'Failed to update company profile' }, { status: 500 })
  }
}
