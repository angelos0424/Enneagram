import { eq } from "drizzle-orm";

import { createDb, type AssessmentDb } from "@/db/client";
import {
  assessmentResults,
  type AssessmentResultInsert,
  type AssessmentResultRecord,
} from "@/db/schema";
import type { AssessmentResultSnapshotDraft } from "@/domain/assessment/result-snapshot";

type ResultMemoryStore = Map<string, AssessmentResultRecord>;

function getResultMemoryStore(): ResultMemoryStore {
  const globalStore = globalThis as typeof globalThis & {
    __assessmentResultMemoryStore?: ResultMemoryStore;
  };

  if (!globalStore.__assessmentResultMemoryStore) {
    globalStore.__assessmentResultMemoryStore = new Map();
  }

  return globalStore.__assessmentResultMemoryStore;
}

export interface AssessmentResultRepository {
  save(snapshot: AssessmentResultSnapshotDraft): Promise<AssessmentResultRecord>;
  findById(id: string): Promise<AssessmentResultRecord | null>;
  findByPublicId(publicId: string): Promise<AssessmentResultRecord | null>;
}

export class DrizzleAssessmentResultRepository
  implements AssessmentResultRepository
{
  private readonly memoryStore =
    process.env.USE_IN_MEMORY_ASSESSMENT_RESULTS === "true"
      ? getResultMemoryStore()
      : null;

  constructor(private db?: AssessmentDb) {}

  private getDb(): AssessmentDb {
    if (!this.db) {
      this.db = createDb();
    }

    return this.db;
  }

  async save(
    snapshot: AssessmentResultSnapshotDraft,
  ): Promise<AssessmentResultRecord> {
    const values = toAssessmentResultInsert(snapshot);

    if (this.memoryStore) {
      const savedResult = toAssessmentResultRecord(values);

      this.memoryStore.set(savedResult.id, savedResult);

      return savedResult;
    }

    const [savedResult] = await this.getDb()
      .insert(assessmentResults)
      .values(values)
      .returning();

    return savedResult;
  }

  async findById(id: string): Promise<AssessmentResultRecord | null> {
    if (this.memoryStore) {
      return this.memoryStore.get(id) ?? null;
    }

    const [savedResult] = await this.getDb()
      .select()
      .from(assessmentResults)
      .where(eq(assessmentResults.id, id))
      .limit(1);

    return savedResult ?? null;
  }

  async findByPublicId(publicId: string): Promise<AssessmentResultRecord | null> {
    if (this.memoryStore) {
      for (const record of this.memoryStore.values()) {
        if (record.publicId === publicId) {
          return record;
        }
      }

      return null;
    }

    const [savedResult] = await this.getDb()
      .select()
      .from(assessmentResults)
      .where(eq(assessmentResults.publicId, publicId))
      .limit(1);

    return savedResult ?? null;
  }
}

function toAssessmentResultInsert(
  snapshot: AssessmentResultSnapshotDraft,
): AssessmentResultInsert {
  return {
      ...snapshot,
      primaryType: String(snapshot.primaryType),
      wingType: String(snapshot.wingType),
      growthType: String(snapshot.growthType),
      stressType: String(snapshot.stressType),
    };
}

function toAssessmentResultRecord(
  snapshot: AssessmentResultInsert,
): AssessmentResultRecord {
  return {
    id: `memory-${snapshot.publicId}`,
    publicId: snapshot.publicId,
    adminToken: snapshot.adminToken,
    assessmentVersion: snapshot.assessmentVersion,
    scoringVersion: snapshot.scoringVersion,
    copyVersion: snapshot.copyVersion,
    primaryType: snapshot.primaryType,
    wingType: snapshot.wingType,
    growthType: snapshot.growthType,
    stressType: snapshot.stressType,
    rawScores: snapshot.rawScores,
    normalizedScores: snapshot.normalizedScores,
    nearbyTypes: snapshot.nearbyTypes,
    answers: snapshot.answers,
    createdAt: snapshot.createdAt,
  };
}
