import { afterEach, describe, expect, it, vi } from "vitest";

import { assessmentDefinition } from "@/content/assessments";
import type { ForcedChoiceAssessmentQuestion } from "@/domain/assessment/types";
import {
  getSubmitAssessmentRedirectHref,
  submitAssessment,
  type SubmitAssessmentResponse,
} from "@/features/assessment/submit-assessment";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

const questions = assessmentDefinition.questions as readonly ForcedChoiceAssessmentQuestion[];

describe("assessment submit client contract", () => {
  afterEach(() => {
    fetchMock.mockReset();
  });

  it("uses the server-returned public result href for redirects", () => {
    expect(
      getSubmitAssessmentRedirectHref({
        publicResult: {
          href: "/results/public-result-token",
          publicId: "public-result-token",
        },
        result: {
          assessmentVersion: assessmentDefinition.version,
          primaryType: 8,
        },
      }),
    ).toBe("/results/public-result-token");
  });

  it("posts the canonical assessment payload and returns the score-route response", async () => {
    const response: SubmitAssessmentResponse = {
      publicResult: {
        href: "/results/public-result-token",
        publicId: "public-result-token",
      },
      result: {
        assessmentVersion: assessmentDefinition.version,
        primaryType: 8,
      },
    };
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    const payload = await submitAssessment({
      assessmentVersion: assessmentDefinition.version,
      answers: {
        [questions[0]!.id]: "left",
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/assessments/score",
      expect.objectContaining({
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      }),
    );
    expect(payload.publicResult.href).toBe("/results/public-result-token");
  });

  it("surfaces the server error message when submit fails", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            message: "결과를 저장하지 못했어요.",
          },
        }),
        {
          status: 500,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    await expect(
      submitAssessment({
        assessmentVersion: assessmentDefinition.version,
        answers: {},
      }),
    ).rejects.toThrow("결과를 저장하지 못했어요.");
  });
});
