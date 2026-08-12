'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, RefreshCw, Trash2 } from 'lucide-react'
import { AppLayout } from '@/app/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth-context'
import { apiFetch, getErrorMessage } from '@/lib/api-client'

interface WebSettings {
  websiteName: string
  tagline: string
  supportEmail: string
  supportPhone: string
  footerText: string
  language: string
  updatedAt?: string
}

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

import { WEB_SETTINGS_PLACEHOLDERS } from '@/lib/form-placeholders'

const DEFAULT_SETTINGS: WebSettings = {
  websiteName: 'Billing Studio',
  tagline: 'Professional billing and invoicing software',
  supportEmail: '',
  supportPhone: '',
  footerText: '',
  language: 'en',
}

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Hinglish', value: 'hinglish' },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<WebSettings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsError, setSessionsError] = useState<string | null>(null)
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null)

  const profileInitial = useMemo(() => user?.name?.charAt(0).toUpperCase() || 'U', [user?.name])

  const formatDateTime = (value: string) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
  }

  const formatIpAddress = (value: string) => {
    if (!value) return '-'
    if (value === '::1') return '127.0.0.1 (localhost)'
    return value
  }

  const loadSettings = async () => {
    try {
      const data = await apiFetch<WebSettings>('/api/web-settings')
      const nextSettings = {
        websiteName: data.websiteName || DEFAULT_SETTINGS.websiteName,
        tagline: data.tagline || '',
        supportEmail: data.supportEmail || '',
        supportPhone: data.supportPhone || '',
        footerText: data.footerText || '',
        language: data.language || DEFAULT_SETTINGS.language,
        updatedAt: data.updatedAt,
      }
      setSettings(nextSettings)
      document.documentElement.lang = nextSettings.language
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load web settings'))
    }
  }

  const loadSessions = async () => {
    if (!user) return

    setSessionsLoading(true)
    try {
      const data = await apiFetch<{ sessions: SessionSummary[] }>('/api/auth/sessions')
      setSessions(data.sessions || [])
      setSessionsError(null)
    } catch (err) {
      setSessions([])
      setSessionsError(getErrorMessage(err, 'Failed to load sessions'))
    } finally {
      setSessionsLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    loadSessions()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const data = await apiFetch<WebSettings>('/api/web-settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      })
      const nextLanguage = data.language || settings.language
      setSettings((prev) => ({ ...prev, updatedAt: data.updatedAt, language: nextLanguage }))
      document.documentElement.lang = nextLanguage
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save web settings'))
    } finally {
      setSaving(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId)
    try {
      await apiFetch(`/api/auth/sessions/${sessionId}`, { method: 'DELETE' })
      await loadSessions()
    } catch (err) {
      setSessionsError(getErrorMessage(err, 'Failed to revoke session'))
    } finally {
      setRevokingSessionId(null)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-[#E5E7EB] bg-white/95 p-6 shadow-sm">
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.95fr]">
            <div className="rounded-[26px] border border-[#E5E7EB] bg-[#F9FAFB] p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6B7280]">Website settings</p>
                <h1 className="mt-2 text-3xl font-semibold text-[#111827]">Public-facing preferences</h1>
                <p className="mt-2 max-w-2xl text-sm text-[#4B5563]">Update the name, contact details, and footer text shown across your billing portal.</p>
                {settings.updatedAt && (
                  <p className="mt-3 text-sm text-[#6B7280]">Last updated {new Date(settings.updatedAt).toLocaleString()}</p>
                )}
                {error && (
                  <div className="mt-4 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#B91C1C]">
                    {error}
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#111827]">Website name</label>
                  <Input
                    value={settings.websiteName}
                    onChange={(e) => setSettings((prev) => ({ ...prev, websiteName: e.target.value }))}
                    placeholder={WEB_SETTINGS_PLACEHOLDERS.websiteName}
                    className="border-[#E5E7EB]"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#111827]">Tagline</label>
                  <Input
                    value={settings.tagline}
                    onChange={(e) => setSettings((prev) => ({ ...prev, tagline: e.target.value }))}
                    placeholder={WEB_SETTINGS_PLACEHOLDERS.tagline}
                    className="border-[#E5E7EB]"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#111827]">Support email</label>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings((prev) => ({ ...prev, supportEmail: e.target.value }))}
                    placeholder={WEB_SETTINGS_PLACEHOLDERS.supportEmail}
                    className="border-[#E5E7EB]"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#111827]">Support phone</label>
                  <Input
                    value={settings.supportPhone}
                    onChange={(e) => setSettings((prev) => ({ ...prev, supportPhone: e.target.value }))}
                    placeholder={WEB_SETTINGS_PLACEHOLDERS.supportPhone}
                    className="border-[#E5E7EB]"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#111827]">Footer text</label>
                  <Textarea
                    value={settings.footerText}
                    onChange={(e) => setSettings((prev) => ({ ...prev, footerText: e.target.value }))}
                    rows={3}
                    className="border-[#E5E7EB]"
                    placeholder={WEB_SETTINGS_PLACEHOLDERS.footerText}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DBEAFE] text-sm font-semibold text-[#1D4ED8]">
                    {profileInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#111827]">{user?.name || 'Your profile'}</p>
                    <p className="truncate text-xs text-[#6B7280]">{user?.email || 'No email available'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
                  className="h-11 w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-sm font-semibold text-[#111827]">Save changes</p>
                <p className="mt-1 text-sm text-[#6B7280]">Save the current website settings and language preference for your account.</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  {savedMessage && (
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-2 text-sm text-[#15803D]">
                      <CheckCircle className="h-4 w-4" />
                      Saved
                    </div>
                  )}
                  <Button type="button" onClick={handleSubmit} disabled={saving} className="gap-2">
                    {saving ? 'Saving...' : 'Save changes'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="soft-card rounded-[32px] p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <section id="sessions" className="space-y-5">
              <div className="rounded-[26px] border border-[#E5E7EB] bg-[#F9FAFB] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6B7280]">Session info</p>
                    <h2 className="mt-2 text-2xl font-semibold text-[#111827]">Logged-in devices</h2>
                  </div>
                  <Button type="button" variant="outline" onClick={loadSessions} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>

                <div className="mt-4 rounded-[22px] border border-[#E5E7EB] bg-white p-4 text-sm text-[#6B7280]">
                  IP address is shown from the server session. MAC address is not available in the browser.
                </div>

                {sessionsError && (
                  <div className="mt-4 rounded-[22px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                    {sessionsError}
                  </div>
                )}

                {sessionsLoading ? (
                  <div className="mt-4 rounded-[22px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-4 py-8 text-center text-sm text-[#6B7280]">
                    Loading session history...
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="mt-4 rounded-[22px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-4 py-8 text-center text-sm text-[#6B7280]">
                    No active sessions found.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {sessions.map((session) => (
                      <div key={session.sessionId} className={`rounded-[24px] border p-4 ${session.isCurrent ? 'border-[#BFDBFE] bg-[#EFF6FF]' : 'border-[#E5E7EB] bg-white'}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[#111827]">{session.deviceName}</p>
                          {session.isCurrent && <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">Current device</span>}
                          {session.revokedAt && <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#6B7280]">Logged out</span>}
                        </div>
                        <p className="mt-2 text-sm text-[#4B5563]">{session.browser} on {session.os}</p>
                        <p className="mt-1 text-sm text-[#6B7280]">Logged in {formatDateTime(session.createdAt)} · Last active {formatDateTime(session.lastSeenAt)}</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#9CA3AF]">IP address</p>
                            <p className="mt-1 text-sm text-[#111827]">{formatIpAddress(session.ipAddress)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#9CA3AF]">Expires</p>
                            <p className="mt-1 text-sm text-[#111827]">{formatDateTime(session.expiresAt)}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E5E7EB] pt-4">
                          <p className="text-sm text-[#6B7280]">Session ID: {session.sessionId.slice(0, 8)}...{session.sessionId.slice(-6)}</p>
                          {!session.isCurrent && !session.revokedAt ? (
                            <Button type="button" variant="outline" onClick={() => revokeSession(session.sessionId)} disabled={revokingSessionId === session.sessionId} className="gap-2">
                              <Trash2 className="h-4 w-4" />
                              {revokingSessionId === session.sessionId ? 'Signing out...' : 'Logout this device'}
                            </Button>
                          ) : (
                            <span className="text-sm font-medium text-[#2563EB]">Use Logout from profile menu to end this session.</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
