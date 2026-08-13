import { z } from 'zod'

export const ResourceIdSchema = z.string().min(1, 'ID is required').trim()

const StrongPasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

export const CustomerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(200).trim(),
  email: z
    .string()
    .max(200)
    .optional()
    .default('')
    .refine((value) => !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()), {
      message: 'Enter a valid email address',
    }),
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

export const InvoicePaymentSchema = z.object({
  id: z.string().min(1),
  amount: z.coerce.number().min(0),
  date: z.string().min(1),
  method: z.enum(['cash', 'bank_transfer', 'upi', 'cheque', 'card', 'other']),
  reference: z.string().max(200).optional().default(''),
  note: z.string().max(500).optional().default(''),
})

export const InvoiceSchema = z.object({
  id: z.string().optional(),
  invoiceNumber: z.string().min(1, 'Invoice number is required').trim(),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().optional().default(''),
  paymentTermsDays: z.coerce.number().min(0).optional().default(30),
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
  payments: z.array(InvoicePaymentSchema).optional().default([]),
  status: z.enum(['draft', 'finalized', 'paid']).default('draft'),
})

export const CompanySchema = z.object({
  name: z.string().max(200).optional().default(''),
  address: z.string().max(500).optional().default(''),
  phone: z.string().max(50).optional().default(''),
  email: z
    .string()
    .max(200)
    .optional()
    .default('')
    .refine((value) => !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()), {
      message: 'Enter a valid email address',
    }),
  contactPerson: z.string().max(200).optional().default(''),
  gstnumber: z.string().max(50).optional().default(''),
  pan: z.string().max(20).optional().default(''),
  state: z.string().max(100).optional().default(''),
  code: z.string().max(20).optional().default(''),
  logoUrl: z
    .string()
    .max(700_000, 'Logo is too large')
    .optional()
    .default('')
    .refine(
      (value) =>
        !value ||
        value.startsWith('http') ||
        value.startsWith('data:image/png') ||
        value.startsWith('data:image/jpeg') ||
        value.startsWith('data:image/webp'),
      'Logo must be a PNG, JPEG, or WebP image',
    ),
  bankName: z.string().max(200).optional().default(''),
  bankAccountName: z.string().max(200).optional().default(''),
  bankAccountNumber: z.string().max(50).optional().default(''),
  bankIfsc: z.string().max(20).optional().default(''),
  bankBranch: z.string().max(200).optional().default(''),
  invoicePrefix: z.string().max(20).optional().default('INV'),
  defaultPaymentTermsDays: z.coerce.number().min(0).optional().default(30),
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
  password: StrongPasswordSchema,
})

export const VerifyEmailOtpSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit verification code'),
})

export const ResendEmailOtpSchema = z.object({
  force: z.boolean().optional().default(false),
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: StrongPasswordSchema,
})

export const UpdateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long')
      .transform((value) => value.replace(/\s+/g, ' ').trim())
      .optional(),
    avatarUrl: z
      .string()
      .max(700_000, 'Image is too large')
      .optional()
      .refine(
        (value) =>
          value === undefined ||
          value === '' ||
          value.startsWith('data:image/png') ||
          value.startsWith('data:image/jpeg') ||
          value.startsWith('data:image/webp') ||
          value.startsWith('https://'),
        'Avatar must be a valid image',
      ),
    avatarPreset: z
      .enum([
        'character-1',
        'character-2',
        'character-3',
        'character-4',
        'character-5',
        'character-6',
        'emoji-1',
        'emoji-2',
        'custom',
        'initials',
        'blue',
        'emerald',
        'violet',
        'amber',
        'rose',
        'slate',
      ])
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.avatarUrl !== undefined || data.avatarPreset !== undefined, {
    message: 'At least one field is required',
  })

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: StrongPasswordSchema,
})

export const GoogleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
})
