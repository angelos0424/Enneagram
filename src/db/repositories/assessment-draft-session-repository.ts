import { eq } from "drizzle-orm";

import { createDb, type AssessmentDb } from "@/db/client";
import {
  assessmentDraftSessions,
  type AssessmentDraftSessionInsert,
  type AssessmentDraftSessionRecord,
} from "@/db/schema";
import type { AssessmentDraftSessionSnapshot } from "@/features/assessment/types";

type DraftSessionMemoryStore = Map<string, AssessmentDraftSessionRecord>;

function getDraftSessionMemoryStore(): DraftSessionMemoryStore {
  const globalStore = globalThis as typeof globalThis & {
    __assessmentDraftSessionMemoryStore?: DraftSessionMemoryStore;
  };

  if (!globalStore.__assessmentDraftSessionMemoryStore) {
    globalStore.__assessmentDraftSessionMemoryStore = new Map();
  }

  return globalStore.__assessmentDraftSessionMemoryStore;
}

export type CreateAssessmentDraftSessionInput = AssessmentDraftSessionSnapshot & {
  sessionToken: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateAssessmentDraftSessionInput = {
  answers: AssessmentDraftSessionSnapshot["answers"];
  progress: AssessmentDraftSessionSnapshot["progress"];
  updatedAt: Date;
};

export interface AssessmentDraftSessionRepository {
  createDraftSession(
    session: CreateAssessmentDraftSessionInput,
  ): Promise<AssessmentDraftSessionRecord>;
  findBySessionToken(sessionToken: string): Promise<AssessmentDraftSessionRecord | null>;
  updateDraftSession(
    sessionToken: string,
    session: UpdateAssessmentDraftSessionInput,
  ): Promise<AssessmentDraftSessionRecord | null>;
  deleteDraftSession(sessionToken: string): Promise<void>;
}

export class DrizzleAssessmentDraftSessionRepository
  implements AssessmentDraftSessionRepository
{
  private readonly memoryStore =
    process.env.USE_IN_MEMORY_ASSESSMENT_DRAFTS === "true"
      ? getDraftSessionMemoryStore()
      : null;

  constructor(private db?: AssessmentDb) {}

  private getDb(): AssessmentDb {
    if (!this.db) {
      this.db = createDb();
    }

    return this.db;
  }

  async createDraftSession(
    session: CreateAssessmentDraftSessionInput,
  ): Promise<AssessmentDraftSessionRecord> {
    const values = toAssessmentDraftSessionInsert(session);

    if (this.memoryStore) {
      const createdSession = toAssessmentDraftSessionRecord(values);

      this.memoryStore.set(session.sessionToken, createdSession);

      return createdSession;
    }

    const [createdSession] = await this.getDb().insert(assessmentDraftSessions).values(values).returning();

    return createdSession;
  }

  async findBySessionToken(sessionToken: string): Promise<AssessmentDraftSessionRecord | null> {
    if (this.memoryStore) {
      return this.memoryStore.get(sessionToken) ?? null;
    }

    const [draftSession] = await this.getDb()
      .select()
      .from(assessmentDraftSessions)
      .where(eq(assessmentDraftSessions.sessionToken, sessionToken))
      .limit(1);

    return draftSession ?? null;
  }

  async updateDraftSession(
    sessionToken: string,
    session: UpdateAssessmentDraftSessionInput,
  ): Promise<AssessmentDraftSessionRecord | null> {
    if (this.memoryStore) {
      const current = this.memoryStore.get(sessionToken);

      if (!current) {
        return null;
      }

      const updatedSession: AssessmentDraftSessionRecord = {
        ...current,
        draftAnswers: session.answers,
        draftProgress: session.progress,
        updatedAt: session.updatedAt,
      };

      this.memoryStore.set(sessionToken, updatedSession);

      return updatedSession;
    }

    const [updatedSession] = await this.getDb()
      .update(assessmentDraftSessions)
      .set({
        draftAnswers: session.answers,
        draftProgress: session.progress,
        updatedAt: session.updatedAt,
      })
      .where(eq(assessmentDraftSessions.sessionToken, sessionToken))
      .returning();

    return updatedSession ?? null;
  }

  async deleteDraftSession(sessionToken: string): Promise<void> {
    if (this.memoryStore) {
      this.memoryStore.delete(sessionToken);
      return;
    }

    await this.getDb()
      .delete(assessmentDraftSessions)
      .where(eq(assessmentDraftSessions.sessionToken, sessionToken));
  }
}

function toAssessmentDraftSessionInsert(
  session: CreateAssessmentDraftSessionInput,
): AssessmentDraftSessionInsert {
  return {
    sessionToken: session.sessionToken,
    assessmentVersion: session.assessmentVersion,
    draftAnswers: session.answers,
    draftProgress: session.progress,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

function toAssessmentDraftSessionRecord(
  session: AssessmentDraftSessionInsert,
): AssessmentDraftSessionRecord {
  return {
    id: `memory-${session.sessionToken}`,
    sessionToken: session.sessionToken,
    assessmentVersion: session.assessmentVersion,
    draftAnswers: session.draftAnswers,
    draftProgress: session.draftProgress,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}
