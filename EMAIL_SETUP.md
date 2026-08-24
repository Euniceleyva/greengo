# Configuración de correo transaccional

El código encola cada notificación en `notification_deliveries` (Supabase) y las envía con [Resend](https://resend.com) vía `src/lib/notifications/resend-client.ts`. Sin `RESEND_API_KEY` configurada, las notificaciones quedan en `queued` indefinidamente y no se pierde información: basta con configurar la variable y volver a procesar la cola.

## Requisitos previos

1. Aplicar la migración `supabase/migrations/202608170001_initial_booking_schema.sql` (ya crea `notification_deliveries` y los tipos `notification_kind`/`delivery_status`).
2. Tener un dominio verificado en Resend para el remitente (`RESEND_FROM_EMAIL`); los correos desde un dominio no verificado se marcan como spam con frecuencia.

## Configuración

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=reservaciones@greengotransferscancun.com
ADMIN_NOTIFICATION_EMAIL=admin@greengotransferscancun.com
CRON_SECRET=un_secreto_largo_generado_aleatoriamente
```

- `RESEND_API_KEY` / `RESEND_FROM_EMAIL`: sin ambas, `processNotificationQueue` no hace nada (ver `isEmailProviderConfigured()`).
- `ADMIN_NOTIFICATION_EMAIL`: opcional. Si se omite, solo se envía la confirmación al cliente y no el aviso interno de nueva reservación.
- `CRON_SECRET`: protege `GET /api/internal/notifications/process`, el endpoint de reintento de la cola.

## Cuándo se encola cada tipo de correo

Ver la tabla completa en [`docs/ESTADOS.md`](docs/ESTADOS.md#notificación-notification_deliveriesstatus). En resumen:

| `notification_kind` | Se encola desde | Destinatario |
|---|---|---|
| `customer_confirmation` | `createReservation` | Cliente |
| `admin_new_reservation` | `createReservation` | `ADMIN_NOTIFICATION_EMAIL` |
| `payment_pending` | `applyProviderPayment` (pago `created`/`pending`/`action_required`) | Cliente |
| `payment_failed` | `applyProviderPayment` (pago `rejected`/`cancelled`/`expired`) | Cliente |
| `refund` | `applyProviderPayment` (pago `refunded`/`charged_back`) | Cliente |

## Reintento de envíos fallidos

`enqueueReservationNotifications` y `enqueuePaymentNotification` intentan procesar la cola inmediatamente después de encolar (`void processNotificationQueue()`), así que en el flujo normal el correo sale sin esperar un cron. El endpoint `GET /api/internal/notifications/process` existe como respaldo para reintentar filas en `failed` (hasta 5 intentos, ver `MAX_ATTEMPTS` en `src/lib/notifications/queue.ts`):

- **Vercel Cron** (recomendado): ya está declarado en `vercel.json` (cada 10 minutos). Al configurar `CRON_SECRET` como variable de entorno del proyecto en Vercel, la plataforma agrega automáticamente el header `Authorization: Bearer $CRON_SECRET` a cada invocación.
- **Manual / otro scheduler**: `curl -H "Authorization: Bearer $CRON_SECRET" https://TU-DOMINIO/api/internal/notifications/process`.

## Prueba mínima antes de producción

1. Configurar `RESEND_API_KEY` y `RESEND_FROM_EMAIL` en un entorno de prueba con un dominio verificado en modo sandbox/test de Resend.
2. Crear una reservación de prueba y confirmar que llegan el correo al cliente y al `ADMIN_NOTIFICATION_EMAIL`.
3. Forzar un fallo temporal (p. ej. una API key inválida) y verificar que la fila queda en `failed` con `last_error` y que, tras corregir la key, `GET /api/internal/notifications/process` la reintenta y la marca `sent`.
4. Confirmar en `notification_deliveries.provider_message_id` que no se generan filas duplicadas al reintentar.
