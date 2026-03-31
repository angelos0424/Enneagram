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

test.describe("mobile assessment flow", () => {
  test("shows the anonymous mobile entry surface", async ({ page }) => {
    await gotoAssessment(page);

    await expect(
      page.getByText(`0 / ${assessmentDefinition.questions.length}`, { exact: true }).last(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: assessmentDefinition.questions[0]!.prompt,
      }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "결과 만들기" })).toBeDisabled();
  });

  test("restores draft after refresh", async ({ page }) => {
    await gotoAssessment(page);

    const saveDraftResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/assessment-session/draft") &&
        response.request().method() === "PATCH" &&
        response.ok(),
    );

    const strongestAgreeButton = page.getByRole("button", { name: /5\s*매우 잘 맞는다/ });

    await expect(strongestAgreeButton).toBeEnabled();
    await strongestAgreeButton.click();
    await saveDraftResponse;
    await expect(
      page.getByText(`1 / ${assessmentDefinition.questions.length}`, { exact: true }).last(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: assessmentDefinition.questions[0]!.prompt,
      }),
    ).toBeVisible();
    await expect(page.getByText("5점 선택")).toBeVisible();

    await page.reload();

    await expect(
      page.getByText(`1 / ${assessmentDefinition.questions.length}`, { exact: true }).last(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: assessmentDefinition.questions[0]!.prompt,
      }),
    ).toBeVisible();
    await expect(page.getByText("5점 선택")).toBeVisible();

    const moveNextResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/assessment-session/draft") &&
        response.request().method() === "PATCH" &&
        response.ok(),
    );
    await page.getByRole("button", { name: "다음 문항" }).click();
    await moveNextResponse;
    await expect(
      page.getByRole("heading", {
        name: assessmentDefinition.questions[1]!.prompt,
      }),
    ).toBeVisible();

    await page.reload();

    await expect(
      page.getByRole("heading", {
        name: assessmentDefinition.questions[1]!.prompt,
      }),
    ).toBeVisible();
  });

  test("redirects to the saved public result page after submit", async ({ page }) => {
    await gotoAssessment(page);

    for (let index = 0; index < assessmentDefinition.questions.length; index += 1) {
      const saveDraftResponse = page.waitForResponse(
        (response) =>
          response.url().includes("/api/assessment-session/draft") &&
          response.request().method() === "PATCH" &&
          response.ok(),
      );
      const strongestAgreeButton = page.getByRole("button", {
        name: /5\s*매우 잘 맞는다/,
      });

      await expect(strongestAgreeButton).toBeEnabled();
      await strongestAgreeButton.click();
      await saveDraftResponse;

      if (index < assessmentDefinition.questions.length - 1) {
        const moveNextResponse = page.waitForResponse(
          (response) =>
            response.url().includes("/api/assessment-session/draft") &&
            response.request().method() === "PATCH" &&
            response.ok(),
        );

        await page.getByRole("button", { name: "다음 문항" }).click();
        await moveNextResponse;
      }
    }

    const submitResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/assessments/score") &&
        response.request().method() === "POST" &&
        response.ok(),
    );

    await expect(page.getByRole("button", { name: "결과 만들기" })).toBeEnabled();
    await page.getByRole("button", { name: "결과 만들기" }).click();
    await submitResponse;
    await page.waitForURL(/\/results\/[A-Za-z]+$/);
    await expect(page).toHaveURL(/\/results\/[A-Za-z]+$/);

    await gotoAssessment(page);
    await expect(
      page.getByText(`0 / ${assessmentDefinition.questions.length}`, { exact: true }).last(),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "결과 만들기" })).toBeDisabled();
  });
});
