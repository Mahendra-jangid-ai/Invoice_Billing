'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiFetch, getErrorMessage } from '@/lib/api-client'
import { getNextInvoiceNumberFromList } from '@/lib/invoice-number'
import { useAuth } from '@/lib/auth-context'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  gstnumber: string
  state?: string
  code?: string
}

export interface Item {
  id: string
  name: string
  description: string
  hsnsac: string
  unitprice: number
}

export interface InvoiceLineItem {
  itemId: string
  description?: string
  sacCode?: string
  unit?: string
  quantity: number
  rate: number
  taxRate?: number
}

export interface InvoiceParty {
  name: string
  address: string
  gstin: string
  state: string
  code: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  dueDate?: string
  paymentTermsDays?: number
  reverseCharge?: string
  companyState?: string
  companyStateCode?: string
  woNumber?: string
  descriptionOfService?: string
  periodOfService?: string
  placeOfService?: string
  placeOfServiceCode?: string
  customerId?: string
  billTo?: InvoiceParty
  shipTo?: InvoiceParty
  sameAsBillTo?: boolean
  items: InvoiceLineItem[]
  taxPercentage?: number
  notes?: string
  cashDiscount?: {
    discountAmount?: number
  }
  payments?: Array<{
    id: string
    amount: number
    date: string
    method: string
    reference?: string
    note?: string
  }>
  status: 'draft' | 'finalized' | 'paid'
}

export interface Company {
  name: string
  address: string
  phone: string
  email: string
  contactPerson?: string
  gstnumber: string
  pan: string
  state: string
  code: string
  logoUrl?: string
  bankName?: string
  bankAccountName?: string
  bankAccountNumber?: string
  bankIfsc?: string
  bankBranch?: string
  invoicePrefix?: string
  defaultPaymentTermsDays?: number
  invoiceLayout?: 'default' | 'modern' | 'classic' | 'detailed'
}

interface BillingContextType {
  customers: Customer[]
  items: Item[]
  invoices: Invoice[]
  company: Company
  loading: boolean
  error: string | null
  clearError: () => void
  addCustomer: (customer: Customer) => Promise<void>
  updateCustomer: (id: string, customer: Customer) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  addItem: (item: Item) => Promise<void>
  updateItem: (id: string, item: Item) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  addInvoice: (invoice: Invoice) => Promise<Invoice>
  updateInvoice: (id: string, invoice: Invoice) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
  updateCompany: (company: Company) => Promise<void>
  getNextInvoiceNumber: () => string
}

const BillingContext = createContext<BillingContextType | undefined>(undefined)

