import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getEnv } from "@/env";
import * as schema from "@/db/schema";

type GlobalDbState = typeof globalThis & {
  __assessmentDbPool?: Pool;
  __assessmentDb?: ReturnType<typeof drizzle<typeof schema>>;
  __assessmentDbUrl?: string;
};

function getGlobalDbState(): GlobalDbState {
  return globalThis as GlobalDbState;
}

export function createDb(databaseUrl: string = getEnv().DATABASE_URL) {
  const globalDbState = getGlobalDbState();

  if (
    globalDbState.__assessmentDb &&
    globalDbState.__assessmentDbPool &&
    globalDbState.__assessmentDbUrl === databaseUrl
  ) {
    return globalDbState.__assessmentDb;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  });

  const db = drizzle({
    client: pool,
    schema,
  });

  globalDbState.__assessmentDbPool = pool;
  globalDbState.__assessmentDb = db;
  globalDbState.__assessmentDbUrl = databaseUrl;

  return db;
}

export type AssessmentDb = ReturnType<typeof createDb>;
