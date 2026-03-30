import { beforeEach, describe, expect, it, vi } from "vitest";

const connectSpy = vi.fn();

vi.mock("../../src/db/client", () => ({
  createDb: connectSpy,
}));

describe("/api/health route", () => {
  beforeEach(() => {
    connectSpy.mockReset();
  });

  it("returns a stable process-level 200 response without touching postgres", async () => {
    const { GET } = await import("../../src/app/api/health/route");

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      service: "web",
      checks: {
        process: "up",
      },
    });

    expect(connectSpy).not.toHaveBeenCalled();
  });
});
