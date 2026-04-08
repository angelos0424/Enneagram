import { afterEach, describe, expect, it, vi } from "vitest";

const poolInstances: Array<Record<string, unknown>> = [];
const drizzleClients: Array<Record<string, unknown>> = [];

vi.mock("pg", () => ({
  Pool: vi.fn().mockImplementation((options: Record<string, unknown>) => {
    const pool = {
      options,
    };

    poolInstances.push(pool);

    return pool;
  }),
}));

vi.mock("drizzle-orm/node-postgres", () => ({
  drizzle: vi.fn().mockImplementation((config: Record<string, unknown>) => {
    const db = {
      config,
    };

    drizzleClients.push(db);

    return db;
  }),
}));

describe("db client", () => {
  afterEach(() => {
    poolInstances.length = 0;
    drizzleClients.length = 0;

    const globalDbState = globalThis as typeof globalThis & {
      __assessmentDbPool?: unknown;
      __assessmentDb?: unknown;
      __assessmentDbUrl?: string;
    };

    delete globalDbState.__assessmentDbPool;
    delete globalDbState.__assessmentDb;
    delete globalDbState.__assessmentDbUrl;

    vi.resetModules();
  });

  it("reuses the same postgres pool for repeated createDb calls with the same url", async () => {
    const { createDb } = await import("../../src/db/client");

    const first = createDb("postgres://postgres:postgres@db:5432/enneagram");
    const second = createDb("postgres://postgres:postgres@db:5432/enneagram");

    expect(first).toBe(second);
    expect(poolInstances).toHaveLength(1);
    expect(drizzleClients).toHaveLength(1);
    expect(poolInstances[0]).toMatchObject({
      options: {
        connectionString: "postgres://postgres:postgres@db:5432/enneagram",
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
        allowExitOnIdle: true,
      },
    });
  });
});
