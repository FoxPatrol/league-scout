import { MongoClient, Db } from 'mongodb';
import { env } from 'process';

const mongoUri = env.MONGODB_URI;
const dbName = env.MONGODB_DATABASE;

export class MongoDBConnector {
  private static instance: MongoDBConnector;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  public static getInstance(): MongoDBConnector {
    if (!MongoDBConnector.instance) {
      MongoDBConnector.instance = new MongoDBConnector();
    }

    return MongoDBConnector.instance;
  }

  public async connect(): Promise<boolean> {
    if (!mongoUri) {
      Error('No mongo Uri');
      return false;
    }

    if (!dbName) {
      Error('No db name');
      return false;
    }

    if (!this.client) {
      this.client = new MongoClient(mongoUri);
      await this.client.connect();
      this.db = this.client.db(dbName);
    }

    return true;
  }

  public getDb(): Db {
    if (!this.client) {
      throw new Error(
        'Database client not initialized. Call connect() before getDb()',
      );
    }

    if (!this.db) {
      throw new Error(
        'Database not initialized. Make sure connection is created',
      );
    }
    return this.db;
  }

  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}
