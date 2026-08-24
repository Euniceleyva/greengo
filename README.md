# GreenGo Transfers Cancún

> **Landing Page comercial, reservación y pagos para traslados turísticos en Cancún**, con un panel administrativo mínimo de solo lectura.

---

## 1. Descripción

**Producto.** Un sitio público donde un visitante puede conocer el servicio de traslados de GreenGo, cotizar y reservar en línea, pagar con Mercado Pago o PayPal, y recibir confirmación. Un pequeño panel interno (`/admon`) permite al equipo de GreenGo consultar y exportar las reservaciones recibidas.

**Tipos de servicio de traslado.**

1. **Hotel a hotel.**
2. **Aeropuerto ↔ hotel / aeropuerto → destino turístico.**
3. **Transporte abierto:** renta de vehículo con chofer durante un periodo determinado.
4. **Soluciones a medida:** servicios personalizados, recepción especial y descuentos.

**Nota histórica.** Este repositorio comenzó como un prototipo navegable con datos simulados que incluía un panel de operación completo (flota, conductores, combustible, mantenimiento, monitoreo GPS, contabilidad) para validar módulos con el cliente. Esa parte del prototipo fue **retirada del código** (ver [`PLAN_REFACTORIZACION.md`](PLAN_REFACTORIZACION.md)); el producto actual se enfoca exclusivamente en adquisición, reservación, pago y un panel administrativo de consulta.

---

## 2. Alcance actual

- **Landing Page (`/`)** con hero, cotizador rápido, carrusel, tipos de servicio, destinos, testimonios, FAQ y footer.
- **Páginas de destino (`/destinos/[slug]`)** — 6 páginas estáticas (SSG) para SEO/adquisición orgánica.
- **Reservación (`/reservar`)** — formulario multi-paso (React Hook Form + Zod), con borrador en `localStorage`.
- **Pago (`/pago/checkout`, `/pago/confirmacion`)** — Mercado Pago Checkout Pro y PayPal Orders v2, creación de pagos en servidor, redirección al proveedor, webhooks firmados e idempotentes.
- **Panel administrativo (`/admon`)** — acceso protegido con Supabase Auth (`/admon/acceso`), listado de reservaciones con su estado de pago y exportación a PDF. Es de **solo lectura**: no permite cambiar estados, cancelar, reembolsar ni editar tarifas desde esta versión.
- **Backend:** Supabase (PostgreSQL + Auth) es la fuente de verdad para reservaciones, tarifas y pagos. Los precios se calculan y validan en servidor.
- **Notificaciones transaccionales:** cola en `notification_deliveries`, envío vía Resend (ver [`EMAIL_SETUP.md`](EMAIL_SETUP.md)). Sin credenciales de Resend, las notificaciones quedan encoladas sin enviarse; nada se pierde.
- **Seguridad de API:** rate limiting y límites de tamaño de body en `/api/reservations` y `/api/payments/*` (`src/lib/rate-limit.ts`, `src/lib/http-guards.ts`).

Los cobros permanecen inactivos hasta aplicar las migraciones y configurar credenciales y webhooks; consulta `PAYMENTS_SETUP.md`.

---

## 3. Fuera de alcance

- Panel de operación de flota: monitoreo GPS, conductores, vehículos, combustible, mantenimiento, alertas, contabilidad interna. Este módulo fue parte del prototipo original y se retiró del código; ver §9 y `PLAN_REFACTORIZACION.md` si se retoma en el futuro.
- Acciones administrativas más allá de consulta y exportación (cambiar estado, cancelar, reembolsar, editar tarifas, reenviar correos, notas internas, exportar CSV, crear reservaciones manuales): requieren aprobación explícita antes de implementarse (ver `PLAN_REFACTORIZACION.md`, Fase 7).
- App móvil nativa del conductor, WebSockets, Traccar, PostGIS, NestJS, Prisma, Firebase Cloud Messaging: no forman parte de este producto.
- Carga diferida del catálogo de hoteles del mini-cotizador (`src/mocks/hotels.ts`, ~1400 líneas): identificada como oportunidad de rendimiento pero no implementada, para no arriesgar una regresión en un componente comercial sin verificación visual disponible en esta pasada.
- Auditoría Lighthouse formal en móvil: pendiente de ejecutar en un entorno con navegador real antes de lanzar.

