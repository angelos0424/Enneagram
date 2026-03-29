import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

import type { AssessmentDraftSessionSnapshot } from "@/features/assessment/types";
import type { AssessmentResultSnapshotDraft } from "@/domain/assessment/result-snapshot";

export const assessmentResults = pgTable("assessment_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicId: text("public_id").notNull().unique(),
  adminToken: text("admin_token").notNull().unique(),
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

export const assessmentDraftSessions = pgTable("assessment_draft_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  assessmentVersion: text("assessment_version").notNull(),
  draftAnswers: jsonb("draft_answers")
    .$type<AssessmentDraftSessionSnapshot["answers"]>()
    .notNull(),
  draftProgress: jsonb("draft_progress")
    .$type<AssessmentDraftSessionSnapshot["progress"]>()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
});

export type AssessmentResultRecord = typeof assessmentResults.$inferSelect;
export type AssessmentResultInsert = typeof assessmentResults.$inferInsert;
export type AssessmentDraftSessionRecord = typeof assessmentDraftSessions.$inferSelect;
export type AssessmentDraftSessionInsert = typeof assessmentDraftSessions.$inferInsert;
