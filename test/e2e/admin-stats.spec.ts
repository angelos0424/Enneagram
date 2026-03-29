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

async function completeAssessmentAndRestart(page: Page) {
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

  const restartResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/api/admin-stats/restart") &&
      response.request().method() === "DELETE" &&
      response.ok(),
  );

  await page.getByRole("button", { name: "검사해보기" }).click();
  await restartResponse;
  await page.waitForURL("/");
}

test.describe("admin stats dashboard", () => {
  test("redirects unauthenticated operators to the admin login page", async ({ page }) => {
    await page.goto("/admin");

    await page.waitForURL("/admin/login");
    await expect(page.getByRole("heading", { name: "통계 화면 로그인" })).toBeVisible();
  });

  test("shows the protected dashboard after a valid admin login", async ({ page }) => {
    await completeAssessmentAndRestart(page);

    await page.goto("/admin");
    await page.waitForURL("/admin/login");
    await page.getByLabel("관리자 비밀번호").fill("correct horse battery staple");
    await page.getByRole("button", { name: "관리자 로그인" }).click();

    await page.waitForURL("/admin");
    await expect(page.getByRole("heading", { name: "관리자 운영 통계" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "일별 검사 흐름" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "주 유형 분포" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "날개 분포" })).toBeVisible();
    await expect(page.getByText("소표본 보호 적용 중")).toBeVisible();
    await expect(page.getByText("정확한 합계는 숨김 처리됨").first()).toBeVisible();
  });
});
