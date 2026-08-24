import { test, expect, type Page } from "@playwright/test";

const MOCK_RECEIPT = {
  folio: "GG-202609-000123",
  publicReference: "5b1f2a4a-6a5b-4b8a-9d1c-1a2b3c4d5e6f",
  status: "awaiting_payment",
  requiresQuote: false,
  amountMinor: 150000,
  currency: "MXN",
};

/** Simula el backend de creación de reservaciones: nunca escribe en Supabase. */
async function mockReservationsApi(page: Page) {
  let calls = 0;
  await page.route("**/api/reservations", async (route) => {
    calls += 1;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ reservation: MOCK_RECEIPT }),
    });
  });
  return () => calls;
}

test.describe("Formulario de reservación", () => {
  test("prellena desde los query params del mini-cotizador", async ({ page }) => {
    await page.goto(
      "/reservar?serviceType=aeropuerto&date=2026-09-10&time=14:00&passengers=3&notes=Silla%20para%20bebe",
    );
    await expect(page.getByRole("heading", { name: /elige tu servicio/i })).toBeVisible();

    // El destino por defecto es una zona hotelera: hay que elegir hotel antes de avanzar.
    await page.getByRole("button", { name: /hotel o alojamiento/i }).click();
    await page.getByRole("option", { name: /otro hotel/i }).click();
    await page.getByPlaceholder(/nombre del hotel/i).fill("Hotel de prueba E2E");

    // La fecha/hora del mini-cotizador ya deben venir precargadas en el paso 1.
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(page.getByRole("heading", { name: /detalles del viaje/i })).toBeVisible();
    await expect(page.locator("#date")).toHaveValue("2026-09-10");
    await expect(page.locator("#time")).toHaveValue("14:00");
    await expect(page.locator("#passengers")).toHaveValue("3");
  });

  test("valida los 4 pasos y crea la reservación de forma idempotente", async ({ page }) => {
    const getCalls = await mockReservationsApi(page);

    await page.goto("/reservar");

    // Paso 1: enviar sin elegir hotel de destino debe mostrar un error de validación.
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(page.getByText(/selecciona un hotel o alojamiento/i)).toBeVisible();

    await page.getByRole("button", { name: /hotel o alojamiento/i }).click();
    await page.getByRole("option", { name: /otro hotel/i }).click();
    await page.getByPlaceholder(/nombre del hotel/i).fill("Hotel de prueba E2E");
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(page.getByRole("heading", { name: /detalles del viaje/i })).toBeVisible();

    // Paso 2: fecha/hora requeridas.
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(page.getByText(/selecciona una fecha/i)).toBeVisible();

    await page.locator("#date").fill("2026-09-10");
    await page.locator("#time").fill("14:00");
    await page.locator("#passengers").fill("2");
    await page.locator("#bags").fill("2");
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(page.getByRole("heading", { name: /datos de contacto/i })).toBeVisible();

    // Paso 3: contacto inválido bloquea el avance.
    await page.locator("#contactEmail").fill("no-es-un-correo");
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(page.getByText(/ingresa un correo válido/i)).toBeVisible();

    await page.locator("#contactName").fill("Jane Doe E2E");
    await page.locator("#contactEmail").fill("jane.e2e@example.com");
    await page.locator("#contactPhone").fill("+52 998 123 4567");
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(page.getByRole("heading", { name: /confirma tu reservación/i })).toBeVisible();

    // Paso 4: confirmar crea la reservación (mockeada) y navega a /pago/checkout.
    await page.getByRole("button", { name: /continuar al pago/i }).click();
    await expect(page).toHaveURL(/\/pago\/checkout/);
    expect(getCalls()).toBe(1);

    // Si el usuario regresa al resumen y confirma otra vez, no debe volver a
    // llamar al backend: el store ya tiene el receipt (idempotencia en cliente).
    await page.goBack();
    await expect(page.getByRole("heading", { name: /confirma tu reservación/i })).toBeVisible();
    await page.getByRole("button", { name: /continuar al pago/i }).click();
    await expect(page).toHaveURL(/\/pago\/checkout/);
    expect(getCalls()).toBe(1);
  });

  test("muestra el error del servidor si la creación de la reservación falla", async ({ page }) => {
    await page.route("**/api/reservations", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "No pudimos registrar la reservación. Inténtalo nuevamente." }),
      });
    });

    await page.goto("/reservar?serviceType=aeropuerto&date=2026-09-10&time=14:00");
    await page.getByRole("button", { name: /hotel o alojamiento/i }).click();
    await page.getByRole("option", { name: /otro hotel/i }).click();
    await page.getByPlaceholder(/nombre del hotel/i).fill("Hotel de prueba E2E");
    await page.getByRole("button", { name: /continuar/i }).click();
    await page.locator("#passengers").fill("2");
    await page.locator("#bags").fill("2");
    await page.getByRole("button", { name: /continuar/i }).click();
    await page.locator("#contactName").fill("Jane Doe E2E");
    await page.locator("#contactEmail").fill("jane.e2e@example.com");
    await page.locator("#contactPhone").fill("+52 998 123 4567");
    await page.getByRole("button", { name: /continuar/i }).click();
    await page.getByRole("button", { name: /continuar al pago/i }).click();

    await expect(page.getByText(/no pudimos registrar la reservación/i)).toBeVisible();
    await expect(page).toHaveURL(/\/reservar/);
  });
});
