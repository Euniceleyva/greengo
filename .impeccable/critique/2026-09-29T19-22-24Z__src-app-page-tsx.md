---
target: sitio público de GreenGo en general
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 5
target_identity: "file:/Users/aplatam/Documents/greengo/src/app/page.tsx"
target_fingerprint: "sha256:920f29ed288949fcec674467373a20e10cf9bbf7eab426dea0d08d86f3a36b81"
target_path: /Users/aplatam/Documents/greengo/src/app/page.tsx
timestamp: 2026-09-29T19-22-24Z
slug: src-app-page-tsx
---
# Auditoría general del sitio público de GreenGo

## Design Health Score

| Heurística | Puntaje | Evidencia principal |
|---|---:|---|
| Visibilidad del estado | 3/4 | El proceso muestra pasos, carga, errores y confirmación; algunos mensajes de formulario no se anuncian a tecnologías de asistencia. |
| Correspondencia con el mundo real | 3/4 | El lenguaje turístico es claro, pero una ruta interna de prueba aparece en el flujo público. |
| Control y libertad | 3/4 | Hay navegación hacia atrás, pausa de carruseles y persistencia del borrador; los widgets flotantes compiten por el espacio móvil. |
| Consistencia y estándares | 2/4 | La cotización inicial y la reserva usan catálogos, límites y equivalencias de servicio diferentes. |
| Prevención de errores | 1/4 | Se puede seleccionar una ruta interna y no existe una restricción robusta para fechas pasadas. |
| Reconocimiento sobre memoria | 3/4 | El stepper y los resúmenes ayudan, aunque servicios y destinos clave casi no se descubren desde la portada. |
| Flexibilidad y eficiencia | 2/4 | Hay precarga parcial, pero después de cotizar se vuelve a recorrer y reinterpretar información. |
| Diseño estético y minimalista | 3/4 | La dirección visual es propia y memorable; en móvil coinciden video, animaciones, formulario y dos accesos de soporte. |
| Recuperación ante errores | 3/4 | Pago y formularios ofrecen mensajes útiles y conservan datos; falta vincular varios errores con sus controles. |
| Ayuda y documentación | 3/4 | FAQ, chat y WhatsApp dan cobertura, pero faltan políticas y señales verificables de confianza. |
| **Total** | **26/40 (65%)** | **Aceptable, con mejoras importantes antes de escalar tráfico o campañas.** |

## Design Specificity Verdict

El sitio no se siente como una plantilla genérica. La paleta caribeña, la tipografía redondeada, las composiciones editoriales, las tarjetas con carácter y el lenguaje visual de “ruta” forman un sistema reconocible. La evaluación visual encontró una identidad deliberada; el escaneo determinista no reportó patrones genéricos (`0` hallazgos). No fue posible generar overlays del navegador porque la sesión de navegador local no estaba disponible, así que la evaluación visual se apoyó en las capturas compartidas y en la inspección del código y CSS.

## Impresión general

GreenGo comunica energía, cercanía y una propuesta de viaje privada con bastante personalidad. El mejor activo del producto es que ya existe una experiencia coherente de marca, no solo una colección de componentes. El mayor riesgo está un nivel más abajo: algunas decisiones del flujo todavía se comportan como prototipo. La promesa de una cotización rápida pierde credibilidad cuando el precio se presenta como ilustrativo, el siguiente flujo cambia la taxonomía o reinicia información, y aparecen datos internos o testimonios no verificables.

La carga cognitiva es moderada. El wizard está bien dividido y usa revelado progresivo, pero la portada móvil presenta demasiados focos simultáneos: video, animación de ruta, cotizador, WhatsApp y chatbot. La experiencia emocional comienza fuerte, cae al pasar de cotización a reserva y vuelve a mejorar en pago y confirmación.

## Lo que funciona bien

1. **Identidad visual propia.** El sitio posee color, ritmo, ilustración y tono de voz consistentes. Esto genera recuerdo y diferencia frente a transportadoras con interfaces genéricas.
2. **Reserva guiada y recuperable.** El stepper, los resúmenes, estados de carga, manejo de errores y persistencia local reducen la sensación de riesgo durante una compra larga.
3. **Buenas bases técnicas.** Hay responsive design, soporte para movimiento reducido, controles de pausa, carga diferida de contenido, SEO estructurado y una traducción amplia español/inglés. Lint y TypeScript pasan sin errores.

## Problemas prioritarios

### P1 — Una ruta interna de prueba está expuesta y seleccionada por defecto

**Por qué importa:** `🧪 Viaje de prueba interno (no reservar)` forma parte del catálogo público y es el origen inicial del formulario. Además, las fechas no tienen una restricción completa para impedir reservas pasadas. Esto permite crear solicitudes inválidas y transmite que el producto aún es un entorno de pruebas.

**Cómo corregirlo:** separar catálogos públicos e internos mediante un atributo explícito (`isInternal`) y filtrar/validar también en servidor; usar una ruta válida como estado inicial; rechazar identificadores internos en endpoints públicos; aplicar fecha mínima en cliente y validación equivalente en servidor.

