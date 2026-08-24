# Plan de acción para refactorizar GreenGo Transfers

> **Estado de ejecución (actualizado 2026-08-21, segunda pasada):** Fases 0, 1, 2, 3, 4, 5, 6, 8 y 9 completadas o completadas con partes explícitamente pendientes de credenciales externas, en la rama `codex/refactor-eliminar-prototipo`. Fase 7 se dejó intacta (solo lectura) por decisión explícita — ninguna acción administrativa adicional se implementó por inferencia. Ver detalle de lo ejecutado al final de cada fase y en `README.md` §9.
>
> Decisiones tomadas en la primera pasada:
> - `/destinos/[slug]` se conserva como apoyo SEO de la LP.
> - Alcance de `/admon`: solo lectura y reporte (listado de reservaciones, estado de pago, exportación PDF). Cambiar estados, cancelar, reembolsar, editar tarifas, reenviar correos y notas internas siguen pendientes de aprobación explícita (Fase 7).
>
> Decisiones tomadas en la segunda pasada:
> - Fase 7: se mantiene `/admon` de solo lectura; no se agregó ninguna acción administrativa opcional.
> - Fase 6 (correo): código listo con Resend, sin credenciales reales — las notificaciones quedan encoladas en `notification_deliveries` sin enviarse hasta configurar `RESEND_API_KEY`/`RESEND_FROM_EMAIL`.
> - Fase 6 (pagos/seguridad): rate limiting, límites de tamaño y redacción de logs implementados; las pruebas de webhook en sandbox real y el Security Advisor de Supabase requieren credenciales que no están disponibles en este entorno de trabajo.
> - Fase 8: se autoalojaron las fuentes; la carga diferida del catálogo de hoteles se identificó pero no se implementó, para no arriesgar una regresión en un componente comercial sin verificación visual disponible.

## 1. Objetivo

Convertir el repositorio actual en un producto enfocado exclusivamente en:

- Landing Page comercial (`/`).
- Páginas de destino vinculadas a la adquisición orgánica (`/destinos/[slug]`), sujetas a confirmación comercial.
- Formulario de reservación (`/reservar`).
- Checkout (`/pago/checkout`).
- Confirmación de reservación y pago (`/pago/confirmacion`).
- Panel administrativo sencillo (`/admon` y `/admon/acceso`).
- APIs, base de datos e integraciones necesarias para reservaciones y pagos.

Todo el prototipo de administración operativa, flota, conductores, combustible, mantenimiento, monitoreo y contabilidad queda fuera del producto y debe retirarse del código.

La estrategia será una **refactorización incremental por sustracción**, no una reescritura. Se conservarán las partes productivas existentes y se eliminará el código heredado después de contar con pruebas mínimas de regresión.

---

## 2. Decisión tecnológica

### Stack que se conserva

| Capa | Tecnología | Uso |
|---|---|---|
| Aplicación web | Next.js 16 App Router + React 19 | LP, reservación, checkout, confirmación, panel y endpoints de servidor. |
| Lenguaje | TypeScript estricto | Contratos, validación y seguridad durante la refactorización. |
| Interfaz | Tailwind CSS + componentes propios | Mantener la UI existente sin rediseñar durante la limpieza. |
| Formularios | React Hook Form + Zod | Validación del flujo de reservación. |
| Estado cliente | Zustand, con alcance reducido | Borrador temporal de reservación y estado del chatbot. |
| Backend y datos | Supabase PostgreSQL | Reservaciones, tarifas, pagos, usuarios administrativos y auditoría. |
| Autenticación | Supabase Auth + `@supabase/ssr` | Acceso protegido a `/admon`. |
| Pagos | Mercado Pago Checkout Pro + PayPal Orders v2 | Checkout alojado por los proveedores y confirmación mediante webhooks. |
| Reportes | jsPDF + date-fns | Exportación PDF desde `/admon`. |
| Despliegue | Vercel + Supabase | Infraestructura recomendada para el alcance actual. |

### Tecnologías que no se incorporarán

- NestJS o un backend independiente.
- Prisma.
- Flutter.
- PostGIS.
- WebSockets.
- Traccar.
- Firebase Cloud Messaging.
- Microservicios o contenedores adicionales.

Estas tecnologías respondían al sistema completo de operación y flota, que ya no forma parte del alcance.

---

## 3. Arquitectura objetivo

La aplicación debe quedar organizada por dominios del producto:

