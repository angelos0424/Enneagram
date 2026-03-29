import { eq } from "drizzle-orm";

import { createDb, type AssessmentDb } from "@/db/client";
import {
  assessmentResults,
  type AssessmentResultInsert,
  type AssessmentResultRecord,
} from "@/db/schema";
import type { AssessmentResultSnapshotDraft } from "@/domain/assessment/result-snapshot";

export interface AssessmentResultRepository {
  save(snapshot: AssessmentResultSnapshotDraft): Promise<AssessmentResultRecord>;
  findById(id: string): Promise<AssessmentResultRecord | null>;
}

export class DrizzleAssessmentResultRepository
  implements AssessmentResultRepository
{
  constructor(private readonly db: AssessmentDb = createDb()) {}

  async save(
    snapshot: AssessmentResultSnapshotDraft,
  ): Promise<AssessmentResultRecord> {
    const values: AssessmentResultInsert = {
      ...snapshot,
      primaryType: String(snapshot.primaryType),
      wingType: String(snapshot.wingType),
      growthType: String(snapshot.growthType),
      stressType: String(snapshot.stressType),
    };
    const [savedResult] = await this.db
      .insert(assessmentResults)
      .values(values)
      .returning();

    return savedResult;
  }

  async findById(id: string): Promise<AssessmentResultRecord | null> {
    const [savedResult] = await this.db
      .select()
      .from(assessmentResults)
      .where(eq(assessmentResults.id, id))
      .limit(1);

    return savedResult ?? null;
  }
}
