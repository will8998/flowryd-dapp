import postgres from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import * as relations from './relations';

type SchemaType = typeof schema & typeof relations;

let _db: PostgresJsDatabase<SchemaType> | null = null;

function getDb(): PostgresJsDatabase<SchemaType> {
  if (!_db) {
    const sql = postgres(process.env.DATABASE_URL!);
    _db = drizzle(sql, { schema: { ...schema, ...relations } });
  }
  return _db;
}

export const db = new Proxy({} as PostgresJsDatabase<SchemaType>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export type Database = PostgresJsDatabase<SchemaType>;