```text
src/
├── app/
│   ├── page.tsx
│   ├── destinos/[slug]/
│   ├── reservar/
│   ├── pago/
│   │   ├── checkout/
│   │   └── confirmacion/
│   ├── admon/
│   │   ├── acceso/
│   │   └── page.tsx
│   └── api/
│       ├── reservations/
│       └── payments/
├── components/
│   ├── landing/
│   ├── reservar/
│   ├── pago/
│   ├── admon/
│   ├── shared/
│   └── ui/
├── data/
├── lib/
│   ├── payments/
│   ├── reservations/
│   └── supabase/
├── stores/
└── types/
```

Supabase será la fuente de verdad. El navegador no deberá decidir precios, confirmar pagos ni conservar información personal durante más tiempo del necesario.

---

## 4. Alcance de conservación y eliminación

### Conservar

- `src/app/page.tsx`.
- `src/app/reservar/`.
- `src/app/pago/`.
- `src/app/admon/`.
- `src/app/api/reservations/`.
- `src/app/api/payments/`.
- `src/app/destinos/[slug]/`, si se conservan las páginas SEO.
- `src/app/layout.tsx`, `globals.css`, `robots.ts` y `sitemap.ts`.
- Componentes de `landing`, `reservar`, `pago` y `admon`.
- Componentes compartidos y de UI que tengan consumidores dentro del alcance final.
- Lógica de pagos, reservaciones, tarifas y Supabase.
- Migraciones en `supabase/migrations/`.
- Activos públicos usados por la LP y los flujos transaccionales.
- Mocks que funcionen como contenido editorial o catálogos de la LP: destinos, FAQ, testimonios, galería, hoteles, aeropuertos, tours y chatbot.

### Eliminar después de verificar dependencias

- `src/app/(app)/admin/`.
- `src/app/(app)/driver/`.
- `src/app/(app)/demo/`.
- El layout de `src/app/(app)/` si deja de tener consumidores.
- `src/components/admin/`.
- `src/components/driver/`.
- `src/components/maps/`.
- `src/components/charts/`.
- `src/stores/demo-store.ts`.
- `src/stores/session-store.ts`.
- `src/lib/use-active-driver.ts`.
- `src/lib/driver-compliance.ts`.
- `src/lib/admin-permissions.ts`.
- `src/lib/admin-validation.ts`.
- `src/lib/reservation-to-trip.ts` si no tiene consumidores productivos.
- Mocks de vehículos, conductores, viajes simulados, combustible, mantenimiento, alertas, incidencias, contabilidad y pagos de vehículos.
- Tipos que solo correspondan al demo operativo.
- La variable `INTERNAL_SYSTEM_ENABLED` y la lógica que oculta `/admin`, `/driver` y `/demo`.

No se eliminará ningún archivo compartido únicamente por su ubicación. Antes de borrarlo se deberá comprobar que no sea importado por una ruta conservada.

---

## 5. Plan por fases

### Fase 0 — Congelar alcance y establecer una línea base ✅ Completada

### Acciones

1. Confirmar si `/destinos/[slug]` seguirá como apoyo SEO de la LP.
2. Definir qué significa “administración” para la primera versión:
   - solo lectura y reporte;
   - cambio de estado de reservación;
   - cancelaciones;
   - reembolsos;
   - reenvío de confirmaciones;
   - edición de tarifas.
3. Crear una rama de trabajo con prefijo `codex/` o el estándar acordado por el equipo.
4. Registrar el estado inicial de:
   - `npm run lint`;
   - `npm run build` en un entorno con acceso a Google Fonts;
   - flujo manual de LP a confirmación;
   - acceso y reporte de `/admon`.
5. No modificar tarifas ni migraciones durante la limpieza inicial.

### Criterio de aceptación

- El alcance funcional está documentado.
- Existe una lista de recorridos críticos que deben continuar funcionando.
- Se cuenta con un punto de retorno antes de comenzar eliminaciones.

**Ejecutado:** alcance de `/admon` (solo lectura y reporte) y de `/destinos/[slug]` (se conserva) confirmados con el responsable del producto. Rama de trabajo `codex/refactor-eliminar-prototipo` creada desde `main`. Línea base registrada: `npm run lint` sin errores; `npm run build` exitoso con 43 rutas (incluye `/admin`, `/driver`, `/demo`). No se tocaron tarifas ni migraciones.

---

### Fase 1 — Crear pruebas de protección ✅ Completada

### Acciones

1. Añadir Playwright para pruebas end-to-end.
2. Añadir Vitest para reglas de precio, validadores y transformaciones puras.
3. Cubrir como mínimo:
   - carga de la LP;
   - navegación de la LP a `/reservar` con parámetros;
   - validación de los cuatro pasos de reservación;
   - creación idempotente de una reservación;
   - reservación con tarifa y reservación que requiere cotización;
   - acceso no autenticado a `/admon`;
   - acceso autenticado con rol permitido y denegado;
   - visualización de reservaciones en `/admon`;
   - generación del reporte PDF;
   - consulta pública de estado mediante una referencia válida;
   - rechazo de referencias inválidas.
