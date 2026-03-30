import { asc, eq, isNotNull, sql } from "drizzle-orm";

import { typeCopyDefinition } from "@/content/type-copy/ko/v1";
import {
  ADMIN_STATS_EVENT_TYPES,
  type AdminStatsEventType,
} from "@/db/repositories/admin-stats-event-repository";
import { createDb, type AssessmentDb } from "@/db/client";
import { adminStatsEvents, assessmentResults } from "@/db/schema";
import {
  ADMIN_STATS_SMALL_CELL_THRESHOLD,
  ADMIN_STATS_TIME_ZONE,
  type AdminStatsDashboardData,
} from "@/domain/admin-stats/types";
import {
  buildSuppressedDistribution,
  suppressCount,
} from "@/domain/admin-stats/suppression";

type DailyCountRow = {
  day: string;
  count: number;
};

type DistributionRow = {
  key: string;
  count: number;
};

type ResultMemoryStore = Map<string, (typeof assessmentResults.$inferSelect)>;
type EventMemoryStore = Map<string, (typeof adminStatsEvents.$inferSelect)>;

function shouldUseInMemoryStore() {
  return (
    process.env.USE_IN_MEMORY_ASSESSMENT_DRAFTS === "true" ||
    process.env.USE_IN_MEMORY_ASSESSMENT_RESULTS === "true"
  );
}

function getResultMemoryStore(): ResultMemoryStore {
  const globalStore = globalThis as typeof globalThis & {
    __assessmentResultMemoryStore?: ResultMemoryStore;
  };

  if (!globalStore.__assessmentResultMemoryStore) {
    globalStore.__assessmentResultMemoryStore = new Map();
  }

  return globalStore.__assessmentResultMemoryStore;
}

function getEventMemoryStore(): EventMemoryStore {
  const globalStore = globalThis as typeof globalThis & {
    __adminStatsEventMemoryStore?: EventMemoryStore;
  };

  if (!globalStore.__adminStatsEventMemoryStore) {
    globalStore.__adminStatsEventMemoryStore = new Map();
  }

  return globalStore.__adminStatsEventMemoryStore;
}

export class DrizzleAdminStatsRepository {
  private readonly resultMemoryStore = shouldUseInMemoryStore()
    ? getResultMemoryStore()
    : null;

  private readonly eventMemoryStore = shouldUseInMemoryStore()
    ? getEventMemoryStore()
    : null;

  constructor(private db?: AssessmentDb) {}

  private getDb(): AssessmentDb {
    if (!this.db) {
      this.db = createDb();
    }

    return this.db;
  }

  async getAdminStats(): Promise<AdminStatsDashboardData> {
    const [starts, completions, restartClicks, primaryTypeRows, wingRows] =
      this.resultMemoryStore && this.eventMemoryStore
        ? await Promise.all([
            this.readEventDailyCountsFromMemory(
              ADMIN_STATS_EVENT_TYPES.assessmentStarted,
            ),
            this.readCompletionDailyCountsFromMemory(),
            this.readEventDailyCountsFromMemory(
              ADMIN_STATS_EVENT_TYPES.assessmentRestartClicked,
            ),
            this.readDistributionFromMemory("primary"),
            this.readDistributionFromMemory("wing"),
          ])
        : await Promise.all([
            this.readEventDailyCounts(ADMIN_STATS_EVENT_TYPES.assessmentStarted),
            this.readCompletionDailyCounts(),
            this.readEventDailyCounts(
              ADMIN_STATS_EVENT_TYPES.assessmentRestartClicked,
            ),
            this.readDistribution("primary"),
            this.readDistribution("wing"),
          ]);

    const dailyActivity = mergeDailyActivity(starts, completions, restartClicks);

    return {
      dailyActivity,
      primaryTypeDistribution: buildSuppressedDistribution(
        primaryTypeRows.map((row) => ({
          key: row.key,
          label:
            typeCopyDefinition.entries[
              Number(row.key) as keyof typeof typeCopyDefinition.entries
            ].title,
          count: row.count,
        })),
        ADMIN_STATS_SMALL_CELL_THRESHOLD,
      ),
      wingDistribution: buildSuppressedDistribution(
        wingRows.map((row) => ({
          key: row.key,
          label: `${row.key}번 날개`,
          count: row.count,
        })),
        ADMIN_STATS_SMALL_CELL_THRESHOLD,
      ),
    };
  }

