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

Los cobros permanecen inactivos hasta aplicar las migraciones y configurar credenciales y webhooks; consulta `PAYMENTS_SETUP.md`.

---

## 3. Fuera de alcance

- Panel de operación de flota: monitoreo GPS, conductores, vehículos, combustible, mantenimiento, alertas, contabilidad interna. Este módulo fue parte del prototipo original y se retiró del código; ver §9 y `PLAN_REFACTORIZACION.md` si se retoma en el futuro.
- Acciones administrativas más allá de consulta y exportación (cambiar estado, cancelar, reembolsar, editar tarifas, reenviar correos, notas internas): requieren aprobación explícita antes de implementarse (ver `PLAN_REFACTORIZACION.md`, Fase 7).
- App móvil nativa del conductor, WebSockets, Traccar, PostGIS, NestJS, Prisma, Firebase Cloud Messaging: no forman parte de este producto.
- Suite de pruebas automatizadas (Playwright/Vitest): pendiente, ver `PLAN_REFACTORIZACION.md`, Fase 1.
- Proveedor de correo transaccional: pendiente de selección, ver `PLAN_REFACTORIZACION.md`, Fase 6.

---

## 4. Stack técnico

| Capa | Tecnología | Uso |
|---|---|---|
| Aplicación web | Next.js (App Router) + React + TypeScript | LP, reservación, checkout, confirmación, panel y endpoints de servidor. |
| Estilos | Tailwind CSS | UI. |
| Iconos | Lucide React | — |
| Formularios | React Hook Form + Zod | Validación del flujo de reservación. |
| Estado cliente | Zustand (`persist` a `localStorage`) | Borrador de reservación y estado del chatbot. |
| Fechas | date-fns | — |
| Animación | GSAP + `@gsap/react` | Reveals de la Landing Page y confirmación de pago. |
| Carrusel | Embla Carousel | Galería de la LP. |
| Backend y datos | Supabase PostgreSQL | Reservaciones, tarifas, pagos, usuarios administrativos. |
| Autenticación | Supabase Auth + `@supabase/ssr` | Acceso protegido a `/admon`. |
| Pagos | Mercado Pago Checkout Pro + PayPal Orders v2 | Checkout alojado por los proveedores y confirmación mediante webhooks. |
| Reportes | jsPDF + jspdf-autotable | Exportación PDF desde `/admon`. |

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
| `/api/reservations` | Creación de reservaciones. |
| `/api/payments/*` | Creación de pagos y webhooks de Mercado Pago / PayPal. |

---

## 8. Estructura del proyecto

```text
src/
├── app/
│   ├── layout.tsx               # Root layout: <html>, fonts, metadata base, WA sticky + chatbot
│   ├── page.tsx                 # Landing Page comercial
│   ├── reservar/                # Formulario de reserva multi-paso
│   ├── pago/
│   │   ├── checkout/            # Selector de Mercado Pago / PayPal
│   │   └── confirmacion/        # Estado de reservación y pago
│   ├── destinos/[slug]/         # Páginas de destino individuales (SSG)
│   ├── admon/                   # Panel administrativo (acceso + listado/reporte)
│   └── api/
│       ├── reservations/
│       └── payments/
├── components/
│   ├── landing/                 # Componentes de la Landing Page
│   ├── reservar/                # Pasos del formulario de reserva
│   ├── pago/                    # Checkout y confirmación de pago
│   ├── admon/                   # Listado/reporte del panel
│   ├── shared/                  # Reutilizables (WA sticky, chatbot, idioma…)
│   └── ui/                      # Primitivas estilo shadcn/ui
├── mocks/                       # Contenido editorial/catálogos de la LP (destinos, FAQ, testimonios, galería, hoteles, aeropuertos, tours, chatbot, tarifas, ubicaciones)
├── stores/                      # Zustand: borrador de reservación y estado del chatbot
├── types/                       # Tipos centralizados (reservación, pago, catálogos de la LP)
├── lib/                         # Utilidades, pagos, reservaciones y cliente Supabase
└── constants/                   # Catálogos y etiquetas compartidos
```

---

## 9. Historial de la refactorización

Este repositorio inició como un prototipo navegable (frontend con mocks) que representaba un sistema de operación completo (dashboard, monitoreo GPS, flota, conductores, combustible, mantenimiento, alertas, contabilidad) además de la Landing Page y el flujo de reservación/pago. Ese prototipo cumplió su objetivo de validación con el cliente y fue retirado del código en una refactorización por sustracción (ver [`PLAN_REFACTORIZACION.md`](PLAN_REFACTORIZACION.md) para el detalle completo):

- Se eliminaron las rutas `/admin`, `/driver` y `/demo`, sus layouts, componentes (`components/admin`, `components/driver`, `components/maps`, `components/charts`), stores (`demo-store`, `session-store`), helpers (`admin-permissions`, `admin-validation`, `driver-compliance`, `use-active-driver`, `reservation-to-trip`, `csv`, `lookups`) y el contrato `services/admin-service-contract.ts`.
- Se eliminaron los mocks exclusivos del demo operativo (`vehicles`, `drivers`, `trips`, `alerts`, `fuel`, `maintenance`, `incidents`, `accounting`, `vehicle-payments`, `users`) y los tipos correspondientes en `src/types/index.ts`.
- Se retiró la variable `INTERNAL_SYSTEM_ENABLED` y se simplificó `src/proxy.ts` para que solo proteja la sesión de `/admon`.
- Se depuraron dependencias sin consumidores: `leaflet`, `react-leaflet`, `@types/leaflet`, `recharts`, `motion`. Se conservó `jspdf`/`jspdf-autotable` (exportación PDF de `/admon`), `gsap`/`@gsap/react` (animaciones de la LP y confirmación de pago), `embla-carousel-react` (galería) y `zustand` (borrador de reservación y chatbot).
- Verificado con `npm run lint` y `npm run build` sin errores, y recorrido manual de `/`, `/reservar`, `/destinos/[slug]`, `/pago/checkout`, `/admon` (redirige a `/admon/acceso` sin sesión) y confirmación de que `/admin`, `/driver` y `/demo` ya no existen (404).

**Pendiente** (fuera del alcance de esta pasada, ver `PLAN_REFACTORIZACION.md`): suite de pruebas Playwright/Vitest (Fase 1), reorganización de dominios de negocio y reducción de datos persistidos en el navegador (Fases 4-5), rate limiting/anti-bot/observabilidad y proveedor de correo transaccional (Fase 6), acciones administrativas adicionales aprobadas explícitamente (Fase 7), optimización de rendimiento/fuentes (Fase 8).

---

## 10. Instalación y ejecución

```bash
npm install       # instala dependencias
npm run dev       # entorno de desarrollo (http://localhost:3000)
npm run build     # build de producción
npm run start     # sirve el build
npm run lint      # linter
```

Requisitos: **Node.js 18.18+**. Copia `.env.example` a `.env.local` y completa las credenciales de Supabase, Mercado Pago y PayPal (ver `PAYMENTS_SETUP.md`).

---

## 11. Convenciones de calidad

- **TypeScript estricto**, sin `any` (salvo casos inevitables justificados con comentario).
- Tipos centralizados en `src/types`.
- Lógica de estado en `src/stores`; presentación en `src/components`.
- Formularios validados con **Zod**.
- Responsive en móvil, tablet y escritorio. Textos en **español**.
- Objetivo: `npm run lint` y `npm run build` sin errores.
