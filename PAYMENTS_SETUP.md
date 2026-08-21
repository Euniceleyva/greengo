# Configuración de pagos

El código está preparado para Mercado Pago Checkout Pro y PayPal Checkout. Todos los importes se leen desde Supabase y los pagos solo se confirman después de validar el webhook del proveedor. GreenGo no recopila datos de tarjeta.

## Requisitos previos

1. Aplicar en orden las migraciones de `supabase/migrations`, incluida `202608170002_add_paypal_provider.sql`.
2. Configurar `NEXT_PUBLIC_SITE_URL` con el dominio HTTPS definitivo, sin ruta final.
3. Configurar `SUPABASE_SECRET_KEY` únicamente como secreto del servidor.
4. Ejecutar la migración de tarifas y aprobar los valores de `pricing_rules`. Las reservaciones sin tarifa permanecen como cotización y no pueden pagarse.

## Mercado Pago Checkout Pro

1. En Mercado Pago Developers, crear una aplicación de tipo **Checkout Pro**.
2. Comenzar con las credenciales de prueba y configurar:

   ```env
   MERCADO_PAGO_ENV=test
   MERCADO_PAGO_ACCESS_TOKEN=...
   MERCADO_PAGO_WEBHOOK_SECRET=...
   ```

3. En **Webhooks > Configurar notificaciones**, registrar la URL:

   ```text
   https://TU-DOMINIO/api/payments/mercado-pago/webhook
   ```

4. Activar el evento **Pagos (`payment`)** y copiar la clave secreta generada en `MERCADO_PAGO_WEBHOOK_SECRET`.
5. Ejecutar una simulación desde el panel y comprobar una respuesta HTTP 200.
6. Después de completar las pruebas, sustituir el token por el productivo y cambiar `MERCADO_PAGO_ENV=production`.

No se necesita Public Key porque esta implementación crea la preferencia en el servidor y redirige al `init_point`. Checkout Pro ofrece todos los medios disponibles por defecto; no se excluye `amex`, por lo que American Express aparece cuando esté habilitado para la cuenta mexicana del vendedor.

## PayPal Checkout

1. En PayPal Developer Dashboard, crear una aplicación REST.
2. Usar primero la aplicación y cuenta Business de sandbox:

   ```env
   PAYPAL_ENV=sandbox
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   PAYPAL_WEBHOOK_ID=...
   PAYMENT_BRAND_NAME=GreenGo Transfers Cancun
   ```

3. Registrar este webhook en la aplicación REST:

   ```text
   https://TU-DOMINIO/api/payments/paypal/webhook
   ```

4. Suscribir los eventos:

   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.PENDING`
   - `PAYMENT.CAPTURE.DECLINED`
   - `PAYMENT.CAPTURE.REFUNDED`
   - `PAYMENT.CAPTURE.REVERSED`

5. Copiar el identificador del webhook en `PAYPAL_WEBHOOK_ID`.
6. Para producción, colocar las credenciales de la aplicación Live y cambiar `PAYPAL_ENV=live`.

## Variables de despliegue

Todas las variables anteriores deben configurarse tanto en el entorno local como en Vercel. `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID` y `SUPABASE_SECRET_KEY` son secretos de servidor. `PAYPAL_CLIENT_ID` no es una contraseña, pero esta implementación también lo consume en el servidor. Ninguna de estas variables debe llevar el prefijo `NEXT_PUBLIC_`.

## Prueba mínima antes de producción

1. Crear una reservación con una tarifa real y comprobar que aparece en `/admon`.
2. Completar un pago de prueba con Mercado Pago y otro con PayPal.
3. Verificar que `payments.status` termine en `approved`, `reservations.status` en `confirmed` y el evento quede procesado en `payment_webhook_events`.
4. Reenviar el mismo webhook y confirmar que no se duplique el pago ni la reservación.
5. Probar cancelación, rechazo y pago pendiente.