4. Simular proveedores de pago en las pruebas automáticas; reservar los sandbox reales para E2E de integración.

### Criterio de aceptación

- Los recorridos principales cuentan con pruebas repetibles.
- Las pruebas fallan si se rompe una ruta conservada.
- Las integraciones externas no son necesarias para ejecutar las pruebas locales ordinarias.

**Ejecutado:** Vitest (`vitest.config.ts`, `npm run test`) con 33 pruebas sobre `src/lib/reservations/pricing.ts` (tarifas legacy y por capacidad, recargo nocturno, reparto en camionetas) y `src/lib/schemas.ts` (validación de la reservación: fechas, teléfono, correo, idempotencia). Playwright (`playwright.config.ts`, `npm run test:e2e`, levanta `next dev` en `:3100`) con 10 pruebas: carga de la LP y verificación de que no quedan enlaces a `/admin`/`/driver`/`/demo`; navegación desde query params del mini-cotizador; validación de los 4 pasos de `/reservar`; creación idempotente de una reservación (red mockeada con `page.route`, sin escribir en Supabase); manejo del error del servidor; acceso no autenticado a `/admon` (redirige a `/admon/acceso`); 404 en `/admin`/`/driver`/`/demo`; rechazo de una referencia de pago con formato inválido; 404 de una referencia bien formada pero inexistente; y el estado vacío de `/pago/confirmacion` sin un borrador de reservación en sesión. No se cubrieron "acceso autenticado con rol permitido/denegado" ni "generación del reporte PDF" (requieren credenciales reales de Supabase Auth y no se creó un usuario de prueba); tampoco se probaron sandboxes reales de Mercado Pago/PayPal, según lo previsto por esta misma fase ("reservar los sandbox reales para E2E de integración").

---

### Fase 2 — Eliminar el prototipo operativo ✅ Completada

### Acciones

1. Generar el grafo de importaciones de las rutas que se conservarán.
2. Eliminar las rutas `/admin`, `/driver` y `/demo` junto con sus layouts.
3. Eliminar componentes exclusivos de esos módulos.
4. Eliminar stores, helpers, mocks y tipos exclusivos del demo.
5. Simplificar `src/proxy.ts` para que únicamente atienda la sesión de `/admon`.
6. Eliminar `INTERNAL_SYSTEM_ENABLED` de `.env.example` y de la documentación.
7. Revisar enlaces en LP, footer, sitemap y robots para evitar referencias a rutas eliminadas.
8. Ejecutar TypeScript, lint, pruebas y build después de cada grupo de eliminaciones.

### Criterio de aceptación

- `/admin`, `/driver` y `/demo` dejan de existir, no solo de estar ocultas.
- No quedan imports rotos ni referencias de navegación a las rutas retiradas.
- LP, reservación, pagos, confirmación y `/admon` conservan su comportamiento.

**Ejecutado:** se construyó el grafo real de importaciones desde cada punto de entrada conservado (`/`, `/reservar`, `/pago/*`, `/admon/*`, `/destinos/[slug]`, `layout.tsx`, `robots.ts`, `sitemap.ts`) para verificar, antes de borrar, qué archivos compartidos tenían consumidores reales. Se eliminaron `src/app/(app)/admin`, `src/app/(app)/driver`, `src/app/(app)/demo` y su layout; `components/admin`, `components/driver`, `components/maps`, `components/charts`; los componentes `shared`/`ui` sin consumidores (`avatar`, `badges`, `data-table`, `kpi-card`, `page-header`, `states`, `dialog`, `dropdown-menu`, `toast`); `stores/demo-store.ts` y `stores/session-store.ts`; `lib/admin-permissions.ts`, `lib/admin-validation.ts`, `lib/csv.ts`, `lib/driver-compliance.ts`, `lib/lookups.ts`, `lib/reservation-to-trip.ts`, `lib/use-active-driver.ts`; `services/admin-service-contract.ts`; y los mocks `accounting`, `alerts`, `drivers`, `fuel`, `incidents`, `maintenance`, `trips`, `users`, `vehicle-payments`, `vehicles`. `src/types/index.ts` y `src/constants/index.ts` se reescribieron para conservar solo los tipos/etiquetas usados por las rutas retenidas (se eliminaron `DemoUser`, `Vehicle`, `Driver`, `Trip`, `Alert`, `FuelRecord`, `MaintenanceRecord`, `Incident`, todos los tipos `Accounting*` y sus catálogos de etiquetas/colores asociados). `src/proxy.ts` quedó reducido a proteger únicamente `/admon/:path*`; se retiró `INTERNAL_SYSTEM_ENABLED` de `.env.example`. `robots.ts` ya no bloquea `/admin`, `/driver` ni `/demo` (dejaron de existir); se simplificaron dos condicionales muertos en `whatsapp-sticky.tsx` y `chatbot-widget.tsx` que comprobaban esas rutas. Verificado con `npm run lint` y `npm run build` sin errores tras el borrado (23 rutas finales) y con un recorrido manual (`curl`) confirmando 200 en `/`, `/reservar`, `/destinos/[slug]`, `/pago/checkout`; 307 en `/admon` (redirige a login); y 404 en `/admin`, `/driver`, `/demo`.

