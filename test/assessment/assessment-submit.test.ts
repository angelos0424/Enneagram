import { describe, expect, it } from "vitest";

import { getSubmitAssessmentRedirectHref } from "@/features/assessment/submit-assessment";

describe("assessment submit client contract", () => {
  it("uses the server-returned public result href for redirects", () => {
    expect(
      getSubmitAssessmentRedirectHref({
        publicResult: {
          href: "/results/public-result-token",
        },
      }),
    ).toBe("/results/public-result-token");
  });
});
