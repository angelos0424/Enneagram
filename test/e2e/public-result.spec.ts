import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { assessmentDefinition } from "@/content/assessments/ko/v1";

async function gotoAssessment(page: Page) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.goto("/");
      return;
    } catch (error) {
      if (
        attempt === 1 ||
        !(error instanceof Error) ||
        !error.message.includes("net::ERR_ABORTED")
      ) {
        throw error;
      }
    }
  }
}

async function completeAssessmentAndOpenResult(page: Page) {
  await gotoAssessment(page);

  for (let index = 0; index < assessmentDefinition.questions.length; index += 1) {
    const saveDraftResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/assessment-session/draft") &&
        response.request().method() === "PATCH" &&
        response.ok(),
    );

    await page.getByRole("button", { name: /5\s*매우 잘 맞는다/ }).click();
    await saveDraftResponse;
  }

  const submitResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/api/assessments/score") &&
      response.request().method() === "POST" &&
      response.ok(),
  );

  await page.getByRole("button", { name: "결과 만들기" }).click();
  await submitResponse;
  await page.waitForURL(/\/results\/[A-Za-z]+$/);

  return page.url();
}

test.describe("public result page", () => {
  test("shares or copies the public result link", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", {
        value: undefined,
        configurable: true,
      });

      const copiedState = { value: "" };
      Object.defineProperty(window, "__copiedResultUrl", {
        value: copiedState,
        configurable: true,
      });
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: async (text: string) => {
            copiedState.value = text;
          },
        },
        configurable: true,
      });
    });

    const resultUrl = await completeAssessmentAndOpenResult(page);

    await page.goto(resultUrl);
    await expect(page.getByRole("button", { name: "결과 공유하기" })).toBeVisible();
    await page.getByRole("button", { name: "결과 공유하기" }).click();
    await expect(page.getByRole("status")).toHaveText("링크를 복사했어요.");
    await expect
      .poll(async () =>
        page.evaluate(
          () =>
            (window as typeof window & {
              __copiedResultUrl?: { value: string };
            }).__copiedResultUrl?.value ?? "",
        ),
      )
      .toBe(resultUrl);
  });
});