---

### Fase 3 — Depurar dependencias y código compartido ✅ Completada

### Dependencias candidatas a eliminar

- `leaflet`.
- `react-leaflet`.
- `@types/leaflet`.
- `recharts`.
- `motion`, si continúa sin importaciones reales.

### Dependencias que requieren revisión antes de decidir

- `gsap` y `@gsap/react`: conservar si se aprueban las animaciones actuales.
- `embla-carousel-react`: conservar si continúa la galería.
- `jspdf` y `jspdf-autotable`: conservar mientras `/admon` exporte PDF.
- `zustand`: conservar con alcance limitado al borrador y chatbot.

### Acciones adicionales

1. Eliminar componentes UI sin consumidores.
2. Separar tipos de reservación, pago y administración de los tipos heredados.
3. Eliminar utilidades y constantes sin referencias.
4. Consolidar contenido editorial y catálogos conservados bajo nombres que no sugieran datos productivos; por ejemplo, cambiar `mocks` por `content` o `catalogs` cuando corresponda.
5. Revisar el catálogo de hoteles para cargarlo de forma diferida y reducir JavaScript inicial.
6. Mantener Tailwind CSS en su versión actual durante esta fase. Una migración mayor deberá hacerse por separado.

### Criterio de aceptación

- `package.json` contiene únicamente dependencias utilizadas.
- No hay archivos TypeScript sin consumidores salvo entradas de framework, scripts o configuraciones justificadas.
- El bundle público no incluye mapas, gráficas ni datos del demo operativo.

**Ejecutado:** se removieron del `package.json` las dependencias sin consumidores tras la Fase 2: `leaflet`, `react-leaflet`, `@types/leaflet`, `recharts`, `motion`. Se revisaron `gsap`/`@gsap/react` (en uso: `landing-motion.tsx`, `landing-hero.tsx`, `confirmation-client.tsx`), `embla-carousel-react` (en uso: `components/ui/carousel.tsx`, galería de la LP), `jspdf`/`jspdf-autotable` (en uso mediante `import()` dinámico en `components/admon/services-summary.tsx` para la exportación PDF de `/admon` — se conservan) y `zustand` (en uso: `stores/reservation-store.ts`, `stores/chatbot-store.ts` — alcance ya reducido al borrador de reservación y al chatbot). No se realizó la renombrada de `mocks/` a `content/`/`catalogs/` ni la carga diferida del catálogo de hoteles: quedan pendientes para una sesión dedicada a no mezclar la eliminación masiva con cambios de nomenclatura o rendimiento. Verificado con `npm run lint` y `npm run build` sin errores después de desinstalar/reinstalar dependencias.

---

### Fase 4 — Reorganizar el dominio productivo ✅ Completada

### Acciones

1. Mantener la lógica de negocio fuera de componentes visuales.
2. Definir módulos claros para:
   - cotización y tarifas;
   - creación de reservaciones;
   - intentos de pago;
   - recepción de webhooks;
   - consulta administrativa;
   - notificaciones transaccionales.
3. Mantener Supabase como fuente de verdad para importes y estados.
4. Evitar duplicar nombres, ubicaciones y tarifas entre catálogos del cliente y tablas productivas.
5. Documentar los estados válidos y sus transiciones:
   - reservación;
   - pago;
   - entrega de correos.
6. Asegurar que las funciones de servidor no dependan del store del navegador.

### Criterio de aceptación

- Los precios se calculan exclusivamente en servidor.
- Una recarga o cambio de navegador no puede alterar el importe de una reservación existente.
- Los estados de pago solo se actualizan a partir de respuestas verificadas de los proveedores.

