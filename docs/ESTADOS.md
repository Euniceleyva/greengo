# Estados y transiciones

Documenta los estados válidos de reservación, pago y entrega de correos, y qué código produce cada transición. Fuente de verdad: `supabase/migrations/202608170001_initial_booking_schema.sql` (tipos `reservation_status`, `payment_status`, `delivery_status`) y `src/lib/payments/core.ts` / `src/lib/reservations/create-reservation.ts`.

## Reservación (`reservations.status`)

| Estado | Significado | Se llega desde |
|---|---|---|
| `quote_requested` | No hay tarifa aprobada para la ruta/fecha; el equipo debe cotizar manualmente. | `createReservation` cuando no existe `pricing_rule` vigente para el origen/destino/fecha. |
| `awaiting_payment` | Hay tarifa calculada; el cliente todavía no completa el pago. | `createReservation` cuando sí hay tarifa. También `applyProviderPayment` cuando un pago vuelve a `rejected`/`cancelled`/`expired`. |
| `payment_pending` | El proveedor de pago está procesando la transacción. | `applyProviderPayment` cuando el estado del pago es `created`/`pending`/`action_required`. |
| `confirmed` | Pago aprobado y verificado por el proveedor. | `applyProviderPayment` cuando el estado del pago es `approved` (importe y moneda validados contra la reservación). |
| `refunded` | El pago fue reembolsado o revertido (contracargo). | `applyProviderPayment` cuando el estado del pago es `refunded`/`charged_back`. |
| `cancelled` / `expired` | No se generan automáticamente en el código actual; reservados para uso administrativo futuro (Fase 7, requiere aprobación explícita). | — |

`applyProviderPayment` nunca retrocede un pago ya `approved` a un estado no final, ni cambia un pago `refunded`/`charged_back` a otro estado: los eventos de webhook duplicados o fuera de orden se ignoran silenciosamente (ver los arreglos `nonFinalStatuses` en `src/lib/payments/core.ts`).

## Pago (`payments.status`)

`created → pending|action_required → approved | rejected | cancelled | expired`, y desde `approved` opcionalmente `→ refunded | charged_back`.

- `created`: fila insertada por `getOrCreatePaymentAttempt`, antes de llamar al proveedor.
- `pending` / `action_required`: el proveedor requiere esperar o que el cliente complete un paso (p. ej. 3DS, aprobación en PayPal).
- `approved`: confirmado por webhook firmado del proveedor (`payment_webhook_events` registra el evento crudo). `applyProviderPayment` exige que `amount_minor` y `currency` coincidan exactamente con la reservación antes de marcar `approved`.
- `rejected` / `cancelled` / `expired`: el intento no se completó; la reservación vuelve a `awaiting_payment` para permitir reintento.
- `refunded` / `charged_back`: estado final; no se puede revertir desde el código actual.

## Notificación (`notification_deliveries.status`)

`queued → sent | failed | skipped`. `failed` puede reintentarse (máximo 5 intentos, ver `MAX_ATTEMPTS` en `src/lib/notifications/queue.ts`) hasta quedar `sent`. `skipped` ocurre si la fila no tiene reservación o destinatario asociado.

`notification_kind`: `customer_confirmation` y `admin_new_reservation` se encolan al crear la reservación (`enqueueReservationNotifications`, llamado desde `createReservation`). `payment_pending`, `payment_failed` y `refund` se encolan desde `applyProviderPayment` según el nuevo estado del pago (`notifyPaymentOutcome`).

El envío real requiere `RESEND_API_KEY` y `RESEND_FROM_EMAIL`; sin esas variables, `processNotificationQueue` no hace nada (`isEmailProviderConfigured()` devuelve `false`) y las filas quedan en `queued` indefinidamente hasta configurarlas.

## Módulos del dominio

| Responsabilidad | Módulo |
|---|---|
| Cotización y tarifas (funciones puras) | `src/lib/reservations/pricing.ts` |
| Creación de reservaciones (orquestación + Supabase) | `src/lib/reservations/create-reservation.ts` |
| Intentos de pago y conciliación con proveedores | `src/lib/payments/core.ts` |
| Integración Mercado Pago / PayPal | `src/lib/payments/mercado-pago.ts`, `src/lib/payments/paypal.ts` |
| Webhooks de pago | `src/app/api/payments/*/webhook/route.ts` |
| Consulta administrativa (solo lectura) | `src/app/admon/page.tsx`, `src/components/admon/services-summary.tsx` |
| Notificaciones transaccionales | `src/lib/notifications/queue.ts`, `templates.ts`, `resend-client.ts` |
