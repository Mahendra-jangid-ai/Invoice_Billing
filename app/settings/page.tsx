'use client'

import { useState } from 'react'
import { useBilling } from '@/lib/context'
import { AppLayout } from '@/app/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const { company, updateCompany } = useBilling()
  const [formData, setFormData] = useState(company)
  const [savedMessage, setSavedMessage] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCompany(formData)
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 3000)
  }

  return (
    <AppLayout>
      <div className="flex flex-col">
        <div className="border-b border-slate-200 bg-white px-8 py-6 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Company Settings</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage your company details that will appear on all invoices
          </p>
        </div>

        <div className="flex-1 p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {savedMessage && (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Company details saved successfully!
                </span>
              </div>
            )}

            <Card className="bg-white dark:bg-slate-950">
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Update your company details that will appear on invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-slate-900 dark:text-white">
                        Company Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        className="border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-slate-900 dark:text-white">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email"
                        className="border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-900 dark:text-white">
                        Phone
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        className="border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="gstnumber" className="block text-sm font-medium text-slate-900 dark:text-white">
                        GST Number
                      </label>
                      <Input
                        id="gstnumber"
                        name="gstnumber"
                        value={formData.gstnumber}
                        onChange={handleChange}
                        placeholder="Enter GST number"
                        className="border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="pan" className="block text-sm font-medium text-slate-900 dark:text-white">
                        PAN
                      </label>
                      <Input
                        id="pan"
                        name="pan"
                        value={formData.pan}
                        onChange={handleChange}
                        placeholder="Enter PAN"
                        className="border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="state" className="block text-sm font-medium text-slate-900 dark:text-white">
                        State
                      </label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                        className="border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="code" className="block text-sm font-medium text-slate-900 dark:text-white">
                        Code
                      </label>
                      <Input
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="Enter code"
                        className="border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-slate-900 dark:text-white">
                        Address
                      </label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter company address"
                        rows={4}
                        className="border-slate-300 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        These details will appear on all your invoices. Make sure the information is accurate.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                      Save Company Details
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
