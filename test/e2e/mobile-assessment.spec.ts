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

  test.fixme(
    "restores draft answers after a refresh using the server session",
    async () => {},
  );

  test.fixme("redirects to the saved public result page after submit", async () => {});
});
