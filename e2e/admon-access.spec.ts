import { test, expect } from "@playwright/test";

test.describe("Acceso a /admon", () => {
  test("un visitante no autenticado es redirigido al login", async ({ page }) => {
    await page.goto("/admon");
    await expect(page).toHaveURL(/\/admon\/acceso/);
    await expect(page.getByRole("button", { name: /entrar al panel/i })).toBeVisible();
  });

  test("/admin, /driver y /demo ya no existen (404)", async ({ page }) => {
    for (const path of ["/admin", "/driver", "/demo"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
    }
  });
});
