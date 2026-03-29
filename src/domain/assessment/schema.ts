import { z } from "zod";

export const assessmentAnswerSchema = z.object({
  questionId: z.string().min(1),
  value: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
});

export const assessmentSubmissionSchema = z.object({
  assessmentVersion: z.string().min(1),
  answers: z.array(assessmentAnswerSchema),
});

export type AssessmentSubmission = z.infer<typeof assessmentSubmissionSchema>;
