import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getEnv } from "../../src/env";

const projectRoot = path.resolve(__dirname, "../..");
const dockerfilePath = path.join(projectRoot, "Dockerfile");
const dockerignorePath = path.join(projectRoot, ".dockerignore");

describe("deployment artifact contract", () => {
  it("locks standalone next output while preserving the public result referrer policy", async () => {
    const nextConfig = (await import("../../next.config")).default;

    expect(nextConfig.output).toBe("standalone");
    expect(nextConfig.headers).toBeTypeOf("function");

    const headers = await nextConfig.headers?.();
    const publicResultRule = headers?.find(
      (entry) => entry.source === "/results/:publicId*",
    );

    expect(publicResultRule).toMatchObject({
      source: "/results/:publicId*",
      headers: expect.arrayContaining([
        expect.objectContaining({
          key: "Referrer-Policy",
          value: "no-referrer",
        }),
      ]),
    });
  });

  it("requires both checked-in docker artifacts for a deterministic Coolify build", () => {
    expect(existsSync(dockerfilePath)).toBe(true);
    expect(existsSync(dockerignorePath)).toBe(true);
  });

  it("keeps the container contract focused on the web app instead of bundling postgres", () => {
    const dockerfile = readFileSync(dockerfilePath, "utf8");
    const dockerignore = readFileSync(dockerignorePath, "utf8");

    expect(dockerfile).toContain("FROM node:24");
    expect(dockerfile).toMatch(
      /node["\s,]+["']?\.next\/standalone\/server\.js["']?/,
    );
    expect(dockerfile).not.toMatch(/postgres|postgis|pg_ctl|docker-compose|compose\.ya?ml/i);

    expect(dockerignore).toContain(".git");
    expect(dockerignore).toContain(".next");
    expect(dockerignore).toContain("node_modules");
    expect(dockerignore).not.toMatch(/postgres|pgdata/i);
  });

  it("requires APP_ORIGIN when parsing the production runtime contract", () => {
    expect(() =>
      getEnv({
        DATABASE_URL: "postgres://postgres:postgres@db:5432/enneagram",
        NODE_ENV: "production",
        ADMIN_PASSWORD: "super-secret-password",
        ADMIN_SESSION_SECRET:
          "0123456789abcdef0123456789abcdef0123456789abcdef",
      }),
    ).toThrow(/APP_ORIGIN/i);

    expect(
      getEnv({
        APP_ORIGIN: "https://enneagram.example.com",
        DATABASE_URL: "postgres://postgres:postgres@db:5432/enneagram",
        NODE_ENV: "production",
        ADMIN_PASSWORD: "super-secret-password",
        ADMIN_SESSION_SECRET:
          "0123456789abcdef0123456789abcdef0123456789abcdef",
      }),
    ).toMatchObject({
      APP_ORIGIN: "https://enneagram.example.com",
      NODE_ENV: "production",
    });
  });
});
