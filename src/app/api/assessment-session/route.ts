import { cookies } from "next/headers";
import { ZodError } from "zod";

import { assessmentDefinition } from "@/content/assessments/ko/v1";
import { DrizzleAssessmentDraftSessionRepository } from "@/db/repositories/assessment-draft-session-repository";
import { assessmentDraftSessionBootstrapSchema } from "@/domain/assessment/draft-schema";
import {
  ASSESSMENT_DRAFT_SESSION_COOKIE,
  createAssessmentDraftSessionToken,
  readAssessmentDraftSessionTokenFromCookieStore,
} from "@/domain/assessment/draft-session";
import type { AssessmentDraftSessionSnapshot } from "@/features/assessment/types";

function buildEmptyDraftSession(): AssessmentDraftSessionSnapshot {
  return {
    assessmentVersion: assessmentDefinition.version,
    answers: {},
    progress: {
      answeredCount: 0,
      totalQuestions: assessmentDefinition.questions.length,
      currentQuestionId: assessmentDefinition.questions[0]?.id ?? null,
      isComplete: false,
    },
  };
}

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

async function readCanonicalDraft() {
  const cookieStore = await cookies();
  const sessionToken = readAssessmentDraftSessionTokenFromCookieStore(cookieStore);

  if (!sessionToken) {
    return null;
  }

  const repository = new DrizzleAssessmentDraftSessionRepository();
  const session = await repository.findBySessionToken(sessionToken);

  if (!session) {
    return null;
  }

  return {
    session,
    sessionToken,
  };
}

export async function GET(_request: Request) {
  const draft = await readCanonicalDraft();

  if (!draft) {
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
      session: toSnapshot(draft.session),
    },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  try {
    const payload = assessmentDraftSessionBootstrapSchema.parse(await request.json());

    if (payload.assessmentVersion !== assessmentDefinition.version) {
      return Response.json(
        {
          error: {
            code: "ASSESSMENT_VERSION_MISMATCH",
            message: "Assessment version does not match the active assessment definition.",
          },
        },
        { status: 409 },
      );
    }

    const existingDraft = await readCanonicalDraft();

    if (existingDraft) {
      return Response.json(
        {
          session: toSnapshot(existingDraft.session),
        },
        { status: 200 },
      );
    }

    const repository = new DrizzleAssessmentDraftSessionRepository();
    const sessionToken = createAssessmentDraftSessionToken();
    const session = buildEmptyDraftSession();
    const now = new Date();

    await repository.createDraftSession({
      sessionToken,
      ...session,
      createdAt: now,
      updatedAt: now,
    });

    const cookieStore = await cookies();
    cookieStore.set(
      ASSESSMENT_DRAFT_SESSION_COOKIE.name,
      sessionToken,
      ASSESSMENT_DRAFT_SESSION_COOKIE.options,
    );

    return Response.json(
      {
        session,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json(
        {
          error: {
            code: "INVALID_PAYLOAD_SHAPE",
            message: "Request body must match the assessment session bootstrap schema.",
          },
        },
        { status: 400 },
      );
    }

    throw error;
  }
}
