# Supabase para GreenGo

La migración `migrations/202608170001_initial_booking_schema.sql` define únicamente el alcance productivo aprobado:

- reservaciones y cotizaciones del sitio público;
- intentos y confirmaciones de Mercado Pago y PayPal;
- seguimiento de correos transaccionales;
- acceso de lectura para el panel sencillo `/admon`;
- catálogo de ubicaciones y reglas de precio confiables del servidor.

No crea tablas para el antiguo demo de conductores, vehículos, combustible o contabilidad. Esos módulos siguen ocultos y fuera del alcance contratado.

## Decisiones de seguridad

- Todas las tablas tienen RLS activo.
- El rol anónimo no recibe permisos directos sobre las tablas.
- El navegador nunca debe insertar una reservación ni decidir el importe final.
- Las reservaciones, los pagos, los webhooks y los correos se escriben desde rutas de servidor con la clave `service_role`.
- Los usuarios autenticados solo pueden leer las tablas si también aparecen activos en `app_users` con rol `owner` o `admin`.
- Los importes se guardan en centavos (`*_minor`) para evitar errores de redondeo.
- El pago solo se considera aprobado después de validar el webhook del proveedor correspondiente.

## Antes de cobrar

La migración `202608200001_direct_client_tariffs.sql` carga las tarifas del **Tarifario cliente directo (29/07/2026)**. Usa cuatro importes por ruta (1–4 y 5–8 pasajeros, diurno y nocturno), capacidad máxima de 8 pasajeros por camioneta y rutas direccionales. La migración `202609290002_sync_approved_return_tariffs.sql` conserva las correcciones aprobadas para Puerto Juárez → Aeropuerto y Tulum → Aeropuerto.

La migración `202609290001_split_crococun_zone.sql` separa **Zona CrocoCun** de **Zona Puerto Morelos** para que cada una tenga su propio catálogo de hoteles. Hasta recibir un tarifario distinto, CrocoCun conserva la misma banda de precios de Puerto Morelos.

## Orden de despliegue

1. Ejecutar en orden todas las migraciones de `supabase/migrations`, incluida `202608200001_direct_client_tariffs.sql`, en el SQL Editor de Supabase o con `supabase db push`.
2. Crear el usuario administrativo en Supabase Auth.
3. Insertar ese usuario en `app_users` como `owner`.
4. Configurar `SUPABASE_SECRET_KEY` con una clave `sb_secret_...` únicamente en Vercel y en el entorno local del servidor; nunca usar el prefijo `NEXT_PUBLIC_`. La aplicación también acepta temporalmente la clave heredada `SUPABASE_SERVICE_ROLE_KEY`.
5. Verificar que una reservación pública se registre una sola vez y aparezca en `/admon`.
6. Configurar las credenciales y webhooks de Mercado Pago Checkout Pro y PayPal Checkout siguiendo `PAYMENTS_SETUP.md`.
7. Configurar el proveedor de correo transaccional.
8. Revisar y aprobar las tarifas migradas, especialmente las dos celdas con `review_note`, y ejecutar pruebas de extremo a extremo.