  private async readEventDailyCounts(
    eventType: AdminStatsEventType,
  ): Promise<DailyCountRow[]> {
    const dayBucket = sql<string>`to_char(timezone(${ADMIN_STATS_TIME_ZONE}, ${adminStatsEvents.occurredAt}), 'YYYY-MM-DD')`;

    const rows = await this.getDb()
      .select({
        day: dayBucket,
        count: sql<number>`count(*)::int`,
      })
      .from(adminStatsEvents)
      .where(eq(adminStatsEvents.eventType, eventType))
      .groupBy(dayBucket)
      .orderBy(dayBucket);

    return rows.map((row) => ({
      day: row.day,
      count: Number(row.count),
    }));
  }

  private async readCompletionDailyCounts(): Promise<DailyCountRow[]> {
    const dayBucket = sql<string>`to_char(timezone(${ADMIN_STATS_TIME_ZONE}, ${assessmentResults.createdAt}), 'YYYY-MM-DD')`;

    const rows = await this.getDb()
      .select({
        day: dayBucket,
        count: sql<number>`count(*)::int`,
      })
      .from(assessmentResults)
      .groupBy(dayBucket)
      .orderBy(dayBucket);

    return rows.map((row) => ({
      day: row.day,
      count: Number(row.count),
    }));
  }

  private async readDistribution(
    dimension: "primary" | "wing",
  ): Promise<DistributionRow[]> {
    const column =
      dimension === "primary"
        ? assessmentResults.primaryType
        : assessmentResults.wingType;
    const baseQuery = this.getDb()
      .select({
        key: column,
        count: sql<number>`count(*)::int`,
      })
      .from(assessmentResults);
    const rows = await (dimension === "wing"
      ? baseQuery.where(isNotNull(assessmentResults.wingType))
      : baseQuery)
      .groupBy(column)
      .orderBy(asc(column));

    return rows.flatMap((row) =>
      row.key === null
        ? []
        : [
            {
              key: row.key,
              count: Number(row.count),
            },
          ],
    );
  }

  private async readEventDailyCountsFromMemory(
    eventType: AdminStatsEventType,
  ): Promise<DailyCountRow[]> {
    const grouped = new Map<string, number>();

    for (const event of this.eventMemoryStore?.values() ?? []) {
      if (event.eventType !== eventType) {
        continue;
      }

      const day = toAdminStatsDay(event.occurredAt);
      grouped.set(day, (grouped.get(day) ?? 0) + 1);
    }

    return Array.from(grouped.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([day, count]) => ({ day, count }));
  }

  private async readCompletionDailyCountsFromMemory(): Promise<DailyCountRow[]> {
    const grouped = new Map<string, number>();

    for (const result of this.resultMemoryStore?.values() ?? []) {
      const day = toAdminStatsDay(result.createdAt);
      grouped.set(day, (grouped.get(day) ?? 0) + 1);
    }

    return Array.from(grouped.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([day, count]) => ({ day, count }));
  }

  private async readDistributionFromMemory(
    dimension: "primary" | "wing",
  ): Promise<DistributionRow[]> {
    const grouped = new Map<string, number>();

    for (const result of this.resultMemoryStore?.values() ?? []) {
      const key =
        dimension === "primary" ? result.primaryType : result.wingType;

      if (key === null) {
        continue;
      }

      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    }

    return Array.from(grouped.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, count]) => ({ key, count }));
  }
}

function mergeDailyActivity(
  starts: DailyCountRow[],
  completions: DailyCountRow[],
  restartClicks: DailyCountRow[],
) {
  const dayMap = new Map<
    string,
    {
      starts: number;
      completions: number;
      restartClicks: number;
    }
  >();

  for (const row of starts) {
    const current = dayMap.get(row.day) ?? {
      starts: 0,
      completions: 0,
      restartClicks: 0,
    };

    dayMap.set(row.day, {
      ...current,
      starts: row.count,
    });
  }

  for (const row of completions) {
    const current = dayMap.get(row.day) ?? {
      starts: 0,
      completions: 0,
      restartClicks: 0,
    };

    dayMap.set(row.day, {
      ...current,
      completions: row.count,
    });
  }

  for (const row of restartClicks) {
    const current = dayMap.get(row.day) ?? {
      starts: 0,
      completions: 0,
      restartClicks: 0,
    };

    dayMap.set(row.day, {
      ...current,
      restartClicks: row.count,
    });
  }

  return Array.from(dayMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([day, row]) => ({
      day,
      label: formatAdminStatsDayLabel(day),
      starts: suppressCount(row.starts),
      completions: suppressCount(row.completions),
      restartClicks: suppressCount(row.restartClicks),
    }));
}

function toAdminStatsDay(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: ADMIN_STATS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatAdminStatsDayLabel(day: string) {
  const [year, month, date] = day.split("-").map(Number);

  return `${year}.${month}.${date}`;
}
