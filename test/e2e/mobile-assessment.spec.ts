import { expect, test } from "@playwright/test";

test.describe("mobile assessment flow", () => {
  test("shows the anonymous mobile entry surface", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "지금 바로 에니어그램 검사를 시작해보세요." }),
    ).toBeVisible();
    await expect(page.getByText("Anonymous Enneagram")).toBeVisible();
    await expect(page.getByRole("button", { name: "결과 만들기" })).toBeDisabled();
  });

  test("restores draft after refresh", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "지금 바로 에니어그램 검사를 시작해보세요." }),
    ).toBeVisible();

    const saveDraftResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/assessment-session/draft") &&
        response.request().method() === "PATCH" &&
        response.ok(),
    );

    await page.getByRole("button", { name: /5\s*매우 잘 맞는다/ }).click();
    await saveDraftResponse;
    await expect(page.getByText("1 / 18", { exact: true }).last()).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "나는 해야 할 일을 제대로 해내는지 자주 스스로 점검한다.",
      }),
    ).toBeVisible();

    await page.reload();

    await expect(page.getByText("1 / 18", { exact: true }).last()).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "나는 해야 할 일을 제대로 해내는지 자주 스스로 점검한다.",
      }),
    ).toBeVisible();

    await page.getByRole("button", { name: "이전 문항" }).click();
    await expect(
      page.getByRole("heading", {
        name: "나는 기준에 맞지 않는 상황을 보면 그냥 넘기기 어렵다.",
      }),
    ).toBeVisible();
    await expect(page.getByText("5점 선택")).toBeVisible();
  });

  test("redirects to the saved public result page after submit", async () => {
    test.fixme();
  });
});
