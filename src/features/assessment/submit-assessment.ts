import { toSubmissionAnswers } from "./assessment-flow";
import type { AssessmentDraft } from "./types";

type AssessmentSubmitErrorResponse = {
  error?: {
    message?: string;
  };
};

export type SubmitAssessmentResponse = {
  publicResult: {
    href: string;
    publicId: string;
  };
  result: {
    assessmentVersion: string;
    primaryType: number;
  };
};

export async function submitAssessment(
  draft: AssessmentDraft,
): Promise<SubmitAssessmentResponse> {
  const response = await fetch("/api/assessments/score", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      assessmentVersion: draft.assessmentVersion,
      answers: toSubmissionAnswers(draft.answers),
    }),
  });

  if (!response.ok) {
    throw new Error(await readSubmitErrorMessage(response));
  }

  return (await response.json()) as SubmitAssessmentResponse;
}

export function getSubmitAssessmentRedirectHref(
  response: SubmitAssessmentResponse,
): string {
  return response.publicResult.href;
}

async function readSubmitErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as AssessmentSubmitErrorResponse;

    return (
      payload.error?.message ??
      "결과를 만들지 못했어요. 잠시 후 다시 시도해 주세요."
    );
  } catch {
    return "결과를 만들지 못했어요. 잠시 후 다시 시도해 주세요.";
  }
}
