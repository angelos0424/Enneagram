import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getEnv } from "@/env";

const redirectMock = vi.fn((location: string) => {
  throw new Error(`REDIRECT:${location}`);
});

const cookiesMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

class FakeCookiesStore {
  private readonly values = new Map<string, string>();
  readonly setCalls: Array<{ name: string; value: string; options: object }> = [];
  readonly deleteCalls: string[] = [];

  constructor(seed?: Record<string, string>) {
    Object.entries(seed ?? {}).forEach(([name, value]) => {
      this.values.set(name, value);
    });
  }

  get(name: string) {
    const value = this.values.get(name);
    return value ? { name, value } : undefined;
  }

  set(name: string, value: string, options: object) {
    this.values.set(name, value);
    this.setCalls.push({ name, value, options });
  }

  delete(name: string) {
    this.values.delete(name);
    this.deleteCalls.push(name);
  }
}

function buildEnv(overrides?: Partial<NodeJS.ProcessEnv>) {
  return getEnv({
    DATABASE_URL: "postgres://postgres:postgres@127.0.0.1:5432/enneagram",
    NODE_ENV: "test",
    ADMIN_PASSWORD: "correct horse battery staple",
    ADMIN_SESSION_SECRET: "admin-session-secret-with-at-least-32",
    ...overrides,
  });
}

