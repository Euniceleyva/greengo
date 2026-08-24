# Checklist de lanzamiento

Referencia: `PLAN_REFACTORIZACION.md` (alcance y fases), `PAYMENTS_SETUP.md`, `EMAIL_SETUP.md`, `supabase/README.md`, `docs/ESTADOS.md`.

## 1. Base de datos

- [ ] Aplicar en orden todas las migraciones de `supabase/migrations/` en el proyecto de producción.
- [ ] Confirmar RLS activo en todas las tablas (ya viene así en la migración inicial; verificar que no se haya desactivado manualmente).
- [ ] Revisar y aprobar las dos tarifas marcadas con `review_note` en `pricing_rules.metadata` (`202608200001_direct_client_tariffs.sql`).
- [ ] Crear el usuario administrativo en Supabase Auth e insertarlo en `app_users` con rol `owner`.
- [ ] Ejecutar las recomendaciones del Security Advisor de Supabase para el proyecto de producción.

## 2. Variables de entorno (Vercel)

- [ ] `NEXT_PUBLIC_SITE_URL` con el dominio HTTPS definitivo (sin ruta final).
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- [ ] `SUPABASE_SECRET_KEY` (solo servidor, nunca con prefijo `NEXT_PUBLIC_`).
- [ ] `MERCADO_PAGO_ENV=production`, `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET`.
- [ ] `PAYPAL_ENV=live`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYMENT_BRAND_NAME`.
- [ ] `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (dominio verificado), `ADMIN_NOTIFICATION_EMAIL`.
- [ ] `CRON_SECRET` (debe coincidir con lo que Vercel Cron envía automáticamente).
- [ ] Confirmar que ninguna variable secreta tiene el prefijo `NEXT_PUBLIC_`.

## 3. Pagos

- [ ] Webhook de Mercado Pago registrado en `https://TU-DOMINIO/api/payments/mercado-pago/webhook`, evento `payment` activo.
- [ ] Webhook de PayPal registrado en `https://TU-DOMINIO/api/payments/paypal/webhook`, con los 5 eventos de `PAYMENT.CAPTURE.*` suscritos.
- [ ] Pago de prueba en sandbox/test para ambos proveedores, verificando `payments.status = approved` y `reservations.status = confirmed`.
- [ ] Reenviar el mismo webhook (duplicado) y confirmar que no se genera un doble cobro ni una reservación duplicada.
- [ ] Probar los flujos de pago pendiente, rechazado, cancelado y reembolsado.

## 4. Correo transaccional

- [ ] Dominio verificado en Resend.
- [ ] Reservación de prueba: confirmar que llegan `customer_confirmation` y `admin_new_reservation`.
- [ ] Confirmar que `payment_pending`/`payment_failed`/`refund` se envían según el resultado del pago de prueba.
- [ ] Vercel Cron de `/api/internal/notifications/process` activo (`vercel.json`) y `CRON_SECRET` configurado en el proyecto.

## 5. Seguridad

- [ ] Confirmar que `/admon` exige sesión de Supabase Auth con rol `owner`/`admin` activo en `app_users`.
- [ ] Confirmar que `/admin`, `/driver` y `/demo` responden 404 (ya no existen en el código).
- [ ] Revisar límites de `src/lib/rate-limit.ts` y `src/lib/http-guards.ts` según el tráfico esperado; si se despliega en múltiples instancias/regiones, migrar a un store compartido (p. ej. Upstash Redis).
- [ ] Revisar que ningún `console.error` imprima payloads completos con datos personales (ver `docs/ESTADOS.md` y los handlers en `src/app/api/`).

## 6. Calidad

- [ ] `npm run lint` sin errores.
- [ ] `npm run build` sin errores ni advertencias de dependencia en Google Fonts (fuentes autoalojadas en `public/fonts/`).
- [ ] `npm run test` (Vitest) sin fallos.
- [ ] `npm run test:e2e` (Playwright) sin fallos.
- [ ] Recorrido manual en móvil y escritorio: LP, cotización rápida, reservación completa, checkout Mercado Pago, checkout PayPal, confirmación de pago, inicio de sesión administrativo, consulta de reservaciones en `/admon`.

## 7. Rollback

- [ ] Confirmar que el despliegue anterior en Vercel puede promoverse de vuelta a producción en un clic (usar "Instant Rollback" del panel de Vercel).
- [ ] Las migraciones de Supabase son aditivas (no destructivas); si una migración nueva causa un problema, revertir solo el despliegue de la aplicación primero — no se requiere revertir el esquema salvo que la migración en cuestión sea la causa.
- [ ] Si un webhook mal configurado provoca pagos mal conciliados, `payment_webhook_events` conserva el payload crudo de cada evento para reprocesar manualmente sin volver a contactar al proveedor.

## Pendiente conocido (fuera del alcance de esta pasada)

- Acciones administrativas más allá de solo lectura en `/admon` (cambiar estado, cancelar, reembolsar, editar tarifas, reenviar correos, notas internas, exportar CSV, crear reservaciones manuales): requieren aprobación explícita — ver `PLAN_REFACTORIZACION.md`, Fase 7.
- Carga diferida del catálogo de hoteles (`src/mocks/hotels.ts`, ~1400 líneas) en el mini-cotizador de la LP: identificada como oportunidad de rendimiento pero no implementada en esta pasada para no arriesgar una regresión en el componente comercial sin verificación visual disponible. Ver `PLAN_REFACTORIZACION.md`, Fase 8.
- Auditoría Lighthouse formal en móvil: no se ejecutó en esta pasada (sin navegador disponible en el entorno de trabajo); recomendado antes de lanzar.
