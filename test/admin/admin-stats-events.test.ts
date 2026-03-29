import { existsSync, readFileSync } from "node:fs";

import { getTableColumns } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ADMIN_STATS_EVENT_TYPES,
  type AdminStatsEventRepository,
} from "@/db/repositories/admin-stats-event-repository";
import {
  adminStatsEvents,
  type AdminStatsEventInsert,
  type AdminStatsEventRecord,
} from "@/db/schema";

const { cookiesMock, draftRepositoryConstructorMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  draftRepositoryConstructorMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/db/repositories/assessment-draft-session-repository", async () => {
  const actual = await vi.importActual<
    typeof import("@/db/repositories/assessment-draft-session-repository")
  >("@/db/repositories/assessment-draft-session-repository");

  return {
    ...actual,
    DrizzleAssessmentDraftSessionRepository: draftRepositoryConstructorMock,
  };
});

class FakeAdminStatsEventDb {
  insertedValues: AdminStatsEventInsert[] = [];

  insert() {
    return {
      values: (values: AdminStatsEventInsert) => ({
        returning: async () => {
          this.insertedValues.push(values);

          return [this.toRecord(values, `event-${this.insertedValues.length}`)];
        },
      }),
    };
  }

  select() {
    return {
      from: () => ({
        orderBy: async () =>
          this.insertedValues.map((values, index) =>
            this.toRecord(values, `event-${index + 1}`),
          ),
      }),
    };
  }

  private toRecord(
    values: AdminStatsEventInsert,
    id: string,
  ): AdminStatsEventRecord {
    return {
      id,
      eventType: values.eventType,
      occurredAt: values.occurredAt,
    };
  }
}

class FakeCookiesStore {
  private readonly values = new Map<string, string>();
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

  delete(name: string) {
    this.values.delete(name);
    this.deleteCalls.push(name);
  }
}

class FakeDraftRepository {
  readonly deletedTokens: string[] = [];

  async deleteDraftSession(sessionToken: string) {
    this.deletedTokens.push(sessionToken);
  }
}

class FakeAdminStatsEventRepository implements AdminStatsEventRepository {
  readonly events: Array<{ eventType: string; occurredAt: Date }> = [];

  async recordEvent(input: { eventType: string; occurredAt: Date }) {
    const record = {
      id: `memory-event-${this.events.length + 1}`,
      eventType: input.eventType,
      occurredAt: input.occurredAt,
    };

    this.events.push(record);

    return record;
  }

  async listEvents() {
    return this.events.map((event, index) => ({
      id: `memory-event-${index + 1}`,
      eventType: event.eventType,
      occurredAt: event.occurredAt,
    }));
  }
}

describe("admin stats event contract", () => {
  beforeEach(() => {
    cookiesMock.mockReset();
    draftRepositoryConstructorMock.mockReset();
    vi.resetModules();
  });

  it("defines a dedicated append-only table for start and restart analytics events", () => {
    const columns = getTableColumns(adminStatsEvents);

    expect(Object.keys(columns)).toEqual(
      expect.arrayContaining(["eventType", "occurredAt"]),
    );
    expect(ADMIN_STATS_EVENT_TYPES).toEqual({
      assessmentStarted: "assessment_started",
      assessmentRestartClicked: "assessment_restart_clicked",
    });
  });

  it("persists append-only admin stats events through the repository boundary", async () => {
    const actualModule = await vi.importActual<
      typeof import("@/db/repositories/admin-stats-event-repository")
    >("@/db/repositories/admin-stats-event-repository");
    const repository = new actualModule.DrizzleAdminStatsEventRepository(
      new FakeAdminStatsEventDb() as never,
    );

    await repository.recordEvent({
      eventType: ADMIN_STATS_EVENT_TYPES.assessmentStarted,
      occurredAt: new Date("2026-03-29T16:00:00.000Z"),
    });
    await repository.recordEvent({
      eventType: ADMIN_STATS_EVENT_TYPES.assessmentRestartClicked,
      occurredAt: new Date("2026-03-29T16:30:00.000Z"),
    });

    await expect(repository.listEvents()).resolves.toMatchObject([
      {
        eventType: ADMIN_STATS_EVENT_TYPES.assessmentStarted,
      },
      {
        eventType: ADMIN_STATS_EVENT_TYPES.assessmentRestartClicked,
      },
    ]);
  });

  it("records result-page restart clicks through the dedicated restart route", async () => {
    const cookieStore = new FakeCookiesStore({
      assessment_session: "draft-session-token",
    });
    const draftRepository = new FakeDraftRepository();
    const eventRepository = new FakeAdminStatsEventRepository();

    cookiesMock.mockResolvedValue(cookieStore);
    draftRepositoryConstructorMock.mockImplementation(() => draftRepository);

    vi.doMock("@/db/repositories/admin-stats-event-repository", async () => {
      const actual = await vi.importActual<
        typeof import("@/db/repositories/admin-stats-event-repository")
      >("@/db/repositories/admin-stats-event-repository");

      return {
        ...actual,
        DrizzleAdminStatsEventRepository: vi.fn(() => eventRepository),
      };
    });

    const { DELETE } = await import("@/app/api/admin-stats/restart/route");
    const response = await DELETE();

    expect(response.status).toBe(204);
    expect(draftRepository.deletedTokens).toEqual(["draft-session-token"]);
    expect(cookieStore.deleteCalls).toEqual(["assessment_session"]);
    expect(eventRepository.events).toHaveLength(1);
    expect(eventRepository.events[0]?.eventType).toBe(
      ADMIN_STATS_EVENT_TYPES.assessmentRestartClicked,
    );
  });

  it("checks in drizzle migration artifacts for the admin stats events table", () => {
    expect(existsSync("drizzle/0003_phase5_admin_stats_events.sql")).toBe(true);
    expect(existsSync("drizzle/meta/0003_snapshot.json")).toBe(true);

    if (existsSync("drizzle/0003_phase5_admin_stats_events.sql")) {
      expect(readFileSync("drizzle/0003_phase5_admin_stats_events.sql", "utf8")).toContain(
        'CREATE TABLE "admin_stats_events"',
      );
    }
  });
});
