import { cookies } from "next/headers";
import { ZodError } from "zod";

import { DrizzleAssessmentDraftSessionRepository } from "@/db/repositories/assessment-draft-session-repository";
import { assessmentDraftSessionUpdateSchema } from "@/domain/assessment/draft-schema";
import {
  ASSESSMENT_DRAFT_SESSION_COOKIE,
  readAssessmentDraftSessionToken,
} from "@/domain/assessment/draft-session";
import type { AssessmentDraftSessionSnapshot } from "@/features/assessment/types";

function toSnapshot(session: {
  assessmentVersion: string;
  draftAnswers: AssessmentDraftSessionSnapshot["answers"];
  draftProgress: AssessmentDraftSessionSnapshot["progress"];
}): AssessmentDraftSessionSnapshot {
  return {
    assessmentVersion: session.assessmentVersion,
    answers: session.draftAnswers,
    progress: session.draftProgress,
  };
}

export async function PATCH(request: Request) {
  try {
    const payload = assessmentDraftSessionUpdateSchema.parse(await request.json());
    const cookieStore = await cookies();
    const sessionToken = readAssessmentDraftSessionToken(
      cookieStore.get(ASSESSMENT_DRAFT_SESSION_COOKIE.name)?.value,
    );

    if (!sessionToken) {
      return Response.json(
        {
          error: {
            code: "ASSESSMENT_SESSION_NOT_FOUND",
            message: "No anonymous assessment draft session was found.",
          },
        },
        { status: 404 },
      );
    }

    const repository = new DrizzleAssessmentDraftSessionRepository();
    const existingSession = await repository.findBySessionToken(sessionToken);

    if (!existingSession) {
      return Response.json(
        {
          error: {
            code: "ASSESSMENT_SESSION_NOT_FOUND",
            message: "No anonymous assessment draft session was found.",
          },
        },
        { status: 404 },
      );
    }

    if (payload.assessmentVersion !== existingSession.assessmentVersion) {
      return Response.json(
        {
          error: {
            code: "ASSESSMENT_VERSION_MISMATCH",
            message:
              "Draft payload assessment version does not match the canonical session.",
          },
        },
        { status: 409 },
      );
    }

    const updatedSession = await repository.updateDraftSession(sessionToken, {
      answers: payload.answers,
      progress: payload.progress,
      updatedAt: new Date(),
    });

    if (!updatedSession) {
      return Response.json(
        {
          error: {
            code: "ASSESSMENT_SESSION_NOT_FOUND",
            message: "No anonymous assessment draft session was found.",
          },
        },
        { status: 404 },
      );
    }

    return Response.json(
      {
        session: toSnapshot(updatedSession),
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json(
        {
          error: {
            code: "INVALID_PAYLOAD_SHAPE",
            message: "Request body must match the assessment draft update schema.",
          },
        },
        { status: 400 },
      );
    }

    throw error;
  }
}
