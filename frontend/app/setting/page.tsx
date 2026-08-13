'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Trash2 } from 'lucide-react'
import { AppLayout } from '@/app/app-layout'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { apiFetch, getErrorMessage } from '@/lib/api-client'
import { PageHero } from '@/components/page-hero'
import { useConfirm, useFeedback } from '@/components/confirm-provider'

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

export default function SettingsPage() {
  const { user } = useAuth()
  const { confirm } = useConfirm()
  const { error: showError } = useFeedback()
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null)

  const formatDateTime = (value: string) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
  }

  const formatIpAddress = (value: string) => {
    if (!value) return '-'
    if (value === '::1') return '127.0.0.1 (localhost)'
    return value
  }

  const loadSessions = async () => {
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
  }

  useEffect(() => {
    loadSessions()
  }, [user])

  const revokeSession = (sessionId: string, deviceName: string) => {
    confirm({
      title: 'Logout this device?',
      description: `Are you sure you want to sign out from ${deviceName}?`,
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

  return (
    <AppLayout>
      <div className="space-y-5 sm:space-y-6 animate-fade-in">
        <PageHero
          label="Manage"
          title="Settings"
          description="See which devices are logged in to your account and sign out remotely if needed."
        />

        <div className="premium-card p-5 sm:p-6">
          <section id="sessions" className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="card-heading">Logged-in devices</h2>
                  <p className="card-subtext">Sessions tied to your account.</p>
                </div>
                <Button type="button" variant="outline" onClick={loadSessions} className="gap-2 w-full sm:w-auto">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-500">
                IP comes from the server. MAC address isn’t available in the browser.
              </div>

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
                      <div className="mt-4 flex flex-col gap-3 border-t border-[#E5E7EB] pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="break-all text-xs text-[#6B7280] sm:text-sm">
                          Session: {session.sessionId.slice(0, 8)}…{session.sessionId.slice(-6)}
                        </p>
                        {!session.isCurrent && !session.revokedAt ? (
                          <Button type="button" variant="outline" onClick={() => revokeSession(session.sessionId, session.deviceName)} disabled={revokingSessionId === session.sessionId} className="h-11 w-full gap-2 sm:w-auto">
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
      </div>
    </AppLayout>
  )
}
