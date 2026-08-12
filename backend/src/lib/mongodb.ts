import { MongoClient, MongoClientOptions, Db } from 'mongodb'

// Use 127.0.0.1 instead of localhost to avoid IPv6 (::1) connection issues on Windows
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
const dbName = process.env.MONGODB_DB || 'billing'

const options: MongoClientOptions = {
  maxPoolSize: 10,
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(uri, options)
  return client.connect().catch((error) => {
    // Clear cached promise so the next request can retry after MongoDB starts
    if (process.env.NODE_ENV === 'development') {
      global._mongoClientPromise = undefined
    }
    console.error(
      'MongoDB connection failed. Ensure MongoDB is running and MONGODB_URI is correct:',
      error instanceof Error ? error.message : error
    )
    throw error
  })
}

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise()
  }
  clientPromise = global._mongoClientPromise
} else {
  clientPromise = createClientPromise()
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise
}

export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient()
  return client.db(dbName)
}

let indexesEnsured = false

export async function ensureIndexes(): Promise<void> {
  if (indexesEnsured) return
  const db = await getDatabase()
  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('users').createIndex({ userId: 1 }, { unique: true }),
    db.collection('auth_sessions').createIndex({ sessionId: 1 }, { unique: true }),
    db.collection('auth_sessions').createIndex({ userId: 1 }),
    db.collection('auth_sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('web_settings').createIndex({ userId: 1 }, { unique: true }),
    db.collection('invoice_counters').createIndex({ userId: 1, prefix: 1 }, { unique: true }),
    db.collection('invoices').createIndex({ userId: 1, invoiceNumber: 1 }, { unique: true }),
    db.collection('invoices').createIndex({ userId: 1, date: -1 }),
    db.collection('invoices').createIndex({ userId: 1, status: 1 }),
    db.collection('invoices').createIndex({ userId: 1, customerId: 1 }),
    db.collection('customers').createIndex({ userId: 1 }),
    db.collection('customers').createIndex({ userId: 1, id: 1 }, { unique: true }),
    db.collection('items').createIndex({ userId: 1 }),
    db.collection('items').createIndex({ userId: 1, id: 1 }, { unique: true }),
    db.collection('company').createIndex({ userId: 1 }, { unique: true }),
  ])
  indexesEnsured = true
}
