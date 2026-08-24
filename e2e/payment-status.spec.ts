import { test, expect } from "@playwright/test";

test.describe("Consulta pública de estado de pago", () => {
  test("una referencia con formato inválido se rechaza sin tocar la base de datos", async ({ request }) => {
    const response = await request.get("/api/payments/status?reference=no-es-un-uuid");
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/inválida/i);
  });

  test("una referencia bien formada pero inexistente responde 404", async ({ request }) => {
    const response = await request.get(
      "/api/payments/status?reference=00000000-0000-4000-8000-000000000000",
    );
    expect(response.status()).toBe(404);
  });

  test("sin un borrador de reservación en la sesión, /pago/confirmacion no muestra datos inventados", async ({
    page,
  }) => {
    // La confirmación se arma con el receipt guardado en el store del navegador,
    // no solo con la consulta pública de estado: sin ese receipt en sesión,
    // debe mostrar un estado vacío en vez de fabricar un resumen de viaje.
    await page.goto("/pago/confirmacion?reference=5b1f2a4a-6a5b-4b8a-9d1c-1a2b3c4d5e6f");
    await expect(page.getByText(/no encontramos información de una reservación reciente/i)).toBeVisible();
  });
});
