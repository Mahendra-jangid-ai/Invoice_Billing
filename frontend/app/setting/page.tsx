'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Download,
  KeyRound,
  LogOut,
  RefreshCw,
  Share,
  Shield,
  Smartphone,
  Trash2,
  HardDriveDownload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Users,
  Package,
  FileText,
} from 'lucide-react'
import { AppLayout } from '@/app/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { useBilling } from '@/lib/context'
import { apiFetch, getErrorMessage } from '@/lib/api-client'
import { PageHero } from '@/components/page-hero'
import { SettingsRow, SettingsSection } from '@/components/settings/settings-section'
import { ProfileAvatarPicker } from '@/components/settings/profile-avatar-picker'
import type { AvatarPresetId } from '@/lib/user-avatar'
import { useConfirm, useFeedback } from '@/components/confirm-provider'
import { FormField, fieldClassName } from '@/components/form-field'
import { validateStrongPassword } from '@/lib/utils'
import { usePwaInstall } from '@/lib/use-pwa-install'
import { clearPwaCaches } from '@/lib/pwa-cache'
import { isOnboardingComplete } from '@/lib/onboarding'
import { cn } from '@/lib/utils'

interface SessionSummary {
  sessionId: string
  deviceName: string
  browser: string
  os: string
  ipAddress: string
  createdAt: string
  lastSeenAt: string
  expiresAt: string
  revokedAt: string | null
  isCurrent: boolean
}

interface MeResponse {
  userId: string
  email: string
  name: string
  sessionId: string
  deviceName: string
  browser: string
  os: string
  ipAddress: string
  createdAt: string
  lastSeenAt: string
  expiresAt: string
  accountCreatedAt: string | null
  avatarUrl?: string
  avatarPreset?: string
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-IN')
}

