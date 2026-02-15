import { MongoClient, Db } from 'mongodb';
import { env } from '../config/env';

let client: MongoClient | null = null;
let database: Db | null = null;

/**
 * Connect the MongoDB client eagerly.
 * Call this during server bootstrap to avoid slow initial API calls.
 */
export const connectMongo = async () => {
  if (client) {
    return client;
  }
  client = new MongoClient(env.mongoUri);
  await client.connect();
  database = client.db(env.mongoDbName);
  console.log('[mongo] Native MongoDB client connected');
  
  // Create indexes for faster queries
  await ensureIndexes(database);
  
  return client;
};

/**
 * Create database indexes for optimal query performance
 */
const ensureIndexes = async (db: Db) => {
  try {
    // Compound index for tenant_data collection - critical for bootstrap/secondary queries
    await db.collection('tenant_data').createIndex(
      { tenantId: 1, key: 1 },
      { unique: true, background: true }
    );
    
    // Indexes for expenses collection - faster business report queries
    await db.collection('expenses').createIndex(
      { tenantId: 1, date: -1 },
      { background: true }
    );
    await db.collection('expenses').createIndex(
      { tenantId: 1, status: 1, category: 1 },
      { background: true }
    );
    
    // Indexes for incomes collection - faster business report queries  
    await db.collection('incomes').createIndex(
      { tenantId: 1, date: -1 },
      { background: true }
    );
    await db.collection('incomes').createIndex(
      { tenantId: 1, status: 1, category: 1 },
      { background: true }
    );
    
    console.log('[mongo] Indexes ensured for tenant_data, expenses, incomes');
  } catch (error) {
    // Index might already exist, that's fine
    console.log('[mongo] Index creation skipped (may already exist)');
  }
};

export const getMongoClient = async () => {
  if (client) {
    return client;
  }
  // Fallback: connect lazily if not already connected
  return connectMongo();
};

export const getDatabase = async () => {
  if (database) {
    return database;
  }
  await getMongoClient();
  if (!database) {
    database = client!.db(env.mongoDbName);
  }
  return database;
};

export const disconnectMongo = async () => {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
};
