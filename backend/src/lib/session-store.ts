import { getDatabase } from './mongodb.js'

export interface SessionDeviceDetails {
  userAgent: string
  ipAddress: string
}

export interface SessionRecord {
  sessionId: string
  userId: string
  email: string
  name: string
  userAgent: string
  deviceName: string
  browser: string
  os: string
  ipAddress: string
  createdAt: string
  lastSeenAt: string
  expiresAt: string
  revokedAt: string | null
}

const COLLECTION_NAME = 'auth_sessions'

function getBrowserName(userAgent: string): string {
  if (/edg\//i.test(userAgent)) return 'Microsoft Edge'
  if (/opr\//i.test(userAgent) || /opera/i.test(userAgent)) return 'Opera'
  if (/firefox\//i.test(userAgent)) return 'Firefox'
  if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent) && !/opr\//i.test(userAgent)) return 'Chrome'
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) return 'Safari'
  if (/msie|trident/i.test(userAgent)) return 'Internet Explorer'
  return 'Unknown browser'
}

function getOperatingSystem(userAgent: string): string {
  if (/windows nt/i.test(userAgent)) return 'Windows'
  if (/mac os x/i.test(userAgent) && !/iphone|ipad|ipod/i.test(userAgent)) return 'macOS'
  if (/android/i.test(userAgent)) return 'Android'
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS'
  if (/linux/i.test(userAgent)) return 'Linux'
  return 'Unknown OS'
}

export function describeSessionDevice(userAgent: string): { browser: string; os: string; deviceName: string } {
  const browser = getBrowserName(userAgent)
  const os = getOperatingSystem(userAgent)
  const deviceName = browser === 'Unknown browser' && os === 'Unknown OS'
    ? 'Unknown device'
    : `${browser} on ${os}`

  return { browser, os, deviceName }
}

function mapSessionRecord(record: Record<string, unknown>): SessionRecord {
  return {
    sessionId: String(record.sessionId || ''),
    userId: String(record.userId || ''),
    email: String(record.email || ''),
    name: String(record.name || ''),
    userAgent: String(record.userAgent || ''),
    deviceName: String(record.deviceName || 'Unknown device'),
    browser: String(record.browser || 'Unknown browser'),
    os: String(record.os || 'Unknown OS'),
    ipAddress: String(record.ipAddress || 'unknown'),
    createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : String(record.createdAt || new Date().toISOString()),
    lastSeenAt: record.lastSeenAt instanceof Date ? record.lastSeenAt.toISOString() : String(record.lastSeenAt || new Date().toISOString()),
    expiresAt: record.expiresAt instanceof Date ? record.expiresAt.toISOString() : String(record.expiresAt || new Date().toISOString()),
    revokedAt: record.revokedAt instanceof Date ? record.revokedAt.toISOString() : record.revokedAt === null || typeof record.revokedAt === 'string' ? record.revokedAt : null,
  }
}

async function getSessionCollection() {
  const db = await getDatabase()
  return db.collection(COLLECTION_NAME)
}

export async function createSessionRecord(
  sessionId: string,
  userId: string,
  email: string,
  name: string,
  details: SessionDeviceDetails,
  expiresAt: Date,
): Promise<void> {
  const { browser, os, deviceName } = describeSessionDevice(details.userAgent)
  const now = new Date()

  const collection = await getSessionCollection()
  await collection.insertOne({
    sessionId,
    userId,
    email,
    name,
    userAgent: details.userAgent,
    deviceName,
    browser,
    os,
    ipAddress: details.ipAddress,
    createdAt: now,
    lastSeenAt: now,
    expiresAt,
    revokedAt: null,
  })
}

export async function getActiveSessionRecord(sessionId: string): Promise<SessionRecord | null> {
  const collection = await getSessionCollection()
  const record = await collection.findOne({
    sessionId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })

  return record ? mapSessionRecord(record) : null
}

export async function touchSessionRecord(sessionId: string): Promise<void> {
  const collection = await getSessionCollection()
  await collection.updateOne(
    { sessionId, revokedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { lastSeenAt: new Date() } }
  )
}

export async function revokeSessionRecord(sessionId: string): Promise<void> {
  const collection = await getSessionCollection()
  await collection.updateOne(
    { sessionId },
    { $set: { revokedAt: new Date() } }
  )
}

export async function revokeUserSessionRecord(sessionId: string, userId: string): Promise<boolean> {
  const collection = await getSessionCollection()
  const result = await collection.updateOne(
    { sessionId, userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  )
  return result.modifiedCount > 0
}

export async function revokeAllUserSessions(userId: string, exceptSessionId?: string): Promise<number> {
  const collection = await getSessionCollection()
  const filter: Record<string, unknown> = { userId, revokedAt: null }
  if (exceptSessionId) {
    filter.sessionId = { $ne: exceptSessionId }
  }
  const result = await collection.updateMany(filter, { $set: { revokedAt: new Date() } })
  return result.modifiedCount
}

export async function listUserSessions(userId: string): Promise<SessionRecord[]> {
  const collection = await getSessionCollection()
  const records = await collection
    .find({ userId, revokedAt: null, expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .toArray()
  return records.map((record) => mapSessionRecord(record))
}