---

## 4. Stack técnico

| Capa | Tecnología | Uso |
|---|---|---|
| Aplicación web | Next.js (App Router) + React + TypeScript | LP, reservación, checkout, confirmación, panel y endpoints de servidor. |
| Estilos | Tailwind CSS | UI. |
| Iconos | Lucide React | — |
| Formularios | React Hook Form + Zod | Validación del flujo de reservación. |
| Estado cliente | Zustand (`persist` a `sessionStorage`) | Borrador de reservación (sin persistencia indefinida de datos de contacto) y estado del chatbot. |
| Fechas | date-fns | — |
| Animación | GSAP + `@gsap/react` | Reveals de la Landing Page y confirmación de pago. |
| Carrusel | Embla Carousel | Galería de la LP. |
| Backend y datos | Supabase PostgreSQL | Reservaciones, tarifas, pagos, usuarios administrativos. |
| Autenticación | Supabase Auth + `@supabase/ssr` | Acceso protegido a `/admon`. |
| Pagos | Mercado Pago Checkout Pro + PayPal Orders v2 | Checkout alojado por los proveedores y confirmación mediante webhooks. |
| Correo transaccional | Resend (vía `fetch`, sin SDK) | Confirmaciones, avisos de pago y reembolso; ver `EMAIL_SETUP.md`. |
| Reportes | jsPDF + jspdf-autotable | Exportación PDF desde `/admon`. |
| Pruebas | Vitest (unitarias) + Playwright (E2E, con red mockeada) | Ver §12. |
| Fuentes | Poppins, Inter, Fredoka, Lexend autoalojadas (`next/font/local`, `public/fonts/`) | El build no depende de fonts.googleapis.com. |

> **Google Maps y Leaflet no se usan** en este producto (no hay mapas ni monitoreo GPS en el alcance actual).

---

## 5. Identidad visual

**Paleta de marca.**

| Rol | Color | Hex | Uso |
|-----|-------|-----|-----|
| Primario | 🟢 Verde GreenGo | `#29876B` | Marca principal: botones primarios, enlaces, `--ring`. |
| Secundario / acento cálido | 🟠 Naranja | `#F68634` | Acentos cálidos, `bg-brand-orange`. |
| Acento | 🔵 Azul | `#00AFEE` | Acento informativo, `--accent`, `bg-brand-blue`. |
| Highlight | 🟩 Verde lima | `#A8CE46` | Detalles de apoyo, `bg-brand-lime`. |

Variables CSS en `src/app/globals.css`. Tokens semánticos de shadcn (`--primary`, `--accent`, `--secondary`, `--muted`, `--border`, etc.) recalculados en tonos verdes/neutros.

**Logo.** `public/images/logos/logo_anterior_color.png`.

**Tipografía.** Poppins (`--font-heading`) para títulos; Inter (`--font-body`, `font-sans`) para texto de cuerpo.

---

## 6. Roles

| Rol | Descripción | En este producto |
|-----|-------------|-------------------|
| Administrador / operador | Consulta reservaciones, su estado de pago y exporta reportes. | ✅ `/admon` (solo lectura). |
| Cliente / visitante | Cotiza y reserva un traslado, paga en línea. | ✅ `/`, `/reservar`, `/pago/*`. |
| Conductor | Ejecuta el traslado. | Fuera de alcance de este repositorio (no hay app ni panel de conductor). |

**Acceso a `/admon`.** Requiere una cuenta real de Supabase Auth (sin usuarios simulados ni credenciales de demostración).

---