**Ejecutado:** se extrajo `src/lib/reservations/pricing.ts` (funciones puras: `calculateLeg`, `selectRule`, `splitPassengersIntoVans`, `isNightTime`) de `create-reservation.ts`, que ahora solo orquesta Supabase y llama a `pricing.ts` — separación que además hizo posible testear las tarifas con Vitest sin mockear la base de datos. Se creó `src/lib/notifications/` (`queue.ts`, `templates.ts`, `resend-client.ts`) como módulo de notificaciones transaccionales. Los módulos de pagos (`src/lib/payments/core.ts`, `mercado-pago.ts`, `paypal.ts`) y de consulta administrativa (`src/app/admon/page.tsx`, `src/components/admon/services-summary.tsx`) ya estaban separados desde la primera pasada. Se documentaron estados y transiciones de reservación, pago y notificación en [`docs/ESTADOS.md`](docs/ESTADOS.md). De paso se eliminó código muerto detectado durante la reorganización: `tripSchema`/`fuelSchema`/`incidentSchema` en `schemas.ts` (leftovers del demo sin consumidores) y `routeLengthKm`/`interpolateRoute` (`geo.ts`), `formatDateTime`/`timeAgo` (`format.ts`). Los precios ya se calculaban exclusivamente en servidor desde la primera pasada (no se modificó esa lógica, solo se reorganizó).

---

### Fase 5 — Reducir y proteger el estado del navegador ✅ Completada

### Acciones

1. Revisar `reservation-store.ts` para no persistir indefinidamente nombre, correo y teléfono en `localStorage`.
2. Elegir una de estas estrategias:
   - persistir únicamente servicio, ruta, fecha y pasajeros;
   - usar `sessionStorage` con expiración;
   - crear un borrador en servidor al comenzar a capturar datos personales.
3. Limpiar el borrador después de una confirmación exitosa.
4. Evitar que una reservación confirmada dependa de información disponible solamente en el navegador.
5. Añadir una versión al formato persistido para poder invalidar borradores incompatibles.

### Criterio de aceptación

- No queda información personal persistida indefinidamente.
- El usuario puede recargar durante el formulario sin provocar reservaciones duplicadas.
- La confirmación se reconstruye desde una referencia segura y datos del servidor.

**Ejecutado:** `reservation-store.ts` cambió de `localStorage` a `sessionStorage` (estrategia 2 de las listadas): el borrador ya no sobrevive al cierre del navegador, pero sí sobrevive a la redirección de ida y vuelta a Mercado Pago/PayPal porque ocurre en la misma pestaña. Se añadió `version: 1` con una función `migrate` que descarta cualquier borrador antiguo persistido en `localStorage` bajo la misma clave (`greengo-reservation-draft`) en vez de migrarlo, para no arrastrar datos de contacto guardados antes de este cambio. No se implementó la opción de "persistir solo servicio/ruta/fecha/pasajeros" por separado ni un borrador en servidor: se consideró que `sessionStorage` ya cumple el criterio de aceptación ("no persistencia indefinida") sin necesitar una llamada de red adicional en cada tecleo del formulario, y sin romper la lectura del resumen en `/pago/confirmacion` (que sí necesita nombre/correo/teléfono para mostrarse). La idempotencia ante recargas ya existía desde la primera pasada vía `submissionKey` + `submission_key` único en la tabla `reservations`.

---

### Fase 6 — Completar la preparación para producción (parcial — ver detalle por bloque)

### Seguridad y abuso

1. Añadir rate limiting a creación de reservaciones, creación de pagos y consulta de estado.
2. Añadir protección anti-bot o CAPTCHA al envío final de la reservación.
3. Establecer límites de tamaño para cuerpos JSON y campos de texto.
4. Revisar logs para evitar correos, teléfonos, secretos o payloads completos de proveedores.
5. Confirmar que `SUPABASE_SECRET_KEY` nunca llegue al bundle del navegador.
6. Ejecutar las recomendaciones del Security Advisor de Supabase.

### Pagos

1. Verificar las dos tarifas marcadas con `review_note` antes de cobrar.
2. Probar Mercado Pago y PayPal en sandbox.
3. Verificar firmas de todos los webhooks.
4. Probar reenvío del mismo webhook y confirmar idempotencia.
5. Cubrir estados pendiente, aprobado, rechazado, cancelado y reembolsado.
6. Definir la operación para pagos aprobados sin reservación confirmada y viceversa.
7. Crear una vista administrativa de eventos fallidos si será necesaria para soporte.

### Correos

1. Seleccionar un proveedor de correo transaccional.
2. Procesar la cola `notification_deliveries`.
3. Implementar plantillas para:
   - reservación recibida;
   - pago aprobado;
   - pago pendiente o fallido;
   - aviso administrativo de nueva reservación;
   - cancelación o reembolso.
4. Añadir reintentos controlados e idempotencia por mensaje.

### Observabilidad

1. Registrar errores de aplicación y webhooks con un identificador de correlación.
2. Configurar alertas para fallos repetidos de pagos y correos.
3. Definir métricas mínimas: reservaciones iniciadas, completadas, pagadas y fallidas.

