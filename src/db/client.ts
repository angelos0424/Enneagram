import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getEnv } from "@/env";
import * as schema from "@/db/schema";

export function createDb(databaseUrl: string = getEnv().DATABASE_URL) {
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  return drizzle({
    client: pool,
    schema,
  });
}

export type AssessmentDb = ReturnType<typeof createDb>;
