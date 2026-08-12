import { z } from 'zod'

export const ResourceIdSchema = z.string().min(1, 'ID is required').trim()

export const CustomerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(200).trim(),
  email: z.string().max(200).optional().default(''),
  phone: z.string().max(50).optional().default(''),
  address: z.string().max(500).optional().default(''),
  gstnumber: z.string().max(50).optional().default(''),
  state: z.string().max(100).optional().default(''),
  code: z.string().max(20).optional().default(''),
})

export const ItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Item name is required').max(200).trim(),
  description: z.string().max(1000).optional().default(''),
  hsnsac: z.string().max(50).optional().default(''),
  unitprice: z.coerce.number().min(0, 'Price must be non-negative'),
})

export const InvoiceLineItemSchema = z.object({
  itemId: z.string().optional().default(''),
  description: z.string().optional().default(''),
  sacCode: z.string().optional().default(''),
  unit: z.string().optional().default(''),
  quantity: z.coerce.number().min(0).default(0),
  rate: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).optional(),
})

export const InvoicePartySchema = z.object({
  name: z.string().optional().default(''),
  address: z.string().optional().default(''),
  gstin: z.string().optional().default(''),
  state: z.string().optional().default(''),
  code: z.string().optional().default(''),
})

export const InvoiceSchema = z.object({
  id: z.string().optional(),
  invoiceNumber: z.string().min(1, 'Invoice number is required').trim(),
  date: z.string().min(1, 'Date is required'),
  reverseCharge: z.string().optional().default('No'),
  companyState: z.string().optional().default(''),
  companyStateCode: z.string().optional().default(''),
  woNumber: z.string().optional().default(''),
  descriptionOfService: z.string().optional().default(''),
  periodOfService: z.string().optional().default(''),
  placeOfService: z.string().optional().default(''),
  placeOfServiceCode: z.string().optional().default(''),
  customerId: z.string().optional().default(''),
  billTo: InvoicePartySchema.nullable().optional(),
  shipTo: InvoicePartySchema.nullable().optional(),
  sameAsBillTo: z.boolean().optional().default(true),
  items: z.array(InvoiceLineItemSchema).default([]),
  taxPercentage: z.coerce.number().min(0).optional().default(0),
  notes: z.string().optional().default(''),
  cashDiscount: z
    .object({
      discountAmount: z.coerce.number().min(0).optional(),
    })
    .nullable()
    .optional(),
  status: z.enum(['draft', 'finalized', 'paid']).default('draft'),
})

export const CompanySchema = z.object({
  name: z.string().max(200).optional().default(''),
  address: z.string().max(500).optional().default(''),
  phone: z.string().max(50).optional().default(''),
  email: z.string().max(200).optional().default(''),
  contactPerson: z.string().max(200).optional().default(''),
  gstnumber: z.string().max(50).optional().default(''),
  pan: z.string().max(20).optional().default(''),
  state: z.string().max(100).optional().default(''),
  code: z.string().max(20).optional().default(''),
  logoUrl: z.string().max(2000).optional().default(''),
  bankName: z.string().max(200).optional().default(''),
  bankAccountName: z.string().max(200).optional().default(''),
  bankAccountNumber: z.string().max(50).optional().default(''),
  bankIfsc: z.string().max(20).optional().default(''),
  bankBranch: z.string().max(200).optional().default(''),
})

export const WebSettingsSchema = z.object({
  websiteName: z.string().min(1, 'Website name is required').max(200).trim(),
  tagline: z.string().max(500).optional().default(''),
  supportEmail: z.string().max(200).optional().default(''),
  supportPhone: z.string().max(50).optional().default(''),
  footerText: z.string().max(1000).optional().default(''),
  language: z.string().min(2).max(20).optional().default('en'),
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
})

export const SignupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .transform((value) => value.replace(/\s+/g, ' ').trim()),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})