## 7. Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Landing Page comercial. |
| `/reservar` | Formulario de reserva multi-paso. Acepta query params (`origin`, `destination`, `date`, `time`, `passengers`, `serviceType`, `hotel`, `notes`) para prellenar desde el mini-cotizador de la LP. |
| `/pago/checkout` | Checkout con redirección a Mercado Pago o PayPal. |
| `/pago/confirmacion` | Confirmación de la reservación y consulta del estado validado por webhook. |
| `/destinos/[slug]` | Página individual por destino (6 páginas estáticas). |
| `/admon/acceso` | Inicio de sesión del panel administrativo. |
| `/admon` | Listado de reservaciones, estado de pago y exportación PDF (solo lectura). |
| `/api/reservations` | Creación de reservaciones (rate limit: 8/5min por IP). |
| `/api/payments/*/checkout` | Creación del intento de pago y URL de checkout (rate limit: 10/5min por IP). |
| `/api/payments/*/webhook` | Webhooks firmados de Mercado Pago / PayPal. |
| `/api/payments/status` | Consulta pública de estado de pago por referencia (rate limit: 30/min por IP). |
| `/api/internal/notifications/process` | Reintento de la cola de correo transaccional; protegido con `CRON_SECRET`. |

---

## 8. Estructura del proyecto

```text
src/
├── app/
│   ├── layout.tsx               # Root layout: <html>, fuentes autoalojadas, metadata base, WA sticky + chatbot
│   ├── page.tsx                 # Landing Page comercial
│   ├── reservar/                # Formulario de reserva multi-paso
│   ├── pago/
│   │   ├── checkout/            # Selector de Mercado Pago / PayPal
│   │   └── confirmacion/        # Estado de reservación y pago
│   ├── destinos/[slug]/         # Páginas de destino individuales (SSG)
│   ├── admon/                   # Panel administrativo (acceso + listado/reporte)
│   └── api/
│       ├── reservations/
│       ├── payments/
│       └── internal/notifications/process/   # Reintento de la cola de correo (protegido con CRON_SECRET)
├── components/
│   ├── landing/                 # Componentes de la Landing Page
│   ├── reservar/                # Pasos del formulario de reserva
│   ├── pago/                    # Checkout y confirmación de pago
│   ├── admon/                   # Listado/reporte del panel
│   ├── shared/                  # Reutilizables (WA sticky, chatbot, idioma…)
│   └── ui/                      # Primitivas estilo shadcn/ui
├── mocks/                       # Contenido editorial/catálogos de la LP (destinos, FAQ, testimonios, galería, hoteles, aeropuertos, tours, chatbot, tarifas, ubicaciones)
├── stores/                      # Zustand: borrador de reservación (sessionStorage) y estado del chatbot
├── types/                       # Tipos centralizados (reservación, pago, catálogos de la LP)
├── lib/
│   ├── reservations/            # pricing.ts (cálculo puro, testeado) + create-reservation.ts (orquestación)
│   ├── payments/                # core.ts, mercado-pago.ts, paypal.ts
│   ├── notifications/           # queue.ts, templates.ts, resend-client.ts
│   ├── supabase/                # Clientes admin/server/client + middleware de sesión
│   ├── rate-limit.ts, http-guards.ts   # Rate limiting y límites de tamaño de body
│   └── schemas.ts                # Validación Zod del formulario de reserva
└── constants/                   # Catálogos y etiquetas compartidos
```

Ver [`docs/ESTADOS.md`](docs/ESTADOS.md) para el detalle de estados y transiciones de reservación, pago y notificación.

---

## 9. Historial de la refactorización

Este repositorio inició como un prototipo navegable (frontend con mocks) que representaba un sistema de operación completo (dashboard, monitoreo GPS, flota, conductores, combustible, mantenimiento, alertas, contabilidad) además de la Landing Page y el flujo de reservación/pago. Ese prototipo cumplió su objetivo de validación con el cliente y fue retirado del código en una refactorización por sustracción (ver [`PLAN_REFACTORIZACION.md`](PLAN_REFACTORIZACION.md) para el detalle completo):

