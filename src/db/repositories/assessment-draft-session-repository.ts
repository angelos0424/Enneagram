import { eq } from "drizzle-orm";

import { createDb, type AssessmentDb } from "@/db/client";
import {
  assessmentDraftSessions,
  type AssessmentDraftSessionInsert,
  type AssessmentDraftSessionRecord,
} from "@/db/schema";
import type { AssessmentDraftSessionSnapshot } from "@/features/assessment/types";

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
  constructor(private readonly db: AssessmentDb = createDb()) {}

  async createDraftSession(
    session: CreateAssessmentDraftSessionInput,
  ): Promise<AssessmentDraftSessionRecord> {
    const values: AssessmentDraftSessionInsert = {
      sessionToken: session.sessionToken,
      assessmentVersion: session.assessmentVersion,
      draftAnswers: session.answers,
      draftProgress: session.progress,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
    const [createdSession] = await this.db
      .insert(assessmentDraftSessions)
      .values(values)
      .returning();

    return createdSession;
  }

  async findBySessionToken(sessionToken: string): Promise<AssessmentDraftSessionRecord | null> {
    const [draftSession] = await this.db
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
    const [updatedSession] = await this.db
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
    await this.db
      .delete(assessmentDraftSessions)
      .where(eq(assessmentDraftSessions.sessionToken, sessionToken));
  }
}
