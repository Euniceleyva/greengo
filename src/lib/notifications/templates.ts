export type NotificationKind =
  | "customer_confirmation"
  | "admin_new_reservation"
  | "payment_pending"
  | "payment_confirmed"
  | "payment_failed"
  | "refund";

export type NotificationContext = {
  folio: string;
  publicReference: string;
  contactName: string;
  originName: string;
  destinationName: string;
  serviceType: string;
  direction: string;
  originHotelName: string | null;
  destinationHotelName: string | null;
  serviceDate: string;
  pickupTime: string;
  returnDate: string | null;
  returnTime: string | null;
  passengers: number;
  vehicleCount: number;
  bags: number;
  flightNumber: string | null;
  amountFormatted: string;
  requiresQuote: boolean;
  siteUrl: string;
};

export type EmailTemplate = { subject: string; html: string };

function layout(title: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="es">
  <body style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background:#f4f6f5; padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
      <h1 style="color:#29876B;font-size:20px;margin:0 0 16px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top:32px;color:#8a9a94;font-size:12px;">GreenGo Transfers Cancún</p>
    </div>
  </body>
</html>`;
}

function summaryTable(ctx: NotificationContext, statusLabel?: string) {
  const rows = [
    ["Folio", ctx.folio],
    ["Servicio", serviceLabel(ctx.serviceType)],
    ["Modalidad", ctx.direction === "redondo" ? "Viaje redondo" : "Viaje sencillo"],
    ["Origen", locationLabel(ctx.originName, ctx.originHotelName)],
    ["Destino", locationLabel(ctx.destinationName, ctx.destinationHotelName)],
    ["Salida", `${formatDate(ctx.serviceDate)} · ${ctx.pickupTime} h`],
    ...(ctx.returnDate && ctx.returnTime
      ? [["Regreso", `${formatDate(ctx.returnDate)} · ${ctx.returnTime} h`]]
      : []),
    ["Pasajeros", String(ctx.passengers)],
    ["Camionetas", String(ctx.vehicleCount)],
    ["Equipaje", `${ctx.bags} pieza${ctx.bags === 1 ? "" : "s"}`],
    ...(ctx.flightNumber ? [["Vuelo", ctx.flightNumber]] : []),
    ["Importe", ctx.requiresQuote ? "Por cotizar" : ctx.amountFormatted],
    ["Estado", statusLabel ?? (ctx.requiresQuote ? "Solicitud de cotización" : "Reservación recibida · pago pendiente")],
  ];

  return `<table style="width:100%;border-collapse:collapse;font-size:14px;color:#1f2d27;">
    ${rows.map(([label, value]) => `<tr><td style="padding:7px 0;border-bottom:1px solid #edf1ef;color:#617871;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:7px 0;border-bottom:1px solid #edf1ef;text-align:right;font-weight:600;">${escapeHtml(value)}</td></tr>`).join("")}
  </table>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

function locationLabel(zone: string, hotel: string | null) {
  return hotel ? `${zone} · ${hotel}` : zone;
}

function serviceLabel(serviceType: string) {
  return ({
    aeropuerto: "Aeropuerto / hotel",
    hotel_hotel: "Hotel / hotel",
    transporte_abierto: "Transporte abierto",
    a_medida: "Servicio a medida",
  } as Record<string, string>)[serviceType] ?? serviceType;
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Cancun",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function buildEmail(kind: NotificationKind, ctx: NotificationContext): EmailTemplate {
  switch (kind) {
    case "customer_confirmation":
      return {
        subject: `Recibimos tu reservación ${ctx.folio}`,
        html: layout(
          `¡Gracias, ${escapeHtml(ctx.contactName)}!`,
          `<p>Recibimos tu solicitud de traslado. ${
            ctx.requiresQuote
              ? "Nuestro equipo confirmará la tarifa antes de solicitarte el pago."
              : "Puedes continuar con el pago desde el enlace que te compartimos al reservar."
          }</p>${summaryTable(ctx)}<p style="margin-top:24px;">Consulta el estado en cualquier momento en <a href="${ctx.siteUrl}/pago/confirmacion?reference=${ctx.publicReference}">${ctx.siteUrl}/pago/confirmacion</a>.</p>`,
        ),
      };
    case "admin_new_reservation":
      return {
        subject: `Nueva reservación ${ctx.folio}`,
        html: layout(`Nueva reservación recibida`, summaryTable(ctx)),
      };
    case "payment_confirmed":
      return {
        subject: `Pago confirmado · comprobante de tu viaje ${ctx.folio}`,
        html: layout(
          "¡Tu pago fue confirmado!",
          `<p>Este es el comprobante de tu reservación ${ctx.folio}. Guarda este correo, te lo pedirá tu conductor el día del viaje.</p>${summaryTable(ctx, "Pago confirmado")}<p style="margin-top:24px;">Consulta el estado en cualquier momento en <a href="${ctx.siteUrl}/pago/confirmacion?reference=${ctx.publicReference}">${ctx.siteUrl}/pago/confirmacion</a>.</p>`,
        ),
      };
    case "payment_pending":
      return {
        subject: `Tu pago para ${ctx.folio} está en proceso`,
        html: layout(
          "Pago en proceso",
          `<p>Tu proveedor de pago está procesando la transacción de tu reservación ${ctx.folio}. Te avisaremos en cuanto se confirme.</p>`,
        ),
      };
    case "payment_failed":
      return {
        subject: `No pudimos confirmar tu pago para ${ctx.folio}`,
        html: layout(
          "Pago no confirmado",
          `<p>El pago de tu reservación ${ctx.folio} no pudo completarse. Puedes intentarlo nuevamente desde <a href="${ctx.siteUrl}/pago/checkout?reference=${ctx.publicReference}">${ctx.siteUrl}/pago/checkout</a>.</p>`,
        ),
      };
    case "refund":
      return {
        subject: `Reembolso procesado para ${ctx.folio}`,
        html: layout(
          "Reembolso confirmado",
          `<p>Confirmamos el reembolso de tu reservación ${ctx.folio}. El importe puede tardar algunos días hábiles en reflejarse según tu banco o proveedor de pago.</p>`,
        ),
      };
    default:
      throw new Error(`Tipo de notificación desconocido: ${kind satisfies never}`);
  }
}