- Se eliminaron las rutas `/admin`, `/driver` y `/demo`, sus layouts, componentes (`components/admin`, `components/driver`, `components/maps`, `components/charts`), stores (`demo-store`, `session-store`), helpers (`admin-permissions`, `admin-validation`, `driver-compliance`, `use-active-driver`, `reservation-to-trip`, `csv`, `lookups`) y el contrato `services/admin-service-contract.ts`.
- Se eliminaron los mocks exclusivos del demo operativo (`vehicles`, `drivers`, `trips`, `alerts`, `fuel`, `maintenance`, `incidents`, `accounting`, `vehicle-payments`, `users`) y los tipos correspondientes en `src/types/index.ts`.
- Se retiró la variable `INTERNAL_SYSTEM_ENABLED` y se simplificó `src/proxy.ts` para que solo proteja la sesión de `/admon`.
- Se depuraron dependencias sin consumidores: `leaflet`, `react-leaflet`, `@types/leaflet`, `recharts`, `motion`. Se conservó `jspdf`/`jspdf-autotable` (exportación PDF de `/admon`), `gsap`/`@gsap/react` (animaciones de la LP y confirmación de pago), `embla-carousel-react` (galería) y `zustand` (borrador de reservación y chatbot).
- Verificado con `npm run lint` y `npm run build` sin errores, y recorrido manual de `/`, `/reservar`, `/destinos/[slug]`, `/pago/checkout`, `/admon` (redirige a `/admon/acceso` sin sesión) y confirmación de que `/admin`, `/driver` y `/demo` ya no existen (404).

**Segunda pasada — fases 1 y 4 a 9 del plan:**

- **Pruebas (Fase 1):** Vitest para `src/lib/reservations/pricing.ts` y `src/lib/schemas.ts` (33 pruebas); Playwright para LP, flujo completo de reservación (con `/api/reservations` y proveedores de pago mockeados vía `page.route`, sin tocar Supabase ni sandboxes reales), acceso a `/admon` y consulta pública de estado (10 pruebas). Ver `npm run test` / `npm run test:e2e`.
- **Dominio (Fase 4):** se extrajo `src/lib/reservations/pricing.ts` (cálculo de tarifas, funciones puras) de `create-reservation.ts` (orquestación con Supabase); se creó `src/lib/notifications/` (cola, plantillas, cliente Resend); se documentaron estados y transiciones en `docs/ESTADOS.md`; se eliminaron `tripSchema`/`fuelSchema`/`incidentSchema` y dos funciones de `src/lib/geo.ts`/`format.ts` que habían quedado sin consumidores tras la primera pasada.
- **Estado del navegador (Fase 5):** `reservation-store.ts` pasó de `localStorage` a `sessionStorage` (se borra al cerrar el navegador, sobrevive a la redirección de ida y vuelta a Mercado Pago/PayPal en la misma pestaña) y se versionó el formato persistido, invalidando cualquier borrador antiguo en `localStorage`.
- **Seguridad (Fase 6):** rate limiting en memoria (`src/lib/rate-limit.ts`) y límite de tamaño de body (`src/lib/http-guards.ts`) en `/api/reservations` y `/api/payments/*`; los `console.error` de rutas de servidor ya no imprimen objetos de error completos, solo el mensaje. Pendiente de credenciales reales: pruebas de webhook en sandbox de Mercado Pago/PayPal y ejecución del Security Advisor de Supabase.
- **Correo transaccional (Fase 6):** cola sobre `notification_deliveries` con cliente Resend (`src/lib/notifications/`), encolado automático al crear una reservación y al cambiar el estado de un pago, endpoint de reintento protegido con `CRON_SECRET` y cron declarado en `vercel.json`. Sin `RESEND_API_KEY`/`RESEND_FROM_EMAIL` reales, el código no envía correos pero tampoco falla: las filas quedan en `queued`. Ver `EMAIL_SETUP.md`.
- **Rendimiento (Fase 8):** las 4 familias tipográficas (Poppins, Inter, Fredoka, Lexend) se autoalojan con `next/font/local` desde `public/fonts/`; `npm run build` ya no depende de `fonts.googleapis.com`. La carga diferida del catálogo de hoteles y la auditoría Lighthouse quedaron pendientes (ver §3).
- **Documentación (Fase 9):** este README, `EMAIL_SETUP.md`, `docs/ESTADOS.md` y `CHECKLIST_LANZAMIENTO.md` se agregaron o actualizaron en esta pasada.

