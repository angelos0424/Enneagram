import { asc } from "drizzle-orm";

import { createDb, type AssessmentDb } from "@/db/client";
import {
  adminStatsEvents,
  type AdminStatsEventInsert,
  type AdminStatsEventRecord,
} from "@/db/schema";

export const ADMIN_STATS_EVENT_TYPES = {
  assessmentStarted: "assessment_started",
  assessmentRestartClicked: "assessment_restart_clicked",
} as const;

export type AdminStatsEventType =
  (typeof ADMIN_STATS_EVENT_TYPES)[keyof typeof ADMIN_STATS_EVENT_TYPES];

export type RecordAdminStatsEventInput = {
  eventType: AdminStatsEventType;
  occurredAt: Date;
};

type AdminStatsEventMemoryStore = Map<string, AdminStatsEventRecord>;

function getAdminStatsEventMemoryStore(): AdminStatsEventMemoryStore {
  const globalStore = globalThis as typeof globalThis & {
    __adminStatsEventMemoryStore?: AdminStatsEventMemoryStore;
  };

  if (!globalStore.__adminStatsEventMemoryStore) {
    globalStore.__adminStatsEventMemoryStore = new Map();
  }

  return globalStore.__adminStatsEventMemoryStore;
}

function shouldUseInMemoryStore() {
  return (
    process.env.USE_IN_MEMORY_ASSESSMENT_DRAFTS === "true" ||
    process.env.USE_IN_MEMORY_ASSESSMENT_RESULTS === "true"
  );
}

export interface AdminStatsEventRepository {
  recordEvent(input: RecordAdminStatsEventInput): Promise<AdminStatsEventRecord>;
  listEvents(): Promise<AdminStatsEventRecord[]>;
}

export class DrizzleAdminStatsEventRepository
  implements AdminStatsEventRepository
{
  private readonly memoryStore = shouldUseInMemoryStore()
    ? getAdminStatsEventMemoryStore()
    : null;

  constructor(private db?: AssessmentDb) {}

  private getDb(): AssessmentDb {
    if (!this.db) {
      this.db = createDb();
    }

    return this.db;
  }

  async recordEvent(
    input: RecordAdminStatsEventInput,
  ): Promise<AdminStatsEventRecord> {
    const values: AdminStatsEventInsert = {
      eventType: input.eventType,
      occurredAt: input.occurredAt,
    };

    if (this.memoryStore) {
      const record = toAdminStatsEventRecord(values);

      this.memoryStore.set(record.id, record);

      return record;
    }

    const [record] = await this.getDb()
      .insert(adminStatsEvents)
      .values(values)
      .returning();

    return record;
  }

  async listEvents(): Promise<AdminStatsEventRecord[]> {
    if (this.memoryStore) {
      return Array.from(this.memoryStore.values()).sort((left, right) =>
        left.occurredAt.getTime() - right.occurredAt.getTime(),
      );
    }

    return this.getDb()
      .select()
      .from(adminStatsEvents)
      .orderBy(asc(adminStatsEvents.occurredAt), asc(adminStatsEvents.id));
  }
}

function toAdminStatsEventRecord(
  values: AdminStatsEventInsert,
): AdminStatsEventRecord {
  return {
    id: `memory-${values.eventType}-${values.occurredAt.toISOString()}`,
    eventType: values.eventType,
    occurredAt: values.occurredAt,
  };
}