describe("admin auth contract", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    cookiesMock.mockReset();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("requires explicit admin auth env values", () => {
    expect(() =>
      getEnv({
        DATABASE_URL: "postgres://postgres:postgres@127.0.0.1:5432/enneagram",
        NODE_ENV: "test",
      }),
    ).toThrow();
  });

  it("defines a signed HttpOnly admin session cookie boundary", async () => {
    const {
      ADMIN_SESSION_COOKIE,
      buildAdminSessionCookie,
      createAdminSessionToken,
      getAdminSessionCookieOptions,
      verifyAdminSessionToken,
    } = await import("@/domain/admin-auth");
    const env = buildEnv();
    const now = new Date("2026-03-29T16:00:00.000Z");
    const token = createAdminSessionToken(env, now);
    const cookie = buildAdminSessionCookie(token, env);

    expect(ADMIN_SESSION_COOKIE.name).toBe("admin_session");
    expect(cookie).toEqual({
      name: "admin_session",
      value: token,
      options: getAdminSessionCookieOptions(env),
    });
    expect(cookie.options).toMatchObject({
      httpOnly: true,
      path: "/admin",
      sameSite: "lax",
      secure: false,
    });
    expect(verifyAdminSessionToken(token, env, new Date("2026-03-29T20:00:00.000Z")))
      .toMatchObject({
        subject: "admin",
        issuedAt: now.toISOString(),
      });
  });

  it("rejects tampered, expired, or missing admin sessions", async () => {
    const {
      createAdminSessionToken,
      verifyAdminSessionToken,
    } = await import("@/domain/admin-auth");
    const env = buildEnv();
    const token = createAdminSessionToken(env, new Date("2026-03-29T16:00:00.000Z"));

    expect(
      verifyAdminSessionToken(`${token}x`, env, new Date("2026-03-29T16:05:00.000Z")),
    ).toBeNull();
    expect(
      verifyAdminSessionToken(token, env, new Date("2026-03-30T12:05:00.000Z")),
    ).toBeNull();
    expect(verifyAdminSessionToken("", env)).toBeNull();
  });

  it("validates the admin password using constant-time comparison semantics", async () => {
    const { isValidAdminPassword } = await import("@/domain/admin-auth");
    const env = buildEnv();

    expect(isValidAdminPassword("correct horse battery staple", env)).toBe(true);
    expect(isValidAdminPassword("wrong horse battery staple", env)).toBe(false);
    expect(isValidAdminPassword("short", env)).toBe(false);
  });

  it("returns an error state for a wrong login password", async () => {
    const cookieStore = new FakeCookiesStore();

    cookiesMock.mockResolvedValue(cookieStore);
    vi.stubEnv("DATABASE_URL", "postgres://postgres:postgres@127.0.0.1:5432/enneagram");
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("ADMIN_PASSWORD", "correct horse battery staple");
    vi.stubEnv("ADMIN_SESSION_SECRET", "admin-session-secret-with-at-least-32");

    const { loginAdminAction } = await import(
      "@/app/admin/login/actions"
    );
    const formData = new FormData();
    formData.set("password", "wrong horse battery staple");

    await expect(
      loginAdminAction({ errorMessage: null }, formData),
    ).resolves.toEqual({
      errorMessage: "관리자 비밀번호가 올바르지 않습니다.",
    });
    expect(cookieStore.setCalls).toEqual([]);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("issues a signed cookie and redirects after a valid login", async () => {
    const cookieStore = new FakeCookiesStore();

    cookiesMock.mockResolvedValue(cookieStore);
    vi.stubEnv("DATABASE_URL", "postgres://postgres:postgres@127.0.0.1:5432/enneagram");
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("ADMIN_PASSWORD", "correct horse battery staple");
    vi.stubEnv("ADMIN_SESSION_SECRET", "admin-session-secret-with-at-least-32");

    const {
      ADMIN_SESSION_COOKIE,
      verifyAdminSessionToken,
    } = await import("@/domain/admin-auth");
    const { loginAdminAction } = await import(
      "@/app/admin/login/actions"
    );
    const formData = new FormData();
    formData.set("password", "correct horse battery staple");

    await expect(loginAdminAction({ errorMessage: null }, formData)).rejects.toThrow(
      "REDIRECT:/admin",
    );
    expect(cookieStore.setCalls).toHaveLength(1);
    expect(cookieStore.setCalls[0]?.name).toBe(ADMIN_SESSION_COOKIE.name);
    expect(
      verifyAdminSessionToken(cookieStore.setCalls[0]!.value, buildEnv(), new Date("2026-03-29T16:05:00.000Z")),
    ).toMatchObject({
      subject: "admin",
    });
  });

  it("clears the admin session on logout", async () => {
    const cookieStore = new FakeCookiesStore();

    cookiesMock.mockResolvedValue(cookieStore);

    const { logoutAdminAction } = await import("@/app/admin/login/actions");

    await expect(logoutAdminAction()).rejects.toThrow("REDIRECT:/admin/login");
    expect(cookieStore.deleteCalls).toEqual(["admin_session"]);
  });

  it("redirects unauthenticated or invalid sessions away from protected admin routes", async () => {
    const { createAdminSessionToken } = await import("@/domain/admin-auth");
    const validToken = createAdminSessionToken(buildEnv(), new Date("2026-03-29T16:00:00.000Z"));

    vi.stubEnv("DATABASE_URL", "postgres://postgres:postgres@127.0.0.1:5432/enneagram");
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("ADMIN_PASSWORD", "correct horse battery staple");
    vi.stubEnv("ADMIN_SESSION_SECRET", "admin-session-secret-with-at-least-32");

    cookiesMock.mockResolvedValueOnce(new FakeCookiesStore());
    const { default: ProtectedAdminLayout } = await import(
      "@/app/admin/(protected)/layout"
    );

    await expect(
      ProtectedAdminLayout({
        children: createElement("div", null, "protected admin content"),
      }),
    ).rejects.toThrow("REDIRECT:/admin/login");

    cookiesMock.mockResolvedValueOnce(
      new FakeCookiesStore({
        admin_session: `${validToken}tampered`,
      }),
    );

    await expect(
      ProtectedAdminLayout({
        children: createElement("div", null, "protected admin content"),
      }),
    ).rejects.toThrow("REDIRECT:/admin/login");

    cookiesMock.mockResolvedValueOnce(
      new FakeCookiesStore({
        admin_session: validToken,
      }),
    );

    const markup = renderToStaticMarkup(
      await ProtectedAdminLayout({
        children: createElement("div", null, "protected admin content"),
      }),
    );

    expect(markup).toContain("운영 통계");
    expect(markup).toContain("protected admin content");
  });
});