**Pendiente** (fuera del alcance de esta pasada, ver `PLAN_REFACTORIZACION.md`): acciones administrativas adicionales en `/admon` aprobadas explícitamente (Fase 7), pruebas de integración con sandboxes reales de pago y Security Advisor de Supabase (Fase 6), carga diferida del catálogo de hoteles y auditoría Lighthouse (Fase 8).

---

## 10. Instalación y ejecución

```bash
npm install       # instala dependencias
npm run dev       # entorno de desarrollo (http://localhost:3000)
npm run build     # build de producción
npm run start     # sirve el build
npm run lint      # linter
```

Requisitos: **Node.js 20.9+**. Copia `.env.example` a `.env.local` y completa las credenciales de Supabase, Mercado Pago y PayPal (ver `PAYMENTS_SETUP.md`) y de Resend (ver `EMAIL_SETUP.md`).

---

## 11. Pruebas

```bash
npm run test        # Vitest — pricing.ts, schemas.ts (no requiere red ni Supabase)
npm run test:watch  # Vitest en modo watch
npm run test:e2e    # Playwright — levanta `npm run dev` en :3100 automáticamente
```

Las pruebas E2E interceptan con `page.route` las llamadas a `/api/reservations` y a los proveedores de pago, así que no crean reservaciones reales ni requieren credenciales de sandbox. Las únicas llamadas de red reales durante `test:e2e` son las que ya hace la app en desarrollo (refresco de sesión de Supabase Auth al visitar `/admon`, siempre de solo lectura). Antes de correrlas, asegúrate de que no quede un `next dev` corriendo en el puerto 3100.

---

## 12. Variables de entorno

Ver `.env.example` para la lista completa con comentarios. Resumen por área:

| Área | Variables | Detalle |
|---|---|---|
| Sitio | `NEXT_PUBLIC_SITE_URL` | Dominio HTTPS definitivo, sin ruta final. |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` | `SUPABASE_SECRET_KEY` es solo de servidor; nunca con prefijo `NEXT_PUBLIC_`. Ver `supabase/README.md`. |
| Mercado Pago | `MERCADO_PAGO_ENV`, `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET` | Ver `PAYMENTS_SETUP.md`. |
| PayPal | `PAYPAL_ENV`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYMENT_BRAND_NAME` | Ver `PAYMENTS_SETUP.md`. |
| Correo | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL` | Ver `EMAIL_SETUP.md`. Sin las dos primeras, las notificaciones quedan encoladas sin enviarse. |
| Cron interno | `CRON_SECRET` | Protege `GET /api/internal/notifications/process`. |

## 13. Despliegue y rollback

- **Infraestructura recomendada:** Vercel (aplicación) + Supabase (base de datos y auth).
- **Migraciones:** aplicar en orden todo lo que hay en `supabase/migrations/` antes de desplegar una versión que las requiera; son aditivas, no destructivas.
- **Cron:** `vercel.json` declara la ejecución de `/api/internal/notifications/process` cada 10 minutos; Vercel agrega automáticamente el header `Authorization` con `CRON_SECRET` cuando esa variable está configurada en el proyecto.
- **Rollback de la aplicación:** usar "Instant Rollback" de Vercel para volver al despliegue anterior sin tocar la base de datos.
- **Rollback de datos:** las migraciones no borran columnas ni tablas existentes; si una migración nueva causa un problema, primero revertir el despliegue de la aplicación y diagnosticar antes de tocar el esquema.
- Checklist completo antes de lanzar a producción: [`CHECKLIST_LANZAMIENTO.md`](CHECKLIST_LANZAMIENTO.md).

---

## 14. Convenciones de calidad

- **TypeScript estricto**, sin `any` (salvo casos inevitables justificados con comentario).
- Tipos centralizados en `src/types`.
- Lógica de estado en `src/stores`; presentación en `src/components`.
- Formularios validados con **Zod**.
- Responsive en móvil, tablet y escritorio. Textos en **español**.
- Objetivo: `npm run lint`, `npm run build`, `npm run test` y `npm run test:e2e` sin errores.