### Criterio de aceptación

- Una reservación real puede completarse de extremo a extremo en sandbox.
- La confirmación depende del webhook y no solamente del retorno del navegador.
- El cliente y el administrador reciben las notificaciones esperadas.
- Los errores operativos pueden detectarse y diagnosticarse.

**Ejecutado — Seguridad y abuso:** rate limiting en memoria por IP (`src/lib/rate-limit.ts`, aplicado en `/api/reservations` 8/5min, `/api/payments/*/checkout` 10/5min, `/api/payments/status` 30/min) y límite de tamaño de body JSON (`src/lib/http-guards.ts`, 20 KB en reservaciones, 2 KB en checkout). Los `console.error` de las rutas de servidor ya no imprimen el objeto de error completo, solo `error.message`. `SUPABASE_SECRET_KEY` solo se lee en módulos con `"server-only"` (`src/lib/supabase/admin.ts`), sin cambios necesarios porque ya era así desde la primera pasada. **Pendiente:** protección anti-bot/CAPTCHA en el envío final (requiere elegir y contratar un proveedor, p. ej. Turnstile o hCaptcha) y ejecutar el Security Advisor de Supabase (requiere acceso al proyecto de producción). El rate limiting es en memoria por proceso: si se despliega en múltiples instancias/regiones, el límite efectivo puede ser más alto que el configurado — documentado como advertencia en el propio archivo.

**Ejecutado — Pagos:** ninguna verificación con sandbox real de Mercado Pago/PayPal se pudo ejecutar en este entorno de trabajo (no hay credenciales de prueba disponibles). El código ya cubre `pendiente`/`aprobado`/`rechazado`/`cancelado`/`reembolsado` desde la primera pasada (`applyProviderPayment`), incluyendo idempotencia ante reenvío del mismo webhook (`beginWebhookEvent` con restricción única `provider + provider_event_id + action`) — ver `docs/ESTADOS.md`. **Pendiente:** aprobar las dos tarifas con `review_note`, pruebas reales en sandbox, y decidir explícitamente qué hacer ante un pago aprobado sin reservación confirmada (o viceversa) más allá de lo que ya hace `applyProviderPayment` — no se tomó una decisión de producto nueva sobre este caso en esta pasada.

**Ejecutado — Correos:** proveedor elegido y codificado: Resend (`src/lib/notifications/resend-client.ts`, vía `fetch`, sin SDK adicional). `processNotificationQueue()` procesa hasta 20 filas de `notification_deliveries` por ejecución, con reintentos (máximo 5 intentos) e idempotencia (cada fila se marca `sent` una sola vez). Las 5 plantillas de `notification_kind` están en `src/lib/notifications/templates.ts`. Sin `RESEND_API_KEY`/`RESEND_FROM_EMAIL` reales, la cola quedó sin probarse de extremo a extremo con envíos reales — ver `EMAIL_SETUP.md` para la prueba mínima pendiente.

**Ejecutado — Observabilidad:** no se implementó en esta pasada. Los errores se registran con `console.error` (mensaje, sin correlación entre solicitudes) y no hay alertas ni métricas configuradas; requiere elegir una herramienta (p. ej. Sentry, Vercel Observability) y no se tomó esa decisión por inferencia.

---

### Fase 7 — Ajustar `/admon` al alcance aprobado (decisión explícita: mantener solo lectura)

### Funcionalidad mínima recomendada

- Inicio de sesión real.
- Listado y filtro de reservaciones.
- Datos del cliente y recorrido.
- Importe y estado de pago.
- Estado de reservación.
- Exportación PDF.
- Cierre de sesión.

### Funcionalidad opcional que requiere aprobación explícita

- Cambiar estados manualmente.
- Cancelar reservaciones.
- Iniciar reembolsos.
- Editar tarifas.
- Reenviar correos.
- Añadir notas internas.
- Exportar CSV.
- Crear reservaciones manuales.

No se implementarán estas acciones por inferencia. Cada una afecta operación, permisos, auditoría o pagos y debe formar parte del alcance comercial.

### Criterio de aceptación

- El panel solo expone acciones autorizadas para la primera versión.
- Los usuarios inactivos o sin rol permitido no pueden consultar reservaciones.
- Toda acción que cambie información sensible queda registrada en `audit_log`.

**Ejecutado:** ninguna acción de la lista opcional se agregó — decisión explícita confirmada para esta pasada (no se implementa por inferencia, tal como pide esta misma fase). La funcionalidad mínima recomendada ya estaba completa desde la primera pasada (login real con Supabase Auth, listado/filtro, datos de cliente y recorrido, importe y estado de pago, estado de reservación, exportación PDF, cierre de sesión) y no se modificó. La tabla `audit_log` existe en el esquema desde la primera pasada pero no tiene escritores todavía porque no hay acciones que auditar sin las funciones opcionales de esta fase.

