import { z } from "zod";

import { assessmentAnswerSchema } from "@/domain/assessment/schema";

const assessmentDraftAnswerValueSchema = assessmentAnswerSchema.shape.value;

export const assessmentDraftProgressSchema = z.object({
  answeredCount: z.number().int().min(0),
  totalQuestions: z.number().int().min(1),
  currentQuestionId: z.string().min(1).nullable(),
  isComplete: z.boolean(),
});

export const assessmentDraftAnswersSchema = z.record(
  z.string().min(1),
  assessmentDraftAnswerValueSchema,
);

export const assessmentDraftSessionBootstrapSchema = z.object({
  assessmentVersion: z.string().min(1),
});

export const assessmentDraftSessionSnapshotSchema = z.object({
  assessmentVersion: z.string().min(1),
  answers: assessmentDraftAnswersSchema,
  progress: assessmentDraftProgressSchema,
});

export const assessmentDraftSessionUpdateSchema =
  assessmentDraftSessionSnapshotSchema;

export type AssessmentDraftSessionBootstrap = z.infer<
  typeof assessmentDraftSessionBootstrapSchema
>;
export type AssessmentDraftSessionSnapshot = z.infer<
  typeof assessmentDraftSessionSnapshotSchema
>;
