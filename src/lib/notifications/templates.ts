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

// Paleta y tipografía tomadas de la tarjeta "adventure-confirmation-receipt"
// de /pago/confirmacion (src/app/globals.css), para que el correo se sienta
// parte del mismo recibo que ve el cliente en el sitio.
const NIGHT = "#222222";
const FOAM = "#fefcf9";
const CORAL = "#eaa33d";
const CARIBBEAN = "#93d9d9";
const SUN = "#9cc52c";
const PAGE_BG = "#f2ede0";
const DISPLAY_FONT = "'Fredoka', 'Arial Rounded MT Bold', Verdana, sans-serif";
const BODY_FONT = "'Lexend', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function layout(input: {
  siteUrl: string;
  eyebrow: string;
  heading: string;
  intro: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const { siteUrl, eyebrow, heading, intro, bodyHtml, ctaLabel, ctaHref } = input;
  const cta = ctaLabel && ctaHref
    ? `<tr><td style="padding-top:26px;text-align:center;">
        <a href="${ctaHref}" style="display:inline-block;background:${NIGHT};color:${FOAM};font-family:${DISPLAY_FONT};font-size:14px;font-weight:700;letter-spacing:.02em;text-decoration:none;padding:14px 30px;border-radius:999px;border:2px solid ${NIGHT};">${escapeHtml(ctaLabel)}</a>
      </td></tr>`
    : "";

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:28px 16px;background:${PAGE_BG};font-family:${BODY_FONT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
      <tr>
        <td style="text-align:center;padding-bottom:18px;">
          <img src="${siteUrl}/images/logos/logo_anterior_color.png" alt="GreenGo Transfers Cancún" width="132" style="display:inline-block;height:auto;" />
        </td>
      </tr>
      <tr>
        <td style="background:${FOAM};border:3px solid ${NIGHT};border-radius:4px;box-shadow:7px 8px 0 ${NIGHT};padding:clamp(20px,4vw,34px);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="border-bottom:2px dashed ${NIGHT};padding-bottom:16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="font-size:11px;font-weight:800;letter-spacing:.06em;color:${NIGHT};text-transform:uppercase;font-family:${BODY_FONT};">${escapeHtml(eyebrow)}</div>
                      <div style="margin-top:4px;font-family:${DISPLAY_FONT};font-weight:600;font-size:22px;color:${NIGHT};">${escapeHtml(heading)}</div>
                    </td>
                    <td width="46" style="vertical-align:middle;text-align:right;">
                      <div style="width:44px;height:44px;border-radius:50%;border:2px solid ${NIGHT};background:${CARIBBEAN};display:inline-block;"></div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding-top:16px;font-size:14px;line-height:1.6;color:${NIGHT};">${intro}</td>
            </tr>
            <tr>
              <td style="padding-top:6px;">${bodyHtml}</td>
            </tr>
            ${cta}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-top:22px;text-align:center;font-size:12px;color:#6b7975;">
          GreenGo Transfers Cancún · Traslados privados en Cancún y Riviera Maya<br />
          <a href="https://wa.me/529980000000" style="color:${NIGHT};font-weight:700;text-decoration:none;">WhatsApp</a>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function summaryRows(ctx: NotificationContext) {
  const rows: [string, string][] = [
    ["Servicio", serviceLabel(ctx.serviceType)],
    ["Sentido", ctx.direction === "redondo" ? "Redondo" : "Sencillo"],
    ["Origen", locationLabel(ctx.originName, ctx.originHotelName)],
    ["Destino", locationLabel(ctx.destinationName, ctx.destinationHotelName)],
    ["Fecha y hora", `${formatDate(ctx.serviceDate)} · ${ctx.pickupTime} h`],
    ...(ctx.returnDate && ctx.returnTime
      ? ([["Regreso", `${formatDate(ctx.returnDate)} · ${ctx.returnTime} h`]] as [string, string][])
      : []),
    ["Pasajeros", String(ctx.passengers)],
    ["Equipaje", `${ctx.bags} pieza${ctx.bags === 1 ? "" : "s"}`],
    ...(ctx.flightNumber ? ([["Vuelo", ctx.flightNumber]] as [string, string][]) : []),
    ["Folio", ctx.folio],
  ];
  return rows;
}

function summaryTable(ctx: NotificationContext) {
  const rows = summaryRows(ctx);
  const pairs: [string, string][][] = [];
  for (let i = 0; i < rows.length; i += 2) pairs.push([rows[i], rows[i + 1]]);

  const cell = (row?: [string, string]) =>
    row
      ? `<td width="50%" style="vertical-align:top;padding:10px 8px 10px 0;border-bottom:1px solid #e6e1d3;">
          <div style="font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#7c8a83;">${escapeHtml(row[0])}</div>
          <div style="margin-top:3px;font-size:14px;font-weight:700;color:${NIGHT};">${escapeHtml(row[1])}</div>
        </td>`
      : `<td width="50%" style="border-bottom:1px solid #e6e1d3;"></td>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
    ${pairs.map(([a, b]) => `<tr>${cell(a)}${cell(b)}</tr>`).join("")}
  </table>`;
}

function totalRow(label: string, value: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;border-top:3px solid ${NIGHT};padding-top:12px;">
    <tr>
      <td style="font-weight:800;color:${NIGHT};font-size:14px;">${escapeHtml(label)}</td>
      <td style="text-align:right;font-family:${DISPLAY_FONT};font-weight:600;color:${CORAL};font-size:20px;">${escapeHtml(value)}</td>
    </tr>
  </table>`;
}

function badge(text: string, color: string) {
  return `<span style="display:inline-block;background:${color};color:${NIGHT};font-size:11px;font-weight:800;letter-spacing:.03em;padding:5px 12px;border-radius:999px;border:1.5px solid ${NIGHT};">${escapeHtml(text)}</span>`;
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
  const confirmationUrl = `${ctx.siteUrl}/pago/confirmacion?reference=${ctx.publicReference}`;

  switch (kind) {
    case "customer_confirmation":
      return {
        subject: `Recibimos tu reservación ${ctx.folio}`,
        html: layout({
          siteUrl: ctx.siteUrl,
          eyebrow: "RECIBO DE RUTA",
          heading: "Resumen del viaje",
          intro: `¡Gracias, ${escapeHtml(ctx.contactName)}! ${badge(
            ctx.requiresQuote ? "Solicitud de cotización" : "Pago pendiente",
            ctx.requiresQuote ? CARIBBEAN : SUN,
          )}<br /><br />${
            ctx.requiresQuote
              ? "Nuestro equipo confirmará la tarifa antes de solicitarte el pago."
              : "Continúa con el pago desde el botón para dejar tu lugar confirmado."
          }`,
          bodyHtml: summaryTable(ctx) + totalRow("Importe", ctx.requiresQuote ? "Por cotizar" : ctx.amountFormatted),
          ctaLabel: ctx.requiresQuote ? "Ver mi reservación" : "Completar mi pago",
          ctaHref: confirmationUrl,
        }),
      };
    case "admin_new_reservation":
      return {
        subject: `Nueva reservación ${ctx.folio}`,
        html: layout({
          siteUrl: ctx.siteUrl,
          eyebrow: "AVISO INTERNO",
          heading: "Nueva reservación",
          intro: `${escapeHtml(ctx.contactName)} reservó un traslado. ${badge("Sin acción requerida", CARIBBEAN)}`,
          bodyHtml: summaryTable(ctx) + totalRow("Importe", ctx.requiresQuote ? "Por cotizar" : ctx.amountFormatted),
        }),
      };
    case "payment_confirmed":
      return {
        subject: `Pago confirmado · comprobante de tu viaje ${ctx.folio}`,
        html: layout({
          siteUrl: ctx.siteUrl,
          eyebrow: "COMPROBANTE DE PAGO",
          heading: "¡Tu viaje está listo!",
          intro: `${badge("Pago confirmado", SUN)}<br /><br />Guarda este correo — es tu comprobante. Tu conductor puede pedírtelo al recogerte.`,
          bodyHtml: summaryTable(ctx) + totalRow("Total pagado", ctx.amountFormatted),
          ctaLabel: "Ver mi reservación",
          ctaHref: confirmationUrl,
        }),
      };
    case "payment_pending":
      return {
        subject: `Tu pago para ${ctx.folio} está en proceso`,
        html: layout({
          siteUrl: ctx.siteUrl,
          eyebrow: "RECIBO DE RUTA",
          heading: "Pago en proceso",
          intro: `${badge("Verificando pago", SUN)}<br /><br />Tu proveedor de pago está procesando la transacción de tu reservación ${escapeHtml(ctx.folio)}. Te avisaremos en cuanto se confirme.`,
          bodyHtml: summaryTable(ctx),
        }),
      };
    case "payment_failed":
      return {
        subject: `No pudimos confirmar tu pago para ${ctx.folio}`,
        html: layout({
          siteUrl: ctx.siteUrl,
          eyebrow: "RECIBO DE RUTA",
          heading: "Pago no confirmado",
          intro: `${badge("Pago no completado", CORAL)}<br /><br />El pago de tu reservación ${escapeHtml(ctx.folio)} no pudo completarse. Puedes intentarlo nuevamente desde el botón.`,
          bodyHtml: summaryTable(ctx),
          ctaLabel: "Reintentar pago",
          ctaHref: `${ctx.siteUrl}/pago/checkout?reference=${ctx.publicReference}`,
        }),
      };
    case "refund":
      return {
        subject: `Reembolso procesado para ${ctx.folio}`,
        html: layout({
          siteUrl: ctx.siteUrl,
          eyebrow: "RECIBO DE RUTA",
          heading: "Reembolso confirmado",
          intro: `${badge("Reembolso procesado", CARIBBEAN)}<br /><br />Confirmamos el reembolso de tu reservación ${escapeHtml(ctx.folio)}. El importe puede tardar algunos días hábiles en reflejarse según tu banco o proveedor de pago.`,
          bodyHtml: summaryTable(ctx),
        }),
      };
    default:
      throw new Error(`Tipo de notificación desconocido: ${kind satisfies never}`);
  }
}