function formatIpAddress(value: string): string {
  if (!value) return '—'
  if (value === '::1') return '127.0.0.1 (localhost)'
  return value
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const { company, customers, items, invoices, updateCompany } = useBilling()
  const { confirm } = useConfirm()
  const { warning, success, error: showError } = useFeedback()
  const { canInstall, canPrompt, install, isIos, isInstalled } = usePwaInstall()

  const [me, setMe] = useState<MeResponse | null>(null)
  const [profileName, setProfileName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarPreset, setAvatarPreset] = useState<string>('character-1')
  const [savingAvatar, setSavingAvatar] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const [invoicePrefix, setInvoicePrefix] = useState('INV')
  const [paymentTermsDays, setPaymentTermsDays] = useState('30')
  const [savingInvoiceDefaults, setSavingInvoiceDefaults] = useState(false)

  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null)
  const [revokingOthers, setRevokingOthers] = useState(false)

  const [exporting, setExporting] = useState(false)
  const [clearingCache, setClearingCache] = useState(false)
  const [showIosHint, setShowIosHint] = useState(false)
  const [showAndroidHint, setShowAndroidHint] = useState(false)

  const onboardingComplete = useMemo(() => isOnboardingComplete(company), [company])

  const otherSessionCount = useMemo(
    () => sessions.filter((s) => !s.isCurrent && !s.revokedAt).length,
    [sessions],
  )

  const loadMe = useCallback(async () => {
    try {
      const data = await apiFetch<MeResponse>('/api/auth/me')
      setMe(data)
      setProfileName(data.name || '')
      setAvatarUrl(data.avatarUrl || '')
      setAvatarPreset(data.avatarPreset || 'character-1')
    } catch (err) {
      showError({
        title: 'Load failed',
        description: getErrorMessage(err, 'Failed to load account info'),
      })
    }
  }, [showError])

  const copyEmail = async () => {
    if (!user?.email) return
    try {
      await navigator.clipboard.writeText(user.email)
      success({ title: 'Copied', description: 'Email copied to clipboard.' })
    } catch {
      showError({ title: 'Copy failed', description: 'Could not copy email.' })
    }
  }

  const loadSessions = useCallback(async () => {
    if (!user) return
    setSessionsLoading(true)
    try {
      const data = await apiFetch<{ sessions: SessionSummary[] }>('/api/auth/sessions')
      setSessions(data.sessions || [])
    } catch (err) {
      setSessions([])
      showError({
        title: 'Load failed',
        description: getErrorMessage(err, 'Failed to load sessions'),
      })
    } finally {
      setSessionsLoading(false)
    }
  }, [user, showError])

  const saveAvatar = useCallback(async (patch: { avatarPreset: AvatarPresetId | string; avatarUrl?: string }) => {
    setSavingAvatar(true)
    try {
      const body: Record<string, string> = { avatarPreset: patch.avatarPreset }
      if (patch.avatarUrl !== undefined) body.avatarUrl = patch.avatarUrl
      else if (patch.avatarPreset !== 'custom') body.avatarUrl = ''

      await apiFetch('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(body) })
      setAvatarPreset(patch.avatarPreset)
      setAvatarUrl(patch.avatarUrl ?? '')
      await refreshUser()
      await loadMe()
      success({ title: 'Photo updated', description: 'Your profile photo has been saved.' })
    } catch (err) {
      showError({
        title: 'Save failed',
        description: getErrorMessage(err, 'Failed to update profile photo'),
      })
    } finally {
      setSavingAvatar(false)
    }
  }, [loadMe, refreshUser, showError, success])

  useEffect(() => {
    loadMe()
    loadSessions()
  }, [loadMe, loadSessions])

  useEffect(() => {
    setInvoicePrefix(company.invoicePrefix || 'INV')
    setPaymentTermsDays(String(company.defaultPaymentTermsDays ?? 30))
  }, [company.invoicePrefix, company.defaultPaymentTermsDays])

  const saveProfile = async () => {
    const trimmed = profileName.trim()
    if (trimmed.length < 2) {
      warning({ title: 'Invalid name', description: 'Name must be at least 2 characters.' })
      return
    }
    if (trimmed === user?.name) return

    setSavingProfile(true)
    try {
      await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: trimmed }),
      })
      await refreshUser()
      await loadMe()
      success({ title: 'Profile updated', description: 'Your display name has been saved.' })
    } catch (err) {
      showError({
        title: 'Save failed',
        description: getErrorMessage(err, 'Failed to update profile'),
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      warning({ title: 'Current password required', description: 'Enter your current password.' })
      return
    }
    const passwordError = validateStrongPassword(newPassword)
    if (passwordError) {
      warning({ title: 'Weak password', description: passwordError })
      return
    }
    if (newPassword !== confirmPassword) {
      warning({ title: 'Passwords do not match', description: 'New password and confirmation must match.' })
      return
    }

    setSavingPassword(true)
    try {
      await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      await loadSessions()
      success({
        title: 'Password changed',
        description: 'Other devices have been signed out for security.',
      })
    } catch (err) {
      showError({
        title: 'Password change failed',
        description: getErrorMessage(err, 'Failed to change password'),
      })
    } finally {
      setSavingPassword(false)
    }
  }

  const saveInvoiceDefaults = async () => {
    const prefix = invoicePrefix.trim().toUpperCase() || 'INV'
    const days = Number(paymentTermsDays)
    if (!/^[A-Z0-9-]{1,20}$/.test(prefix)) {
      warning({
        title: 'Invalid prefix',
        description: 'Use 1–20 letters, numbers, or hyphens (e.g. INV, BS-).',
      })
      return
    }
    if (!Number.isFinite(days) || days < 0 || days > 365) {
      warning({ title: 'Invalid terms', description: 'Payment terms must be between 0 and 365 days.' })
      return
    }

    setSavingInvoiceDefaults(true)
    try {
      await updateCompany({
        ...company,
        invoicePrefix: prefix,
        defaultPaymentTermsDays: days,
      })
      success({ title: 'Invoice defaults saved', description: 'New invoices will use these defaults.' })
    } catch (err) {
      showError({
        title: 'Save failed',
        description: getErrorMessage(err, 'Failed to save invoice defaults'),
      })
    } finally {
      setSavingInvoiceDefaults(false)
    }
  }

  const revokeSession = (sessionId: string, deviceName: string) => {
    confirm({
      title: 'Logout this device?',
      description: `Sign out from ${deviceName}?`,
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm: async () => {
        setRevokingSessionId(sessionId)
        try {
          await apiFetch(`/api/auth/sessions/${sessionId}`, { method: 'DELETE' })
          await loadSessions()
        } catch (err) {
          showError({
            title: 'Logout failed',
            description: getErrorMessage(err, 'Failed to revoke session'),
          })
        } finally {
          setRevokingSessionId(null)
        }
      },
    })
  }

  const revokeOtherSessions = () => {
    if (otherSessionCount === 0) return
    confirm({
      title: 'Sign out all other devices?',
      description: `This will end ${otherSessionCount} other active session${otherSessionCount !== 1 ? 's' : ''}. Your current device stays signed in.`,
      confirmText: 'Sign out others',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setRevokingOthers(true)
        try {
          await apiFetch('/api/auth/sessions/others', { method: 'DELETE' })
          await loadSessions()
          success({ title: 'Done', description: 'All other devices have been signed out.' })
        } catch (err) {
          showError({
            title: 'Failed',
            description: getErrorMessage(err, 'Could not sign out other devices'),
          })
        } finally {
          setRevokingOthers(false)
        }
      },
    })
  }

  const exportData = async () => {
    setExporting(true)
    try {
      const [companyData, customers, items, invoices] = await Promise.all([
        apiFetch<Record<string, unknown>>('/api/company'),
        apiFetch<unknown[]>('/api/customers'),
        apiFetch<unknown[]>('/api/items'),
        apiFetch<unknown[]>('/api/invoices'),
      ])

      const payload = {
        exportedAt: new Date().toISOString(),
        account: { name: user?.name, email: user?.email },
        company: companyData,
        customers,
        items,
        invoices,
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `billing-studio-backup-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)

      success({ title: 'Export ready', description: 'Your data backup file has been downloaded.' })
    } catch (err) {
      showError({
        title: 'Export failed',
        description: getErrorMessage(err, 'Failed to export data'),
      })
    } finally {
      setExporting(false)
    }
  }

  const handleClearCache = async () => {
    setClearingCache(true)
    try {
      await clearPwaCaches()
      success({ title: 'Cache cleared', description: 'Offline cache has been reset.' })
    } catch {
      showError({ title: 'Failed', description: 'Could not clear cache.' })
    } finally {
      setClearingCache(false)
    }
  }

  const handlePwaInstall = async () => {
    if (canPrompt) {
      const outcome = await install()
      if (outcome === 'accepted') {
        success({ title: 'App installed', description: 'Billing Studio is now on your home screen.' })
      }
      return
    }
    if (isIos) {
      setShowIosHint((v) => !v)
      return
    }
    setShowAndroidHint((v) => !v)
  }

  return (
    <AppLayout>
      <div className="space-y-5 sm:space-y-6 animate-fade-in">
        <PageHero
          label="Manage"
          title="Settings"
          description="Account, security, invoice defaults, devices, and app preferences — all in one place."
        />

        <div className="grid gap-5 sm:gap-6 xl:grid-cols-2">
          {/* Workspace overview */}
          <SettingsSection
            title="Workspace"
            description="A quick snapshot of your billing data."
            className="xl:col-span-2"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: 'Customers', value: customers.length, icon: Users, href: '/customers', tone: 'text-[#2563EB] bg-blue-50' },
                { label: 'Items', value: items.length, icon: Package, href: '/items', tone: 'text-amber-700 bg-amber-50' },
                { label: 'Invoices', value: invoices.length, icon: FileText, href: '/invoices', tone: 'text-emerald-700 bg-emerald-50' },
              ].map((stat) => (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition hover:border-slate-300 hover:bg-white"
                >
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', stat.tone)}>
                    <stat.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </SettingsSection>

          {/* Account */}
          <SettingsSection
            title="Account"
            description="Profile photo, display name, and device info."
            className="xl:col-span-2"
          >
            <ProfileAvatarPicker
              name={profileName || user?.name || 'User'}
              avatarUrl={avatarUrl}
              avatarPreset={avatarPreset}
              saving={savingAvatar}
              onSelectPreset={(preset) => saveAvatar({ avatarPreset: preset, avatarUrl: '' })}
              onUpload={(dataUrl) => saveAvatar({ avatarPreset: 'custom', avatarUrl: dataUrl })}
            />

            <div className="mt-6 border-t border-slate-100 pt-2 space-y-1">
              <SettingsRow label="Display name">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="field-input border-slate-300"
                      placeholder="Your name"
                    />
                    <Button
                      type="button"
                      onClick={saveProfile}
                      disabled={savingProfile || profileName.trim() === user?.name}
                      className="shrink-0"
                    >
                      {savingProfile ? 'Saving…' : 'Save name'}
                    </Button>
                  </div>
                </SettingsRow>
                <SettingsRow label="Email" hint="Cannot be changed here">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-slate-800">{user?.email || '—'}</p>
                    {user?.email ? (
                      <Button type="button" variant="outline" size="sm" onClick={copyEmail} className="h-8 gap-1.5 px-2.5">
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </Button>
                    ) : null}
                  </div>
                </SettingsRow>
                <SettingsRow label="Member since">
                  <p className="text-sm text-slate-600">{formatDateTime(me?.accountCreatedAt)}</p>
                </SettingsRow>
                <SettingsRow label="This device">
                  <p className="text-sm text-slate-600">
                    {me ? `${me.deviceName} · ${me.browser} on ${me.os}` : '—'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    IP {formatIpAddress(me?.ipAddress || '')} · Last active {formatDateTime(me?.lastSeenAt)}
                  </p>
                </SettingsRow>
              </div>
          </SettingsSection>

          {/* Business shortcuts */}
          <SettingsSection title="Business" description="Company profile and setup status.">
            <Link
              href="/company-settings"
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition hover:border-blue-200 hover:bg-blue-50/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
                  <Building2 className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Company settings</p>
                  <p className="truncate text-xs text-slate-500">Logo, GST, bank details for invoices</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
            </Link>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                {onboardingComplete ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-sm text-slate-700">Business profile is complete</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span className="text-sm text-slate-700">Setup incomplete — </span>
                    <Link href="/company-settings" className="text-sm font-semibold text-[#2563EB] hover:underline">
                      complete in company settings
                    </Link>
                  </>
                )}
              </div>
              {company.gstnumber ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  GST: <span className="font-mono text-xs">{company.gstnumber}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  GST not set — add it in company settings for tax invoices.
                </div>
              )}
            </div>
          </SettingsSection>

          {/* Invoice defaults */}
          <SettingsSection title="Invoice defaults" description="Applied when creating new invoices.">
            <SettingsRow label="Invoice prefix" hint="e.g. INV, BS-">
              <Input
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                className="field-input border-slate-300 max-w-[160px] font-mono"
                maxLength={20}
              />
            </SettingsRow>
            <SettingsRow label="Payment terms" hint="Days until due">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={365}
                  value={paymentTermsDays}
                  onChange={(e) => setPaymentTermsDays(e.target.value)}
                  className="field-input border-slate-300 max-w-[100px]"
                />
                <span className="text-sm text-slate-500">days</span>
              </div>
            </SettingsRow>
            <div className="pt-2">
              <Button type="button" onClick={saveInvoiceDefaults} disabled={savingInvoiceDefaults}>
                {savingInvoiceDefaults ? 'Saving…' : 'Save invoice defaults'}
              </Button>
            </div>
          </SettingsSection>

          {/* Security */}
          <SettingsSection
            title="Security"
            description="Change password or use forgot-password if locked out."
            className="xl:col-span-2"
          >
            <form onSubmit={savePassword} className="max-w-xl space-y-4">
              <FormField label="Current password">
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="field-input border-slate-300"
                />
              </FormField>
              <FormField label="New password">
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="field-input border-slate-300"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Min 12 chars, upper, lower, number, and special character.
                </p>
              </FormField>
              <FormField label="Confirm new password">
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={fieldClassName(
                    confirmPassword && confirmPassword !== newPassword ? 'border-red-300' : undefined,
                    'border-slate-300',
                  )}
                />
              </FormField>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={savingPassword} className="gap-2">
                  <KeyRound className="h-4 w-4" />
                  {savingPassword ? 'Updating…' : 'Update password'}
                </Button>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#2563EB] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </form>
          </SettingsSection>

          {/* Sessions */}
          <SettingsSection
            id="sessions"
            title="Logged-in devices"
            description="Active sessions on phones, tablets, and browsers."
            className="xl:col-span-2"
            action={
              <div className="flex flex-wrap gap-2">
                {otherSessionCount > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={revokeOtherSessions}
                    disabled={revokingOthers}
                    className="gap-1.5"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {revokingOthers ? 'Signing out…' : `Sign out others (${otherSessionCount})`}
                  </Button>
                )}
                <Button type="button" variant="outline" size="sm" onClick={loadSessions} className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              </div>
            }
          >
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
              Changing your password signs out all other devices automatically.
            </div>

            {sessionsLoading ? (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                Loading sessions…
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                No active sessions found.
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className={cn(
                      'rounded-2xl border p-4',
                      session.isCurrent ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white',
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Shield className="h-4 w-4 text-slate-400" />
                      <p className="font-semibold text-slate-900">{session.deviceName}</p>
                      {session.isCurrent && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          This device
                        </span>
                      )}
                      {session.revokedAt && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                          Ended
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">
                      {session.browser} on {session.os}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      IP {formatIpAddress(session.ipAddress)} · Active {formatDateTime(session.lastSeenAt)}
                    </p>
                    {!session.isCurrent && !session.revokedAt && (
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => revokeSession(session.sessionId, session.deviceName)}
                          disabled={revokingSessionId === session.sessionId}
                          className="gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {revokingSessionId === session.sessionId ? 'Signing out…' : 'Sign out device'}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SettingsSection>

          {/* Data */}
          <SettingsSection title="Data & backup" description="Download a copy of your billing data.">
            <p className="mb-4 text-sm text-slate-600">
              Exports company profile, customers, items, and invoices as a JSON file for your records.
            </p>
            <Button type="button" variant="outline" onClick={exportData} disabled={exporting} className="gap-2">
              <HardDriveDownload className="h-4 w-4" />
              {exporting ? 'Preparing export…' : 'Download backup (JSON)'}
            </Button>
          </SettingsSection>

          {/* App */}
          <SettingsSection title="App" description="Install, cache, and app info.">
            {!isInstalled && canInstall && (
              <div className="mb-4">
                <Button type="button" onClick={handlePwaInstall} className="gap-2 w-full sm:w-auto">
                  {canPrompt ? <Download className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                  Install Billing Studio
                </Button>
                {showIosHint && (
                  <div className="mt-2 flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
                    <Share className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      In Safari, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
                    </span>
                  </div>
                )}
                {showAndroidHint && !canPrompt && (
                  <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
                    Chrome menu <strong>⋮</strong> → <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                  </div>
                )}
              </div>
            )}
            {isInstalled && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                App is installed on this device
              </div>
            )}

            <SettingsRow label="Offline cache">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                disabled={clearingCache}
              >
                {clearingCache ? 'Clearing…' : 'Clear cache'}
              </Button>
            </SettingsRow>
            <SettingsRow label="Version">
              <p className="text-sm text-slate-600">Billing Studio · Web app</p>
            </SettingsRow>
          </SettingsSection>
        </div>
      </div>
    </AppLayout>
  )
}
