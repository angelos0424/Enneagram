import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

import type { AssessmentResultSnapshotDraft } from "@/domain/assessment/result-snapshot";

export const assessmentResults = pgTable("assessment_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  assessmentVersion: text("assessment_version").notNull(),
  scoringVersion: text("scoring_version").notNull(),
  copyVersion: text("copy_version").notNull(),
  primaryType: text("primary_type").notNull(),
  wingType: text("wing_type").notNull(),
  growthType: text("growth_type").notNull(),
  stressType: text("stress_type").notNull(),
  rawScores: jsonb("raw_scores")
    .$type<AssessmentResultSnapshotDraft["rawScores"]>()
    .notNull(),
  normalizedScores: jsonb("normalized_scores")
    .$type<AssessmentResultSnapshotDraft["normalizedScores"]>()
    .notNull(),
  nearbyTypes: jsonb("nearby_types")
    .$type<AssessmentResultSnapshotDraft["nearbyTypes"]>()
    .notNull(),
  answers: jsonb("answers").$type<AssessmentResultSnapshotDraft["answers"]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

export type AssessmentResultRecord = typeof assessmentResults.$inferSelect;
export type AssessmentResultInsert = typeof assessmentResults.$inferInsert;
