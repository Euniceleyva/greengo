import { NextResponse } from "next/server";
import { processNotificationQueue } from "@/lib/notifications/queue";

export const dynamic = "force-dynamic";

// Procesa la cola de notification_deliveries. Pensado para invocarse desde
// Vercel Cron (que llama por GET y agrega automáticamente el header
// `Authorization: Bearer $CRON_SECRET` cuando esa variable está configurada
// en el proyecto) o cualquier otro scheduler externo con el mismo secreto.
// enqueueReservationNotifications/enqueuePaymentNotification ya intentan
// procesar la cola inmediatamente después de encolar; este endpoint existe
// como respaldo para reintentar los envíos que fallaron.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET no está configurado." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const result = await processNotificationQueue();
  return NextResponse.json(result);
}