**Comando sugerido:** `$impeccable harden`

### P1 — La cotización y la reserva no forman un solo flujo

**Por qué importa:** la portada calcula un estimado con datos y categorías propias, pero `/reservar` vuelve a pedir información, borra hoteles en ciertos cambios y transforma servicios como tour o transporte abierto a una categoría genérica. También difieren límites como el número de pasajeros. El usuario siente que empieza de nuevo y puede recibir una expectativa de precio equivocada.

**Cómo corregirlo:** crear un modelo canónico compartido para servicio, origen, destino, hotel, pasajeros y tarifa; usar el mismo motor de precios en ambos puntos; conservar identificadores reales de hotel; abrir la reserva en el siguiente paso ya completado o mostrar un resumen editable; distinguir visualmente “estimación” de “precio confirmado”.

**Comando sugerido:** `$impeccable shape`

### P1 — Las señales de confianza todavía parecen provisionales

**Por qué importa:** los testimonios están declarados en código como ficticios, pero la interfaz los presenta como prueba social real. Los enlaces sociales apuntan a `#` y no se encontraron páginas visibles de privacidad, términos o políticas de cambios/cancelación. En un checkout de transporte esto afecta conversión y credibilidad.

**Cómo corregirlo:** retirar o marcar claramente testimonios ilustrativos hasta tener reseñas verificables; integrar reseñas reales con fuente; ocultar redes sin URL; enlazar teléfono y correo; publicar privacidad, términos, cancelaciones/cambios, identidad del operador, cobertura y señales de seguro/licencia cuando correspondan.

**Comando sugerido:** `$impeccable harden`

### P1 — En móvil hay demasiados elementos compitiendo por atención y espacio

**Por qué importa:** video, animaciones, tarjetas, WhatsApp y chatbot coinciden sobre un formulario largo. Las capturas muestran controles flotantes cubriendo contenido y acciones. Los recursos públicos suman aproximadamente 37 MB y existen originales pesados que no parecen utilizarse, aunque no todos se descargan en una visita.

**Cómo corregirlo:** unificar soporte en un solo lanzador móvil que permita escalar a WhatsApp; ocultarlo mientras hay menús/campos activos; diferir chatbot por intención o inactividad; servir una imagen estática en `save-data` y dispositivos modestos; eliminar originales sin uso; mantener un único foco animado por viewport.

**Comando sugerido:** `$impeccable optimize`

### P1 — Faltan detalles esenciales de accesibilidad interactiva

**Por qué importa:** el combobox personalizado no implementa navegación completa con flechas, Home/End ni estado activo; el chatbot con rol de diálogo no atrapa ni restaura el foco; algunos errores no usan `aria-describedby`, `aria-live` o `role="alert"`; los textos alternativos de galería no cambian al inglés.

**Cómo corregirlo:** usar un patrón combobox accesible probado o completar semántica y teclado; definir correctamente si el chat es modal o no modal y manejar el foco; asociar mensajes con cada control; anunciar errores; incluir `alt` bilingüe en los datos de las imágenes.

**Comando sugerido:** `$impeccable audit`

## Alertas por persona

- **Jordan, viajero comparando opciones:** no puede saber con certeza si el estimado será el precio final y encuentra poca navegación hacia servicios/destinos antes de comprometerse.
- **Casey, reserva desde el teléfono con prisa:** los accesos flotantes pueden tapar campos o botones y el movimiento simultáneo aumenta el esfuerzo en una tarea operativa.
- **Riley, usuario exigente o desconfiado:** detecta la ruta de prueba, enlaces vacíos y prueba social ficticia, lo que reduce confianza justo antes de pagar.

## Observaciones menores

- La portada solo expone “Cómo funciona” y “Contacto”; hay componentes y páginas de servicios/destinos, pero casi no existen rutas internas visibles hacia ellos. Conviene sumar enlaces compactos en navegación o pie, sin reintroducir secciones largas previamente descartadas.
- El tipo de traslado inicial es hotel a hotel, aunque la promesa principal del sitio enfatiza aeropuerto ↔ hotel. Conviene ordenar el selector según demanda real o recordar la última elección.
- Teléfono y correo deberían ser enlaces `tel:` y `mailto:`.
- Mantener el carrusel de fotos como textura de transición funciona; no debería competir con otro encabezado grande ni con controles persistentes.
- Conviene documentar el sistema visual y las decisiones de producto en archivos de contexto para evitar que futuras secciones se desalineen.

## Preguntas para considerar

- ¿La tarifa de portada debe ser una cotización real reservable o solamente un filtro que prepara la solicitud?
- ¿Qué evidencia verificable puede reemplazar primero a los testimonios ficticios: Google, TripAdvisor, clientes corporativos o cifras operativas?
- ¿Qué canal de soporte debe ser primario en móvil: chat web o WhatsApp?
- ¿El negocio necesita mostrar servicios y destinos para descubrimiento/SEO, o la portada debe optimizarse exclusivamente para reservar?
