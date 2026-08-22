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

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
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

function serviceLabel(value: string) {
  return ({
    aeropuerto: "Aeropuerto / hotel",
    hotel_hotel: "Hotel / hotel",
    transporte_abierto: "Transporte abierto",
    a_medida: "Servicio a medida",
  } as Record<string, string>)[value] ?? value;
}

function locationLabel(zone: string, hotel: string | null) {
  return hotel ? `${zone} · ${hotel}` : zone;
}

function summaryTable(ctx: NotificationContext) {
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
    ["Estado", ctx.requiresQuote ? "Solicitud de cotización" : "Reservación recibida · pago pendiente"],
  ];

  return `<table style="width:100%;border-collapse:collapse;font-size:14px;color:#152d27;">
    ${rows.map(([label, value]) => `<tr><td style="padding:8px 0;border-bottom:1px solid #edf1ef;color:#617871;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 0;border-bottom:1px solid #edf1ef;text-align:right;font-weight:600;">${escapeHtml(value)}</td></tr>`).join("")}
  </table>`;
}

export function buildReservationEmail(ctx: NotificationContext) {
  const statusMessage = ctx.requiresQuote
    ? "Nuestro equipo revisará la ruta y te confirmará la tarifa antes de solicitar el pago."
    : "Tu reservación quedó registrada. El lugar se confirma cuando completes el pago.";
  const confirmationUrl = `${ctx.siteUrl}/pago/confirmacion?reference=${encodeURIComponent(ctx.publicReference)}`;

  return {
    subject: `Comprobante de reservación ${ctx.folio}`,
    html: `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#f4f7f5;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#152d27;">
    <div style="max-width:600px;margin:0 auto;overflow:hidden;border:1px solid #dce8e2;border-radius:20px;background:#ffffff;">
      <div style="background:#153b32;padding:28px 32px;color:#ffffff;">
        <p style="margin:0;color:#a8d23b;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;">GreenGo Transfers Cancún</p>
        <h1 style="margin:10px 0 0;font-size:25px;line-height:1.2;">Comprobante de reservación</h1>
      </div>
      <div style="padding:30px 32px;">
        <p style="margin:0 0 10px;font-size:18px;font-weight:700;">¡Gracias, ${escapeHtml(ctx.contactName)}!</p>
        <p style="margin:0 0 24px;color:#617871;line-height:1.6;">${statusMessage}</p>
        ${summaryTable(ctx)}
        <div style="margin-top:26px;text-align:center;">
          <a href="${confirmationUrl}" style="display:inline-block;border-radius:999px;background:#a8d23b;padding:13px 22px;color:#153b32;text-decoration:none;font-weight:800;">Consultar reservación</a>
        </div>
        <p style="margin:26px 0 0;color:#7b8d86;font-size:12px;line-height:1.6;">Conserva este correo y tu folio. Los datos de tarjeta se procesan exclusivamente en la pasarela de pago segura.</p>
      </div>
    </div>
  </body>
</html>`,
  };
}
