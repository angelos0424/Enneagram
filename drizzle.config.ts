import type { Config } from "drizzle-kit";

import { getEnv } from "@/env";

const { DATABASE_URL } = getEnv();

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
} satisfies Config;
