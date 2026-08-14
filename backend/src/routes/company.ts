import type { Express, Request, Response } from 'express'
import { getDatabase } from '../lib/mongodb.js'
import { authMiddleware } from '../lib/auth.js'
import { handleApiError, parseBody } from '../lib/api-errors.js'
import { CompanySchema } from '../lib/schemas/api-schemas.js'

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
  invoicePrefix: 'INV',
  defaultPaymentTermsDays: 30,
  invoiceLayout: 'default',
}

export function registerCompanyRoutes(app: Express): void {
  app.get('/api/company', authMiddleware, async (req: Request, res: Response) => {
    try {
      const db = await getDatabase()
      const company = await db.collection('company').findOne({ userId: req.user!.userId })
      if (!company) {
        res.json(EMPTY_COMPANY)
        return
      }

      res.json({
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
        invoicePrefix: company.invoicePrefix || 'INV',
        defaultPaymentTermsDays: Number(company.defaultPaymentTermsDays) || 30,
        invoiceLayout: company.invoiceLayout || 'default',
      })
    } catch (error) {
      handleApiError(res, error, 'Failed to fetch company profile')
    }
  })

  app.put('/api/company', authMiddleware, async (req: Request, res: Response) => {
    try {
      const parsed = parseBody(res, req.body, CompanySchema)
      if (!parsed) return

      const db = await getDatabase()
      const companyData = { ...parsed, updatedAt: new Date() }

      await db.collection('company').updateOne(
        { userId: req.user!.userId },
        { $set: { ...companyData, userId: req.user!.userId } },
        { upsert: true },
      )

      res.json(companyData)
    } catch (error) {
      handleApiError(res, error, 'Failed to update company profile')
    }
  })
}