---

### Fase 8 — Rendimiento, SEO y construcción reproducible (parcial)

### Acciones

1. Medir el JavaScript inicial de `/` y `/reservar` después de retirar el demo.
2. Cargar diferidamente el catálogo de hoteles y widgets no críticos.
3. Comprobar metadatos, sitemap, robots y datos estructurados.
4. Revisar el peso de imágenes y video del hero.
5. Decidir si las cuatro fuentes actuales son necesarias.
6. Autoalojar las fuentes finales con `next/font/local` para evitar depender de Google Fonts durante el build.
7. Ejecutar Lighthouse en móvil para LP y reservación.

### Criterio de aceptación

- El build no depende de descargar fuentes externas.
- La LP conserva metadatos y páginas de adquisición aprobadas.
- No se cargan librerías del panel o pagos antes de necesitarlas.

**Ejecutado:** las 4 familias tipográficas (Poppins, Inter, Fredoka, Lexend) se descargaron una sola vez del subset `latin` de Google Fonts y se autoalojan desde `public/fonts/` vía `next/font/local` en `src/app/layout.tsx`; `npm run build` ya no hace ninguna solicitud a `fonts.googleapis.com`/`fonts.gstatic.com`. Metadatos, sitemap y robots no cambiaron respecto a la primera pasada (ya estaban correctos). **Pendiente:** cargar diferidamente `src/mocks/hotels.ts` (~1400 líneas) en el mini-cotizador de la LP — se identificó como la optimización de mayor impacto restante (ver nota en README §3), pero no se implementó por el riesgo de regresión en un componente comercial sin poder verificarlo visualmente en un navegador en este entorno de trabajo; revisar el peso de imágenes/video del hero; y ejecutar Lighthouse en móvil, que requiere un navegador real.

---

### Fase 9 — Reescribir documentación y preparar entrega ✅ Completada

### Acciones

1. Reemplazar el README centrado en el DEMO por documentación del producto real.
2. Actualizar el requisito a Node.js 20.9 o superior.
3. Documentar:
   - alcance vigente;
   - arquitectura;
   - rutas;
   - variables de entorno;
   - migraciones;
   - configuración de pagos;
   - configuración de correos;
   - ejecución local;
   - pruebas;
   - despliegue y rollback.
4. Eliminar instrucciones, usuarios y credenciales simuladas.
5. Mantener `.env.example` sin valores secretos.
6. Crear un checklist de lanzamiento.

### Criterio de aceptación

- Una persona nueva puede levantar el proyecto siguiendo únicamente el README.
- La documentación no menciona módulos eliminados.
- Los procedimientos de pago y despliegue coinciden con el código vigente.

**Ejecutado:** README reescrito íntegramente para el producto real desde la primera pasada, y ampliado en esta segunda con secciones de pruebas (§11), variables de entorno (§12) y despliegue/rollback (§13). `package.json` ahora declara `"engines": { "node": ">=20.9.0" }` y el README pide Node 20.9+. Se documentaron arquitectura, rutas, migraciones (`supabase/README.md`), pagos (`PAYMENTS_SETUP.md`), correo (`EMAIL_SETUP.md`, nuevo) y estados/transiciones (`docs/ESTADOS.md`, nuevo). No quedan usuarios ni credenciales simuladas en la documentación (la sección de "Credenciales simuladas" del README original se eliminó en la primera pasada). `.env.example` sigue sin valores secretos reales, solo placeholders. Checklist de lanzamiento creado en [`CHECKLIST_LANZAMIENTO.md`](CHECKLIST_LANZAMIENTO.md).

---

## 6. Orden recomendado de ejecución

1. ✅ Confirmar alcance y capacidades de `/admon`.
2. ✅ Crear pruebas de protección.
3. ✅ Eliminar rutas y componentes del demo.
4. ✅ Eliminar stores, mocks, tipos y dependencias huérfanas.
5. ✅ Reorganizar los dominios productivos.
6. ✅ Reducir datos persistidos en el navegador.
7. ⚠️ Completar seguridad, correo, pagos y observabilidad — código listo; sandbox de pagos, envío real de correo, Security Advisor y observabilidad quedan pendientes de credenciales/decisiones que no correspondía tomar por inferencia.
8. ⚠️ Optimizar rendimiento y fuentes — fuentes autoalojadas; carga diferida del catálogo de hoteles y Lighthouse pendientes.
9. ✅ Reescribir documentación.
10. ⚠️ Ejecutar pruebas sandbox y checklist de lanzamiento — el checklist existe (`CHECKLIST_LANZAMIENTO.md`); ejecutarlo con credenciales reales queda para quien las tenga.

