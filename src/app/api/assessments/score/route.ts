import { ZodError } from "zod";

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

    return Response.json({ result }, { status: 200 });
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
