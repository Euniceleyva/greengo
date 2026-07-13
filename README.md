# GreenGo Traslados — DEMO Frontend

> **Sistema de gestión y monitoreo de traslados turísticos en Cancún.**
> Prototipo navegable (solo frontend, con datos simulados) para validar módulos y flujos con el cliente antes de desarrollar el sistema real.

---

## 1. Descripción

**Nombre provisional:** GreenGo Traslados (working name).

**Problema que resuelve.** Una empresa de traslados turísticos en Cancún necesita controlar y coordinar su operación de transporte. Hoy no tiene forma confiable de:

- Controlar los kilómetros recorridos por cada unidad.
- Comparar la ruta planeada contra la ruta realmente realizada.
- Conocer la ubicación de las unidades.
- Detectar recorridos fuera de los servicios asignados.
- Evitar el uso personal de los vehículos.
- Detectar posibles irregularidades en el consumo de gasolina.
- Mantener un historial de viajes, conductores y unidades.
- Ayudar a operadores y administradores a coordinar los traslados.

**Tipos de servicio de traslado.**

1. **Hotel a hotel.**
2. **Aeropuerto ↔ hotel / aeropuerto → destino turístico** (aeropuerto a hotel, hotel a aeropuerto, aeropuerto a destino turístico).
3. **Transporte abierto:** renta de vehículo con chofer durante un periodo determinado.
4. **Soluciones a medida:** servicios personalizados, recepción especial y descuentos.

