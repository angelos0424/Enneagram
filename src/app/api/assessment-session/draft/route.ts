import { cookies } from "next/headers";
import { ZodError } from "zod";

import { DrizzleAssessmentDraftSessionRepository } from "@/db/repositories/assessment-draft-session-repository";
import { assessmentDraftSessionUpdateSchema } from "@/domain/assessment/draft-schema";
import { readAssessmentDraftSessionTokenFromCookieStore } from "@/domain/assessment/draft-session";

export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    const sessionUpdate = assessmentDraftSessionUpdateSchema.parse(payload);
    const cookieStore = await cookies();
    const sessionToken = readAssessmentDraftSessionTokenFromCookieStore(cookieStore);

    if (!sessionToken) {
      return buildMissingSessionResponse();
    }

    const repository = new DrizzleAssessmentDraftSessionRepository();
    const existingSession = await repository.findBySessionToken(sessionToken);

    if (!existingSession) {
      return buildMissingSessionResponse();
    }

    if (existingSession.assessmentVersion !== sessionUpdate.assessmentVersion) {
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
      answers: sessionUpdate.answers,
      progress: sessionUpdate.progress,
      updatedAt: new Date(),
    });

    if (!updatedSession) {
      return buildMissingSessionResponse();
    }

    return Response.json(
      {
        session: sessionUpdate,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json(
        {
          error: {
            code: "INVALID_PAYLOAD_SHAPE",
            message: "Assessment draft update payload is invalid.",
          },
        },
        { status: 400 },
      );
    }

    throw error;
  }
}

function buildMissingSessionResponse() {
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
