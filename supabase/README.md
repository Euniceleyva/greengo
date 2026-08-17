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

La tabla `pricing_rules` queda vacía intencionalmente. Las tarifas de `src/mocks/pricing.ts` están documentadas como valores ilustrativos y no deben migrarse a producción. El cliente debe aprobar las tarifas reales antes de habilitar pagos.

## Orden de despliegue

1. Ejecutar en orden las migraciones `202608170001`, `202608170002` y `202608170003` en el SQL Editor de Supabase.
2. Crear el usuario administrativo en Supabase Auth.
3. Insertar ese usuario en `app_users` como `owner`.
4. Configurar `SUPABASE_SECRET_KEY` con una clave `sb_secret_...` únicamente en Vercel y en el entorno local del servidor; nunca usar el prefijo `NEXT_PUBLIC_`. La aplicación también acepta temporalmente la clave heredada `SUPABASE_SERVICE_ROLE_KEY`.
5. Verificar que una reservación pública se registre una sola vez y aparezca en `/admon`.
6. Integrar Mercado Pago Checkout Pro y PayPal Checkout en modo de prueba y validar sus webhooks.
7. Configurar el proveedor de correo transaccional.
8. Cargar las tarifas reales aprobadas y ejecutar pruebas de extremo a extremo.
