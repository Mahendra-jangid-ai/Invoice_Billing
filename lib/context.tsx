'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

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
}

interface BillingContextType {
  customers: Customer[]
  items: Item[]
  invoices: Invoice[]
  company: Company
  loading: boolean
  addCustomer: (customer: Customer) => Promise<void>
  updateCustomer: (id: string, customer: Customer) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  addItem: (item: Item) => Promise<void>
  updateItem: (id: string, item: Item) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  addInvoice: (invoice: Invoice) => Promise<void>
  updateInvoice: (id: string, invoice: Invoice) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
  updateCompany: (company: Company) => Promise<void>
  getNextInvoiceNumber: () => string
}

const BillingContext = createContext<BillingContextType | undefined>(undefined)

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [company, setCompany] = useState<Company>({
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
  })

  // Fetch initial data from MongoDB API routes
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [cRes, iRes, invRes, compRes] = await Promise.allSettled([
          fetch('/api/customers'),
          fetch('/api/items'),
          fetch('/api/invoices'),
          fetch('/api/company'),
        ])

        if (cRes.status === 'fulfilled' && cRes.value.ok) {
          const data = await cRes.value.json()
          if (Array.isArray(data)) setCustomers(data)
        }
        if (iRes.status === 'fulfilled' && iRes.value.ok) {
          const data = await iRes.value.json()
          if (Array.isArray(data)) setItems(data)
        }
        if (invRes.status === 'fulfilled' && invRes.value.ok) {
          const data = await invRes.value.json()
          if (Array.isArray(data)) setInvoices(data)
        }
        if (compRes.status === 'fulfilled' && compRes.value.ok) {
          const data = await compRes.value.json()
          if (data && !data.error) setCompany(data)
        }
      } catch (err) {
        console.error('Error fetching data from MongoDB backend:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const updateCompany = async (newCompany: Company) => {
    setCompany(newCompany)
    try {
      await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompany),
      })
    } catch (err) {
      console.error('Failed to update company profile on server:', err)
    }
  }

  const addCustomer = async (customer: Customer) => {
    const newCustomer = { ...customer, id: customer.id || Date.now().toString() }
    setCustomers((prev) => [...prev, newCustomer])
    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      })
    } catch (err) {
      console.error('Failed to save customer to MongoDB:', err)
    }
  }

  const updateCustomer = async (id: string, customer: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? customer : c)))
    try {
      await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      })
    } catch (err) {
      console.error('Failed to update customer in MongoDB:', err)
    }
  }

  const deleteCustomer = async (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
    try {
      await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      })
    } catch (err) {
      console.error('Failed to delete customer from MongoDB:', err)
    }
  }

  const addItem = async (item: Item) => {
    const newItem = { ...item, id: item.id || Date.now().toString() }
    setItems((prev) => [...prev, newItem])
    try {
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
    } catch (err) {
      console.error('Failed to save item to MongoDB:', err)
    }
  }

  const updateItem = async (id: string, item: Item) => {
    setItems((prev) => prev.map((i) => (i.id === id ? item : i)))
    try {
      await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
    } catch (err) {
      console.error('Failed to update item in MongoDB:', err)
    }
  }

  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    try {
      await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      })
    } catch (err) {
      console.error('Failed to delete item from MongoDB:', err)
    }
  }

  const addInvoice = async (invoice: Invoice) => {
    setInvoices((prev) => [...prev, invoice])
    try {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      })
    } catch (err) {
      console.error('Failed to save invoice to MongoDB:', err)
    }
  }

  const updateInvoice = async (id: string, invoice: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? invoice : inv)))
    try {
      await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      })
    } catch (err) {
      console.error('Failed to update invoice in MongoDB:', err)
    }
  }

  const deleteInvoice = async (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    try {
      await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      })
    } catch (err) {
      console.error('Failed to delete invoice from MongoDB:', err)
    }
  }

  const getNextInvoiceNumber = (): string => {
    const maxNum = invoices
      .map((inv) => parseInt(inv.invoiceNumber.replace('INV-', ''), 10))
      .filter((n) => !isNaN(n))
      .reduce((max, num) => Math.max(max, num), 0)

    return `INV-${String(maxNum + 1).padStart(4, '0')}`
  }

  return (
    <BillingContext.Provider
      value={{
        customers,
        items,
        invoices,
        company,
        loading,
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
