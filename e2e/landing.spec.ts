import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads with hero and key sections", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Traslados privados en Cancún/i);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /reservar/i }).first()).toBeVisible();
  });

  test("footer link to /demo, /admin and /driver no longer exists", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();
    expect(html).not.toContain('href="/admin"');
    expect(html).not.toContain('href="/driver"');
    expect(html).not.toContain('href="/demo"');
  });
});