const EMPTY_COMPANY: Company = {
  name: '',
  address: '',
  phone: '',
  email: '',
  contactPerson: '',
  gstnumber: '',
  pan: '',
  state: '',
  code: '',
  logoUrl: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankIfsc: '',
  bankBranch: '',
  invoicePrefix: 'INV',
  defaultPaymentTermsDays: 30,
  invoiceLayout: 'default',
}

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState<Company>(EMPTY_COMPANY)

  const clearError = () => setError(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    const loadErrors: string[] = []

    const [customersResult, itemsResult, invoicesResult, companyResult] = await Promise.allSettled([
      apiFetch<Customer[]>('/api/customers'),
      apiFetch<Item[]>('/api/items'),
      apiFetch<Invoice[]>('/api/invoices'),
      apiFetch<Company>('/api/company'),
    ])

    if (customersResult.status === 'fulfilled') {
      setCustomers(customersResult.value)
    } else {
      loadErrors.push(getErrorMessage(customersResult.reason, 'Failed to load customers'))
    }

    if (itemsResult.status === 'fulfilled') {
      setItems(itemsResult.value)
    } else {
      loadErrors.push(getErrorMessage(itemsResult.reason, 'Failed to load items'))
    }

    if (invoicesResult.status === 'fulfilled') {
      setInvoices(invoicesResult.value)
    } else {
      loadErrors.push(getErrorMessage(invoicesResult.reason, 'Failed to load invoices'))
    }

    if (companyResult.status === 'fulfilled') {
      setCompany(companyResult.value)
    } else {
      loadErrors.push(getErrorMessage(companyResult.reason, 'Failed to load company profile'))
    }

    if (loadErrors.length > 0) {
      setError(loadErrors.join('. '))
    }

    setLoading(false)
  }

  useEffect(() => {
    if (authLoading) return

    if (user) {
      loadData()
      return
    }

    setCustomers([])
    setItems([])
    setInvoices([])
    setCompany(EMPTY_COMPANY)
    setError(null)
    setLoading(false)
  }, [authLoading, user])

  const updateCompany = async (newCompany: Company) => {
    const previous = company
    setCompany(newCompany)
    clearError()
    try {
      const saved = await apiFetch<Company>('/api/company', {
        method: 'PUT',
        body: JSON.stringify(newCompany),
      })
      setCompany(saved)
    } catch (err) {
      setCompany(previous)
      setError(getErrorMessage(err, 'Failed to update company profile'))
      throw err
    }
  }

  const addCustomer = async (customer: Customer) => {
    const newCustomer = { ...customer, id: customer.id || Date.now().toString() }
    const previous = customers
    setCustomers((prev) => [...prev, newCustomer])
    clearError()
    try {
      await apiFetch('/api/customers', {
        method: 'POST',
        body: JSON.stringify(newCustomer),
      })
    } catch (err) {
      setCustomers(previous)
      setError(getErrorMessage(err, 'Failed to save customer'))
      throw err
    }
  }

  const updateCustomer = async (id: string, customer: Customer) => {
    const previous = customers
    setCustomers((prev) => prev.map((c) => (c.id === id ? customer : c)))
    clearError()
    try {
      await apiFetch(`/api/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(customer),
      })
    } catch (err) {
      setCustomers(previous)
      setError(getErrorMessage(err, 'Failed to update customer'))
      throw err
    }
  }

  const deleteCustomer = async (id: string) => {
    const previous = customers
    setCustomers((prev) => prev.filter((c) => c.id !== id))
    clearError()
    try {
      await apiFetch(`/api/customers/${id}`, { method: 'DELETE' })
    } catch (err) {
      setCustomers(previous)
      setError(getErrorMessage(err, 'Failed to delete customer'))
      throw err
    }
  }

  const addItem = async (item: Item) => {
    const newItem = { ...item, id: item.id || Date.now().toString() }
    const previous = items
    setItems((prev) => [...prev, newItem])
    clearError()
    try {
      await apiFetch('/api/items', {
        method: 'POST',
        body: JSON.stringify(newItem),
      })
    } catch (err) {
      setItems(previous)
      setError(getErrorMessage(err, 'Failed to save item'))
      throw err
    }
  }

  const updateItem = async (id: string, item: Item) => {
    const previous = items
    setItems((prev) => prev.map((i) => (i.id === id ? item : i)))
    clearError()
    try {
      await apiFetch(`/api/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item),
      })
    } catch (err) {
      setItems(previous)
      setError(getErrorMessage(err, 'Failed to update item'))
      throw err
    }
  }

  const deleteItem = async (id: string) => {
    const previous = items
    setItems((prev) => prev.filter((i) => i.id !== id))
    clearError()
    try {
      await apiFetch(`/api/items/${id}`, { method: 'DELETE' })
    } catch (err) {
      setItems(previous)
      setError(getErrorMessage(err, 'Failed to delete item'))
      throw err
    }
  }

  const addInvoice = async (invoice: Invoice): Promise<Invoice> => {
    const previous = invoices
    setInvoices((prev) => [...prev, invoice])
    clearError()
    try {
      const saved = await apiFetch<Invoice>('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(invoice),
      })
      setInvoices((prev) => [...prev.filter((inv) => inv.id !== invoice.id), saved])
      return saved
    } catch (err) {
      setInvoices(previous)
      setError(getErrorMessage(err, 'Failed to save invoice'))
      throw err
    }
  }

  const updateInvoice = async (id: string, invoice: Invoice) => {
    const previous = invoices
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? invoice : inv)))
    clearError()
    try {
      await apiFetch(`/api/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(invoice),
      })
    } catch (err) {
      setInvoices(previous)
      setError(getErrorMessage(err, 'Failed to update invoice'))
      throw err
    }
  }

  const deleteInvoice = async (id: string) => {
    const previous = invoices
    setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    clearError()
    try {
      await apiFetch(`/api/invoices/${id}`, { method: 'DELETE' })
    } catch (err) {
      setInvoices(previous)
      setError(getErrorMessage(err, 'Failed to delete invoice'))
      throw err
    }
  }

  const getNextInvoiceNumber = (): string => {
    const prefix = (company.invoicePrefix || 'INV').trim() || 'INV'
    return getNextInvoiceNumberFromList(invoices, prefix)
  }

  return (
    <BillingContext.Provider
      value={{
        customers,
        items,
        invoices,
        company,
        loading,
        error,
        clearError,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addItem,
        updateItem,
        deleteItem,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        updateCompany,
        getNextInvoiceNumber,
      }}
    >
      {children}
    </BillingContext.Provider>
  )
}

export function useBilling() {
  const context = useContext(BillingContext)
  if (context === undefined) {
    throw new Error('useBilling must be used within BillingProvider')
  }
  return context
}
