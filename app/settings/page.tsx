'use client'

import { useState, useEffect } from 'react'
import { useBilling } from '@/lib/context'
import { AppLayout } from '@/app/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Upload, Image as ImageIcon, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const { company, updateCompany } = useBilling()
  const [formData, setFormData] = useState(company)
  const [savedMessage, setSavedMessage] = useState(false)

  useEffect(() => {
    setFormData(company)
  }, [company])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size is too large. Please select an image under 5MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logoUrl: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setFormData(prev => ({
      ...prev,
      logoUrl: ''
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
            Manage your company details and logo that will appear on all invoices
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
                <CardTitle>Company Information & Branding</CardTitle>
                <CardDescription>
                  Update your company profile and upload a logo for top-left placement on invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Logo Section */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                    <label className="block text-base font-semibold text-slate-900 dark:text-white mb-2">
                      Company Logo
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      Upload your logo or provide an image URL. It will be positioned at the top-left corner of all generated invoices.
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      {/* Logo Preview Container */}
                      <div className="relative flex h-24 w-40 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
                        {formData.logoUrl ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={formData.logoUrl}
                              alt="Company Logo Preview"
                              className="h-full w-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700 shadow-md transition"
                              title="Remove Logo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <ImageIcon className="h-8 w-8 mb-1" />
                            <span className="text-xs font-medium">No Logo</span>
                          </div>
                        )}
                      </div>

                      {/* Upload and URL Controls */}
                      <div className="flex-1 space-y-3 w-full">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Upload Logo Image (PNG, JPG, SVG)
                          </label>
                          <div className="flex gap-2">
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700">
                              <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span>Choose Image File</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="logoUrl" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Or Image URL / Base64 Data
                          </label>
                          <Input
                            id="logoUrl"
                            name="logoUrl"
                            value={formData.logoUrl || ''}
                            onChange={handleChange}
                            placeholder="https://example.com/logo.png"
                            className="border-slate-300 dark:border-slate-700 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

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
                      <label htmlFor="contactPerson" className="block text-sm font-medium text-slate-900 dark:text-white">
                        Contact Person Name
                      </label>
                      <Input
                        id="contactPerson"
                        name="contactPerson"
                        value={formData.contactPerson || ''}
                        onChange={handleChange}
                        placeholder="e.g. Shrvan Kumar"
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
                        value={formData.state || ''}
                        onChange={handleChange}
                        placeholder="e.g. MAHARASHTRA"
                        className="border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="code" className="block text-sm font-medium text-slate-900 dark:text-white">
                        State Code
                      </label>
                      <Input
                        id="code"
                        name="code"
                        value={formData.code || ''}
                        onChange={handleChange}
                        placeholder="e.g. 27"
                        className="border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-slate-900 dark:text-white">
                        Company Address
                      </label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter company address"
                        rows={3}
                        className="border-slate-300 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  {/* Bank Details Section */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      Bank Account Details (Printed on Invoices)
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="bankName" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                          Bank Name
                        </label>
                        <Input
                          id="bankName"
                          name="bankName"
                          value={formData.bankName || ''}
                          onChange={handleChange}
                          placeholder="e.g. Axis Bank"
                          className="border-slate-300 dark:border-slate-700 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="bankAccountName" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                          Bank A/c Name
                        </label>
                        <Input
                          id="bankAccountName"
                          name="bankAccountName"
                          value={formData.bankAccountName || ''}
                          onChange={handleChange}
                          placeholder="e.g. SK Interiors Bank A/c"
                          className="border-slate-300 dark:border-slate-700 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="bankAccountNumber" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                          Account Number
                        </label>
                        <Input
                          id="bankAccountNumber"
                          name="bankAccountNumber"
                          value={formData.bankAccountNumber || ''}
                          onChange={handleChange}
                          placeholder="e.g. 923020047215171"
                          className="border-slate-300 dark:border-slate-700 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="bankIfsc" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                          IFSC Code
                        </label>
                        <Input
                          id="bankIfsc"
                          name="bankIfsc"
                          value={formData.bankIfsc || ''}
                          onChange={handleChange}
                          placeholder="e.g. UTIB0001584"
                          className="border-slate-300 dark:border-slate-700 text-sm"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="bankBranch" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                          Branch
                        </label>
                        <Input
                          id="bankBranch"
                          name="bankBranch"
                          value={formData.bankBranch || ''}
                          onChange={handleChange}
                          placeholder="e.g. OLD NAGARDAS ROAD"
                          className="border-slate-300 dark:border-slate-700 text-sm"
                        />
                      </div>
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
