import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { assessmentDefinition } from "@/content/assessments";

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
  test("exposes server metadata for share previews without dropping privacy defaults", async ({
    page,
  }) => {
    const resultUrl = await completeAssessmentAndOpenResult(page);
    const resultPathname = new URL(resultUrl).pathname;

    await page.goto(resultUrl);

    await expect(page.locator("meta[name='robots']")).toHaveAttribute(
      "content",
      /noindex/i,
    );
    await expect(page.locator("meta[property='og:type']")).toHaveAttribute(
      "content",
      "website",
    );
    const openGraphUrl = await page
      .locator("meta[property='og:url']")
      .getAttribute("content");
    const openGraphImageUrl = await page
      .locator("meta[property='og:image']")
      .getAttribute("content");

    expect(openGraphUrl).not.toBeNull();
    expect(openGraphImageUrl).not.toBeNull();
    expect(() => new URL(openGraphUrl ?? "")).not.toThrow();
    expect(() => new URL(openGraphImageUrl ?? "")).not.toThrow();
    expect(new URL(openGraphUrl ?? "").pathname).toBe(resultPathname);
    expect(new URL(openGraphImageUrl ?? "").pathname).toBe(
      `${resultPathname}/opengraph-image`,
    );
    await expect(page.locator("meta[name='twitter:card']")).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  });

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

  test("returns shared-result visitors to a fresh assessment", async ({ page }) => {
    await completeAssessmentAndOpenResult(page);
    const restartResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/admin-stats/restart") &&
        response.request().method() === "DELETE" &&
        response.ok(),
    );

    await page.getByRole("button", { name: "검사해보기" }).click();
    await restartResponse;
    await page.waitForURL("/");
    await expect(
      page.getByText(`0 / ${assessmentDefinition.questions.length}`, { exact: true }).last(),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "결과 만들기" })).toBeDisabled();
  });
});
