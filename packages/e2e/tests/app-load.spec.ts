import { test, expect } from "@playwright/test";

test.describe("App Load", () => {
  test("should load the app without errors", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Brian Code")).toBeVisible();
  });

  test("should display welcome empty state", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Type a message to start")).toBeVisible();
  });
});
