import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getOrCreatePaymentAttempt,
  getSiteUrl,
  publicPaymentError,
  updatePaymentAttempt,
  type PayableReservation,
} from "@/lib/payments/core";
import { createMercadoPagoPreference, mercadoPagoCheckoutUrl } from "@/lib/payments/mercado-pago";

const TEST_AMOUNT_MINOR = 900;
const requestSchema = z.object({ buyerEmail: z.string().trim().toLowerCase().email().max(254) });

export async function POST(request: Request) {
  try {
    const siteUrl = getSiteUrl();
    const origin = request.headers.get("origin");
    if (!origin || new URL(origin).origin !== siteUrl) {
      return NextResponse.json({ error: "Origen de solicitud no permitido." }, { status: 403 });
    }
    if (process.env.MERCADO_PAGO_ENV?.toLowerCase() !== "production") {
      return NextResponse.json({ error: "La prueba real requiere Mercado Pago productivo." }, { status: 409 });
    }
    if (!request.headers.get("cookie")?.includes("sb-")) {
      return NextResponse.json({ error: "Inicia sesión como administrador." }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Inicia sesión como administrador." }, { status: 401 });

    const { data: profile } = await supabase
      .from("app_users")
      .select("email, role, active")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!profile?.active || (profile.role !== "owner" && profile.role !== "admin")) {
      return NextResponse.json({ error: "No tienes permiso para crear pagos de prueba." }, { status: 403 });
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 1_000) {
      return NextResponse.json({ error: "La solicitud es demasiado grande." }, { status: 413 });
    }
    const { buyerEmail } = requestSchema.parse(await request.json());
    if (buyerEmail === profile.email) {
      return NextResponse.json({ error: "Usa un correo de comprador distinto al vendedor." }, { status: 400 });
    }

    const admin = createAdminClient();
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Cancun",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const { data, error } = await admin
      .from("reservations")
      .insert({
        service_type: "a_medida",
        direction: "sencillo",
        booking_source: "admin",
        status: "awaiting_payment",
        contact_name: "Prueba de pago GreenGo",
        contact_email: buyerEmail,
        contact_phone: "00000000",
        origin_name: "Prueba interna GreenGo",
        destination_name: "Mercado Pago",
        service_date: today,
        pickup_time: "12:00",
        passengers: 1,
        bags: 0,
        currency: "MXN",
        subtotal_minor: TEST_AMOUNT_MINOR,
        discount_minor: 0,
        total_minor: TEST_AMOUNT_MINOR,
        requires_quote: false,
        pricing_snapshot: { test_payment: true, amount_minor: TEST_AMOUNT_MINOR, created_by: user.id },
        admin_notes: "Pago productivo de prueba por $9 MXN. No corresponde a un traslado.",
      })
      .select("id, folio, public_reference, status, contact_name, contact_email, contact_phone, origin_name, destination_name, service_date, pickup_time, total_minor, currency, requires_quote")
      .single();
    if (error) throw error;

    const reservation = data as PayableReservation;
    const payment = await getOrCreatePaymentAttempt(reservation, "mercado_pago", "card");
    const successUrl = new URL("/admon/prueba-pago", siteUrl);
    successUrl.searchParams.set("reference", reservation.public_reference);
    successUrl.searchParams.set("return", "success");
    const pendingUrl = new URL(successUrl);
    pendingUrl.searchParams.set("return", "pending");
    const failureUrl = new URL("/admon/prueba-pago", siteUrl);
    failureUrl.searchParams.set("reference", reservation.public_reference);
    failureUrl.searchParams.set("return", "failure");

    const preference = await createMercadoPagoPreference({
      items: [{
        id: reservation.folio,
        title: "Prueba de pago GreenGo",
        description: "Validación productiva de Checkout Pro y Webhook",
        category_id: "services",
        quantity: 1,
        currency_id: "MXN",
        unit_price: TEST_AMOUNT_MINOR / 100,
      }],
      payer: { name: reservation.contact_name, email: reservation.contact_email },
      external_reference: payment.external_reference,
      back_urls: { success: successUrl.toString(), pending: pendingUrl.toString(), failure: failureUrl.toString() },
      auto_return: "approved",
      binary_mode: false,
      metadata: { reservation_reference: reservation.public_reference, reservation_folio: reservation.folio, test_payment: true },
    }, payment.idempotency_key);

    const checkoutUrl = mercadoPagoCheckoutUrl(preference);
    await updatePaymentAttempt(payment.id, {
      status: "pending",
      provider_order_id: preference.id,
      checkout_url: checkoutUrl,
      metadata: { reservation_folio: reservation.folio, preference_id: preference.id, test_payment: true },
    });

    return NextResponse.json({ checkoutUrl, reference: reservation.public_reference });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Ingresa un correo de comprador válido." }, { status: 400 });
    }
    const publicError = publicPaymentError(error);
    return NextResponse.json({ error: publicError.message }, { status: publicError.status });
  }
}