No se recomienda mezclar en un mismo cambio la eliminación masiva, una migración de Tailwind y cambios funcionales de pagos. Cada grupo debe poder revisarse y revertirse de forma independiente.

---

## 7. Validación obligatoria en cada fase

Ejecutar:

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```

Los scripts de pruebas se añadirán en la Fase 1. Además, realizar un recorrido manual en móvil y escritorio de:

1. LP.
2. Cotización rápida.
3. Reservación completa.
4. Checkout de Mercado Pago.
5. Checkout de PayPal.
6. Confirmación de pago.
7. Inicio de sesión administrativo.
8. Consulta y exportación de reservaciones.

---

## 8. Riesgos principales y mitigación

| Riesgo | Mitigación |
|---|---|
| Eliminar un componente compartido usado por la LP | Auditar importaciones y ejecutar build después de cada grupo. |
| Romper precios al limpiar mocks | No modificar migraciones o cálculo productivo durante la eliminación. |
| Duplicar reservaciones o cobros | Mantener claves de idempotencia y probar reintentos. |
| Confirmar pagos por el retorno del navegador | Conservar el webhook verificado como única confirmación definitiva. |
| Exponer la clave secreta de Supabase | Usarla solo en módulos `server-only` y variables sin prefijo `NEXT_PUBLIC_`. |
| Conservar datos personales en el navegador | Reducir persistencia, añadir expiración y limpiar tras confirmar. |
| Convertir `/admon` en un panel no presupuestado | Aprobar explícitamente cada acción administrativa adicional. |
| Introducir demasiados cambios simultáneos | Separar limpieza, endurecimiento, UI y actualizaciones mayores. |

---

## 9. Definición de terminado

Estado de cada criterio al cierre de esta segunda pasada:

- ✅ Solo existen las rutas aprobadas.
- ✅ No queda código funcional del demo operativo.
- ✅ No quedan dependencias sin uso (`leaflet`, `react-leaflet`, `recharts`, `motion` removidas; `jspdf`/`gsap`/`embla-carousel-react`/`zustand` confirmadas en uso).
- ✅ LP, reservación, checkout, confirmación y `/admon` (acceso) están cubiertos por pruebas automatizadas (Vitest + Playwright con red mockeada). ⚠️ No cubierto: generación real del PDF ni acceso autenticado con rol permitido/denegado (requieren un usuario de prueba real en Supabase Auth).
- ✅ Los importes se calculan y validan en servidor (desde la primera pasada; reorganizado en `src/lib/reservations/pricing.ts` en esta pasada).
- ⚠️ Los webhooks son firmados e idempotentes en el código, pero **no están probados contra un sandbox real** en este entorno de trabajo (sin credenciales de Mercado Pago/PayPal disponibles).
- ⚠️ El flujo de correo transaccional está **codificado y encolando correctamente**, pero no está activo de extremo a extremo sin `RESEND_API_KEY`/`RESEND_FROM_EMAIL` reales.
- ✅ La información personal no se conserva indefinidamente en el navegador (`sessionStorage` en vez de `localStorage`).
- ✅ Lint, pruebas (`npm run test`, `npm run test:e2e`) y build terminan sin errores.
- ✅ El README describe el producto real, incluyendo las partes pendientes de credenciales.
- ✅ Existe un checklist para desplegar a producción ([`CHECKLIST_LANZAMIENTO.md`](CHECKLIST_LANZAMIENTO.md)), pendiente de que alguien con las credenciales reales lo ejecute y lo apruebe.

---

## 10. Entregables esperados

1. ✅ Repositorio sin el prototipo de operación, conductores y flota.
2. ✅ `package.json` y lockfile depurados.
3. ✅ Suite mínima de pruebas unitarias y end-to-end (Vitest + Playwright).
4. ✅ Flujo de reservación y pagos endurecido (rate limiting, límites de tamaño, logs sin PII); ⚠️ pendiente de prueba contra sandbox real.
5. ✅ Panel `/admon` — se mantiene deliberadamente en el alcance mínimo aprobado (solo lectura), sin acciones administrativas adicionales.
6. ⚠️ Proveedor de correo transaccional codificado (Resend) y plantillas implementadas; **configuración de credenciales reales pendiente** (`EMAIL_SETUP.md`).
7. ✅ README actualizado.
8. ✅ Checklist de despliegue, sandbox, producción y rollback (`CHECKLIST_LANZAMIENTO.md`), pendiente de ejecución con credenciales reales.
