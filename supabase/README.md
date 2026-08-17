# Supabase para GreenGo

La migración `migrations/202608170001_initial_booking_schema.sql` define únicamente el alcance productivo aprobado:

- reservaciones y cotizaciones del sitio público;
- intentos y confirmaciones de Mercado Pago;
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
- El pago solo se considera aprobado después de validar el webhook de Mercado Pago.

## Antes de cobrar

La tabla `pricing_rules` queda vacía intencionalmente. Las tarifas de `src/mocks/pricing.ts` están documentadas como valores ilustrativos y no deben migrarse a producción. El cliente debe aprobar las tarifas reales antes de habilitar pagos.

## Orden de despliegue

1. Ejecutar la migración completa en el SQL Editor de Supabase.
2. Crear el usuario administrativo en Supabase Auth.
3. Insertar ese usuario en `app_users` como `owner`.
4. Configurar las variables de entorno de Supabase solo en el servidor y en Vercel.
5. Sustituir `localStorage` por rutas de servidor para reservaciones y `/admon`.
6. Integrar Mercado Pago en modo de prueba y validar webhooks.
7. Configurar el proveedor de correo transaccional.
8. Cargar las tarifas reales aprobadas y ejecutar pruebas de extremo a extremo.
