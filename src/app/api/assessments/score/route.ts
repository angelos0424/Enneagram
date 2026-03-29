import { ZodError } from "zod";

import { DrizzleAssessmentResultRepository } from "@/db/repositories/assessment-result-repository";
import { buildAssessmentResultSnapshot } from "@/domain/assessment/result-snapshot";
import { assessmentSubmissionSchema } from "@/domain/assessment/schema";
import {
  AssessmentScoringError,
  scoreAssessment,
} from "@/domain/assessment/scoring";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const submission = assessmentSubmissionSchema.parse(payload);
    const result = scoreAssessment(submission);
    const repository = new DrizzleAssessmentResultRepository();
    const savedResult = await repository.save(
      buildAssessmentResultSnapshot(result, submission.answers),
    );

    return Response.json(
      {
        result,
        publicResult: {
          publicId: savedResult.publicId,
          href: `/results/${savedResult.publicId}`,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json(
        {
          error: {
            code: "INVALID_PAYLOAD_SHAPE",
            message:
              "Request body must match the assessment submission schema.",
          },
        },
        { status: 400 },
      );
    }

    if (error instanceof AssessmentScoringError) {
      return Response.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 400 },
      );
    }

    throw error;
  }
}