**Usuarios principales.** Dueño, administrador, operador, conductor, contabilidad y cliente/agencia. En este DEMO solo se representan visualmente el **administrador/operador** y el **conductor** (ver [Roles](#6-roles)).

**Objetivo del DEMO.** Entregar un frontend navegable para presentar al cliente, de modo que pueda: visualizar cómo funcionaría el sistema, identificar qué módulos necesita, decidir qué conservar y qué descartar, proponer cambios y validar los flujos de administrador y conductor **antes** de construir el sistema real.

---

## 2. Alcance actual

Este repositorio es **exclusivamente un frontend con datos simulados (mocks)**.

- Toda la información proviene de mocks locales en `src/mocks`.
- El estado "vivo" (viajes, alertas, combustible, etc.) se maneja con **Zustand** y se persiste temporalmente en **`localStorage`** del navegador.
- Las acciones (crear/editar viaje, asignar conductor/unidad, cambiar estados, registrar combustible, reportar incidencias, simular movimiento de una unidad, marcar alertas) son **funcionales** pero **locales**: no llaman a ningún servidor.
- Existe un botón **"Restablecer datos del DEMO"** que devuelve los mocks a su estado original.
- Las imágenes (odómetro, tickets, evidencias) se manejan solo como **preview local** del archivo seleccionado; **no se suben** a ningún servidor.
- Las exportaciones generan un **CSV local** en el navegador (no PDF, no backend).

---

## 3. Fuera de alcance (NO se implementa en esta etapa)

Por decisión explícita, en este DEMO **no** se implementa nada de lo siguiente:

- Backend / API propia / servidor Express / NestJS.
- Base de datos, migraciones o esquemas reales (PostgreSQL, PostGIS).
- Prisma, Supabase, Firebase.
- Traccar / conexión real con dispositivos GPS.
- WebSockets reales / tiempo real verdadero.
- Autenticación real, login real, JWT, OAuth/SSO.
- Google Maps Platform con credenciales.
- Pagos / cobros.
- Servicios en la nube, Docker, integraciones externas.
- Envío real de correos, mensajes o notificaciones.

> Cuando una función dependa de backend, se **simula localmente** y se deja un comentario `// TODO(prod): ...` indicando que se reemplazará en producción.

---

## 4. Arquitectura futura (conceptual — NO implementar ahora)

En producción, el sistema completo podría apoyarse en:

- **Flutter** — aplicación móvil del conductor.
- **Next.js** — panel administrativo web.
- **NestJS** — backend / API.
- **PostgreSQL + PostGIS** — datos y geometrías/rutas.
- **Traccar** — recepción de información GPS de las unidades.
- **Google Maps Platform** — mapas, rutas y matrices de distancia en producción (en el DEMO se usa OpenStreetMap + Leaflet para evitar credenciales).
- **WebSockets** — monitoreo en tiempo real.
- **Firebase Cloud Messaging** — notificaciones push al conductor.
- **Docker + servicios en la nube** — despliegue.

> Estas tecnologías son **referencia de rumbo**. **No** deben implementarse durante esta etapa.

En este DEMO, ambas experiencias (admin y conductor) conviven en **una sola aplicación web Next.js**. La sección del conductor se diseña **mobile-first** para sentirse como una app móvil y, en el futuro, poder migrarse a Flutter.

---

## 5. Decisiones técnicas del DEMO

| Tema | Decisión | Motivo |
|------|----------|--------|
| Framework | **Next.js (App Router) + React + TypeScript** | Requisito; base para el panel productivo. |
| Estilos | **Tailwind CSS** | Rapidez y consistencia. |
| UI | Primitivas propias estilo **shadcn/ui** (Button, Card, Input, Badge, Dialog, Table, etc.) | Se evita el CLI interactivo de shadcn; mismos patrones y clases utilitarias (`cn`). |
| Iconos | **Lucide React** | Requisito. |
| Formularios | **React Hook Form + Zod** | Validación frontend estricta. |
| Gráficas | **Recharts** | Requisito. |
| Estado global | **Zustand** (con `persist` a `localStorage`) | Estado ligero compartido entre `/admin` y `/driver`. |
| Fechas | **date-fns** | Requisito. |
| Mapas | **Leaflet + React Leaflet + OpenStreetMap** | Mapa visual sin credenciales privadas. |
| Tablas | Tabla propia con filtros/búsqueda (patrón TanStack-friendly) | Suficiente para el DEMO; se puede migrar a TanStack Table. |

> **Google Maps NO se usa en esta etapa** (evitamos configurar credenciales). En producción, Google Maps Platform podría reemplazar a OpenStreetMap/Leaflet.

---

## 6. Roles

| Rol | Descripción | En el DEMO |
|-----|-------------|------------|
| **Dueño** | Visión global del negocio, rentabilidad y flota. | Representado dentro del panel admin. |
| **Administrador** | Gestiona servicios, flota, conductores, alertas y reportes. | ✅ Obligatorio (área `/admin`). |
| **Operador** | Coordina y asigna traslados en el día a día. | ✅ Obligatorio (comparte `/admin`). |
| **Conductor** | Ejecuta los traslados y reporta desde el móvil. | ✅ Obligatorio (área `/driver`). |
| **Contabilidad** | Consume reportes de combustible, costos y rentabilidad. | Representado en Reportes/Combustible. |
| **Cliente / Agencia** | Solicita y da seguimiento a traslados. | Fuera del alcance visual del DEMO. |

**Usuarios simulados** (solo para cambiar de experiencia, no son credenciales reales):

- Administrador: **Laura Martínez**
- Operador: **Carlos Méndez**
- Conductor: **José Ramírez**

---

## 7. Módulos del prototipo

**Panel administrativo (`/admin`)**

- **Dashboard** — KPIs del día, gráfica de kilómetros de la semana, consumo por unidad, próximos servicios, alertas recientes y mini-mapa de unidades.
- **Servicios / Viajes** — tabla con búsqueda y filtros, alta simulada, detalle, edición, cambio de estado, asignación de conductor/unidad. Formulario adaptado a los 4 tipos de servicio.
- **Monitoreo en tiempo real (simulado)** — mapa de Cancún con marcadores por estado; panel de detalle de unidad; simulación de movimiento (iniciar/pausar/avanzar) que modifica coordenadas locales.
- **Comparación de ruta** — ruta planeada vs. recorrida, distancias, diferencias, tiempos, paradas, desvíos y km fuera de ruta sobre el mapa.
- **Vehículos** — tabla + tarjetas, detalle con historial de viajes, consumo, mantenimientos, alertas, documentos simulados y gráfica de kilometraje.
- **Conductores** — listado + perfil con historial y métricas.
- **Combustible** — registros y dashboard (consumo/rendimiento por unidad, cargas recientes, anomalías por revisar).
- **Alertas** — bandeja con acciones (revisar, cambiar prioridad, nota, ver vehículo/viaje).
- **Mantenimiento** — programación y seguimiento por unidad.
- **Reportes** — vistas por conductor/vehículo/servicio, km no autorizados, consumo, rendimiento, incidencias y rentabilidad simulada, con exportación a CSV local.

**Experiencia del conductor (`/driver`, mobile-first)**

- **Inicio** — saludo, estado, unidad asignada, próximo servicio, servicios del día y alertas.
- **Mis servicios** — listado por estado (próximos / en curso / completados / cancelados).
- **Detalle del servicio** — datos del pasajero, vuelo, origen/destino, instrucciones, mapa mock y botonera de cambio de estado.
- **Inicio y cierre de viaje** — formularios de kilometraje, combustible, confirmaciones y evidencias (preview local).
- **Registro de gasolina** — captura de carga con ticket (preview local).
- **Reportar incidencia** — tipos de incidencia con descripción y evidencia local.
- **Perfil** — datos del conductor, licencia, unidad, métricas y contacto de emergencia.

> ⚠️ **Terminología de anomalías de combustible.** El sistema **nunca** etiqueta automáticamente un evento como "robo". Se usan textos neutrales: *"Anomalía por revisar"*, *"Consumo fuera del promedio"*, *"Variación inesperada"*, *"Evidencia pendiente"*.

---

## 8. Datos mock

Ubicación: **`src/mocks/`**

| Archivo | Contenido |
|---------|-----------|
| `vehicles.ts` | 8 vehículos |
| `drivers.ts` | 10 conductores |
| `trips.ts` | 20 viajes/servicios |
| `alerts.ts` | 12 alertas |
| `fuel.ts` | 15 registros de combustible |
| `maintenance.ts` | 8 registros de mantenimiento |
| `locations.ts` | Lugares de Cancún y rutas (coordenadas) |
| `users.ts` | Usuarios simulados (admin/operador/conductor) |

**Cómo modificarlos.** Edita los archivos anteriores (arreglos tipados con TypeScript). Al recargar la app se toman como estado inicial. Para volver al estado original después de haber interactuado, usa **"Restablecer datos del DEMO"** en la barra superior del panel admin (limpia el `localStorage` de la app).

Lugares usados (Cancún y alrededores): Aeropuerto Internacional de Cancún, Zona Hotelera, Puerto Cancún, Playa del Carmen, Tulum, Puerto Morelos, Hotel Riu Cancún, Moon Palace, Xcaret, Terminal de ferry de Puerto Juárez. **Todos los nombres y teléfonos son ficticios.**

---

## 9. Instalación y ejecución

```bash
npm install       # instala dependencias
npm run dev       # entorno de desarrollo (http://localhost:3000)
npm run build     # build de producción
npm run start     # sirve el build
npm run lint      # linter
```

Requisitos: **Node.js 18.18+**.

---

## 10. Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Selección de experiencia (administrador / conductor) con usuarios simulados. |
| `/admin` | Redirige al dashboard administrativo. |
| `/admin/dashboard` | KPIs y resumen. |
| `/admin/trips` | Servicios / viajes. |
| `/admin/monitoring` | Monitoreo en tiempo real simulado. |
| `/admin/vehicles` | Vehículos. |
| `/admin/drivers` | Conductores. |
| `/admin/fuel` | Combustible. |
| `/admin/maintenance` | Mantenimiento. |
| `/admin/alerts` | Alertas. |
| `/admin/reports` | Reportes. |
| `/driver` | Redirige al inicio del conductor. |
| `/driver/home` | Inicio del conductor. |
| `/driver/services` | Mis servicios. |
| `/driver/active-trip` | Viaje activo / detalle y cambio de estado. |
| `/driver/fuel` | Registro de gasolina. |
| `/driver/incidents` | Reportar incidencia. |
| `/driver/profile` | Perfil del conductor. |

---

## 11. Credenciales simuladas

**No hay autenticación real.** La pantalla inicial **no** pide contraseñas. Seleccionar un usuario simulado (Laura Martínez, Carlos Méndez o José Ramírez) únicamente **cambia de experiencia** dentro del DEMO y guarda la sesión activa en `localStorage`. No existen contraseñas, tokens ni verificación de identidad.

---

## 12. Estructura del proyecto

```text
src/
├── app/
│   ├── page.tsx                # Selección de experiencia
│   ├── admin/                  # Panel administrativo (layout + módulos)
│   └── driver/                 # Experiencia del conductor (mobile-first)
├── components/
│   ├── admin/                  # Componentes del panel
│   ├── driver/                 # Componentes del conductor
│   ├── maps/                   # Leaflet / mapas
│   ├── charts/                 # Recharts
│   ├── shared/                 # Reutilizables (KPI, tablas, estados vacíos…)
│   └── ui/                     # Primitivas estilo shadcn/ui
├── mocks/                      # Datos simulados (ver §8)
├── stores/                     # Zustand (estado + persistencia localStorage)
├── types/                      # Tipos centralizados
├── lib/                        # Utilidades (cn, csv, geo, format…)
└── constants/                  # Estados, etiquetas, colores, catálogos
```

---

## 13. Convenciones de calidad

- **TypeScript estricto**, sin `any` (salvo casos inevitables justificados con comentario).
- Tipos centralizados en `src/types`.
- Datos mock separados de la interfaz.
- Lógica de estado en `src/stores`; presentación en `src/components`.
- Formularios validados con **Zod**.
- Estados de UI: loading simulado, empty state, confirmaciones, tooltips, toasts y skeletons donde aplique.
- Responsive en móvil, tablet y escritorio. Textos en **español**.
- Objetivo: `npm run lint` y `npm run build` sin errores.

---

## 14. Notas de uso del DEMO

- **Cómo empezar:** `npm install` → `npm run dev` → abre `http://localhost:3000`. Elige "Laura Martínez" (admin) o "José Ramírez" (conductor).
- **Persistencia:** los cambios se guardan en `localStorage` (`greengo-demo-store`). Para volver al estado inicial usa **"Restablecer DEMO"** en el encabezado del panel admin.
- **Estado compartido:** admin y conductor leen/escriben el mismo store. Si el conductor cambia el estado de un servicio (p. ej. "Iniciar viaje"), se refleja en `/admin/trips`.
- **Mapas:** OpenStreetMap vía Leaflet, sin credenciales. Requiere acceso a `tile.openstreetmap.org` para mostrar el fondo del mapa.
- **Simulación de movimiento:** en `/admin/monitoring`, elige una unidad y usa *Iniciar / Pausar / Avanzar*; las coordenadas se actualizan localmente sobre una ruta mock.
- **Vista móvil del conductor:** `/driver` está diseñada mobile-first; para verla como app, reduce la ventana o abre desde un teléfono.

## 15. Estado del DEMO / cambios

- Contexto, alcance y arquitectura documentados en este README (paso inicial obligatorio).
- Frontend Next.js 14 (App Router) + TypeScript estricto + Tailwind, con panel admin y experiencia de conductor sobre mocks + Zustand persistido en `localStorage`.
- Módulos admin implementados: dashboard, servicios (alta/edición/asignación/estado + comparación de ruta), monitoreo con simulación de movimiento, vehículos (lista/tarjetas/detalle), conductores (lista/perfil), combustible (dashboard + anomalías por revisar), alertas (acciones), mantenimiento y reportes (con exportación CSV).
- Experiencia de conductor implementada: inicio, mis servicios, detalle/viaje activo con flujo de estados e inicio/cierre de viaje (evidencias con preview local), registro de gasolina, incidencias y perfil.
- Verificado: `npm run lint` y `npm run build` sin errores; smoke test en navegador (landing, dashboard, mapa de monitoreo con marcadores y vista móvil del conductor) sin errores de consola.
- **Fix aplicado (`src/components/maps/fleet-map.tsx`):** el mapa de Leaflet se montaba con altura 0 dentro de contenedores flex/grid y no cargaba los tiles. Se corrigió forzando `h-full w-full` en el contenedor y añadiendo un `invalidateSize()` tras el primer montaje (`InvalidateOnMount`). Verificado visualmente en `/admin/monitoring`: el mapa de Cancún y los marcadores por estado ya renderizan correctamente.
- Se eliminó un import sin usar (`vehicleLabel`) en `src/app/driver/home/page.tsx`, detectado durante la verificación en navegador.
- Se agregó `.claude/launch.json` (config local de desarrollo, no forma parte del código de producción) para poder previsualizar `npm run dev` en el navegador integrado del asistente.
