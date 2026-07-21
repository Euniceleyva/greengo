"use client";

import * as React from "react";

export type PublicLanguage = "es" | "en";

const STORAGE_KEY = "marea-public-language";

const ES_TO_EN: Record<string, string> = {
  "Servicios": "Services",
  "Destinos": "Destinations",
  "Cómo funciona": "How it works",
  "Contacto": "Contact",
  "Reservar": "Book now",
  "Reservar ahora": "Book now",
  "Abrir menú": "Open menu",
  "Cerrar menú": "Close menu",
  "Navegación principal": "Main navigation",
  "Navegación móvil": "Mobile navigation",
  "El traslado es el primer capítulo": "The ride is chapter one",
  "Aterriza.": "Land.",
  "Sube.": "Hop in.",
  "Empieza la": "Start the",
  "aventura.": "adventure.",
  "Del avión al Caribe, sin perder el ritmo. Traslados privados para moverte por Cancún y la Riviera Maya.": "From the runway to the Caribbean without missing a beat. Private rides across Cancún and the Riviera Maya.",
  "Armar mi ruta": "Build my route",
  "Cancún → donde empiece tu plan": "Cancún → wherever your plan begins",
  "Salida inmediata": "Ready for departure",
  "Traza tu primera ruta": "Map your first route",
  "Tipo de traslado": "Transfer type",
  "Tipo de servicio": "Service type",
  "Hotel de origen": "Pickup hotel",
  "Hotel de destino": "Destination hotel",
  "Hotel a hotel": "Hotel to hotel",
  "Hotel a aeropuerto": "Hotel to airport",
  "Aeropuerto a hotel": "Airport to hotel",
  "Aeropuerto ↔ hotel": "Airport ↔ hotel",
  "Aeropuerto / hotel": "Airport / hotel",
  "Aeropuerto": "Airport",
  "Salida desde": "Departing from",
  "Tour": "Tour",
  "Fecha": "Date",
  "Horario": "Time",
  "Hora": "Time",
  "Pasajeros": "Passengers",
  "Ver precio de mi ruta": "See my route price",
  "Continuar a reservar": "Continue to booking",
  "Estimado ilustrativo, sujeto a confirmación en tu reservación.": "Illustrative estimate, subject to confirmation when booking.",
  "La ventana ya es parte del viaje.": "The view is already part of the trip.",
  "Mar turquesa, selva y carretera. Estos son algunos de los paisajes que empiezan antes de llegar.": "Turquoise water, jungle and open road. The scenery starts long before you arrive.",
  "Vistas reales de nuestras rutas favoritas.": "Real views from our favorite routes.",
  "Kilómetro cero: Caribe Mexicano": "Mile zero: Mexican Caribbean",
  "Elige tu carril": "Choose your lane",
  "Hay más de una forma de llegar al agua.": "There is more than one way to reach the water.",
  "Desde un pickup puntual hasta un día entero con chofer. Tú pones el plan; nosotros conectamos los puntos.": "From an on-time pickup to a full day with a driver. You make the plan; we connect the dots.",
  "Transporte abierto": "Open transportation",
  "Soluciones a medida": "Tailored solutions",
  "Solución a medida": "Tailored solution",
  "Traslados directos entre hoteles de Cancún y la Riviera Maya, sin escalas ni transbordos.": "Direct transfers between hotels in Cancún and the Riviera Maya, with no stops or connections.",
  "Recepción en el aeropuerto con seguimiento de tu vuelo, o traslado directo a tu próximo destino.": "Airport pickup with flight tracking, or a direct ride to your next destination.",
  "Renta de vehículo con chofer por el tiempo que necesites, ideal para explorar a tu ritmo.": "A private vehicle with driver for as long as you need, ideal for exploring at your own pace.",
  "Servicios personalizados, recepción especial y descuentos para grupos y ocasiones particulares.": "Personalized service, special welcomes and group rates for memorable occasions.",
  "Cotizar": "Get a quote",
  "Postales que sí puedes alcanzar.": "Postcards you can actually reach.",
  "Salimos desde Cancún\ny seguimos tu ruta.": "We leave from Cancún\nand follow your route.",
  "Salimos desde Cancún": "We leave from Cancún",
  "y seguimos tu ruta.": "and follow your route.",
  "Ver destino": "Explore destination",
  "Tu itinerario": "Your itinerary",
  "De “ya aterricé” a “ya llegué”.": "From “just landed” to “made it”.",
  "Cuatro paradas claras, cero vueltas innecesarias.": "Four clear stops, zero unnecessary detours.",
  "Cotiza tu traslado": "Get your transfer quote",
  "Confirma tu reservación": "Confirm your booking",
  "Te recogemos a tiempo": "We pick you up on time",
  "Disfruta tu viaje": "Enjoy your trip",
  "Indica origen, destino, fecha y número de pasajeros en el formulario de reserva.": "Enter your origin, destination, date and passenger count in the booking form.",
  "Revisa el desglose de tarifa y confirma tus datos de contacto en minutos.": "Review the fare breakdown and confirm your contact details in minutes.",
  "Un conductor asignado te espera en el punto acordado, con seguimiento de tu vuelo si aplica.": "Your assigned driver waits at the agreed pickup point and tracks your flight when applicable.",
  "Llega a tu destino con tranquilidad y sin preocuparte por el transporte.": "Reach your destination comfortably without worrying about transportation.",
  "Mensajes que llegaron antes que la postal.": "Messages that arrived before the postcard.",
  "Historias ilustrativas de viajeros que ya hicieron la ruta.": "Illustrative stories from travelers who already took the route.",
  "Antes de subir, despeja la ruta.": "Clear up the details before you ride.",
  "Equipaje, vuelos, horarios y cambios: aquí están las respuestas rápidas.": "Luggage, flights, schedules and changes: find the quick answers here.",
  "Preguntas frecuentes": "Frequently asked questions",
  "¿Cómo reservo un traslado?": "How do I book a transfer?",
  "¿Qué pasa si mi vuelo se retrasa?": "What happens if my flight is delayed?",
  "¿Puedo cancelar o cambiar mi reservación?": "Can I cancel or change my booking?",
  "¿Qué formas de pago aceptan?": "What payment methods do you accept?",
  "¿Los vehículos tienen sillas para niños?": "Do the vehicles have child seats?",
  "¿Cuánto equipaje puedo llevar?": "How much luggage can I bring?",
  "¿El precio incluye casetas y estacionamiento?": "Does the price include tolls and parking?",
  "¿Ofrecen transporte para grupos grandes?": "Do you offer transportation for large groups?",
  "Completa el formulario de cotización rápida en la página principal o entra directamente a \"Reservar ahora\". El proceso tiene 4 pasos: servicio, detalles del viaje, datos de contacto y confirmación de pago.": "Complete the quick quote form on the home page or go directly to \"Book now\". The process has four steps: service, trip details, contact information and payment confirmation.",
  "Monitoreamos el número de vuelo que proporcionas al reservar. El conductor ajusta su llegada según el horario real de aterrizaje, sin costo adicional por retrasos razonables.": "We monitor the flight number you provide when booking. Your driver adjusts the pickup to the actual landing time at no extra cost for reasonable delays.",
  "Sí, puedes solicitar cambios de fecha, hora o destino desde la confirmación de tu reservación o contactando a nuestro equipo por WhatsApp con al menos 24 horas de anticipación.": "Yes. You can request changes to the date, time or destination from your booking confirmation or by contacting our team on WhatsApp at least 24 hours in advance.",
  "Aceptamos tarjeta de crédito/débito, pago en efectivo en OXXO y transferencia SPEI. En este sitio de demostración, la pasarela de pago es una simulación visual y no procesa cargos reales.": "We accept credit or debit cards, OXXO cash payments and SPEI transfers. On this demo site, the payment gateway is a visual simulation and does not process real charges.",
  "Puedes solicitar silla para bebé o asiento elevador para niños en las notas del formulario de reserva, sujeto a disponibilidad y sin costo adicional.": "You can request an infant seat or child booster in the booking notes, subject to availability and at no additional cost.",
  "Cada pasajero puede llevar una maleta grande y un artículo de mano sin costo extra. Si viajas con equipaje adicional o especial (tablas de surf, equipo de buceo), indícalo en el paso de detalles.": "Each passenger may bring one large suitcase and one carry-on at no extra cost. Add any extra or special luggage, such as surfboards or diving gear, in the trip details step.",
  "Sí, el precio mostrado en la cotización incluye casetas de peaje. El estacionamiento en destino corre por cuenta del pasajero cuando aplica.": "Yes, the quoted price includes tolls. Destination parking is paid by the passenger when applicable.",
  "Sí, contamos con unidades tipo van y sprinter para grupos. Selecciona \"Soluciones a medida\" en el formulario y nuestro equipo te contactará con una propuesta personalizada.": "Yes, we have vans and Sprinters for groups. Select \"Tailored solutions\" in the form and our team will contact you with a personalized proposal.",
  "Síguenos": "Follow us",
  "Enlaces": "Links",
  "Traslados turísticos en Cancún y la Riviera Maya.": "Tourist transfers in Cancún and the Riviera Maya.",
  "Acceso al panel (demo)": "Dashboard access (demo)",
  "Tu próximo plan empieza aquí.": "Your next plan starts here.",
  "Completa la ruta a tu ritmo. Guardamos los detalles mientras avanzas.": "Complete the route at your pace. We save the details as you go.",
  "Elige tu servicio": "Choose your service",
  "Detalles del viaje": "Trip details",
  "Datos de contacto": "Contact details",
  "Servicio": "Service",
  "Detalles": "Details",
  "Resumen": "Summary",
  "Origen": "Origin",
  "Destino": "Destination",
  "Sentido": "Trip type",
  "Sencillo": "One way",
  "Redondo": "Round trip",
  "Continuar": "Continue",
  "Atrás": "Back",
  "Maletas": "Bags",
  "Número de vuelo (opcional)": "Flight number (optional)",
  "Notas (opcional)": "Notes (optional)",
  "Nombre completo": "Full name",
  "Correo electrónico": "Email",
  "Teléfono (10 dígitos)": "Phone (10 digits)",
  "Hotel (opcional)": "Hotel (optional)",
  "Resumen del viaje": "Trip summary",
  "Fecha y hora": "Date and time",
  "Correo": "Email",
  "Desglose de tarifa (estimado)": "Estimated fare breakdown",
  "Tarifa base (hasta 4 pasajeros)": "Base fare (up to 4 passengers)",
  "Total estimado": "Estimated total",
  "Continuar al pago": "Continue to payment",
  "PAGO SEGURO": "SECURE PAYMENT",
  "Pago protegido": "Protected payment",
  "Volver a la reserva": "Back to booking",
  "ÚLTIMA PARADA": "LAST STOP",
  "Confirma y pon tu viaje en marcha.": "Confirm and set your trip in motion.",
  "Modo demostración:": "Demo mode:",
  "RECIBO DE RUTA": "ROUTE RECEIPT",
  "Tu reserva": "Your booking",
  "Total a pagar": "Total due",
  "Traslado · Caribe Mexicano · Buen viaje": "Transfer · Mexican Caribbean · Safe travels",
  "¿Cómo quieres pagar?": "How would you like to pay?",
  "Método de pago": "Payment method",
  "Tarjeta": "Card",
  "Tus datos se usan solo para esta simulación.": "Your details are used only for this simulation.",
  "Procesando…": "Processing…",
  "No hay ninguna reservación en curso.": "There is no booking in progress.",
  "Todavía no hay una ruta lista para pagar.": "There is no route ready for payment yet.",
  "Iniciar una reservación": "Start a booking",
  "¡Reservación confirmada!": "Booking confirmed!",
  "VIAJE CONFIRMADO": "TRIP CONFIRMED",
  "CONFIRMADO": "CONFIRMED",
  "YA ESTÁ EN EL MAPA": "IT’S ON THE MAP",
  "¡Listo! Tu viaje ya está en marcha.": "All set! Your trip is in motion.",
  "Guardamos tu ruta y la enviamos al equipo. Conserva este folio para cualquier cambio.": "We saved your route and sent it to the team. Keep this booking code handy for any changes.",
  "FOLIO DE VIAJE": "TRIP CODE",
  "¿Qué sigue?": "What’s next?",
  "Ahora sí:": "Now you’re ready:",
  "maleta lista,": "bags packed,",
  "modo Caribe.": "Caribbean mode.",
  "Te enviaremos la confirmación al correo proporcionado (simulado, sin envío real).": "We’ll send confirmation to the email provided (simulated, no real message is sent).",
  "Esta reservación ya aparece en el panel administrativo del DEMO (Servicios / Viajes).": "This booking now appears in the DEMO admin dashboard (Services / Trips).",
  "Total pagado": "Total paid",
  "Volver al inicio": "Back to home",
  "Volver a destinos": "Back to destinations",
  "La historia detrás de la ventana": "The story beyond the window",
  "Lo que vale la parada": "Worth the stop",
  "Otros puntos en el mapa": "More points on the map",
  "Zona Hotelera de Cancún": "Cancún Hotel Zone",
  "Playas turquesa y la vida nocturna más animada del Caribe mexicano.": "Turquoise beaches and the liveliest nightlife in the Mexican Caribbean.",
  "Ambiente bohemio, la Quinta Avenida y acceso a Cozumel en ferry.": "Bohemian atmosphere, Fifth Avenue and ferry access to Cozumel.",
  "Ruinas frente al mar, cenotes y un estilo de vida bohemio-chic.": "Seaside ruins, cenotes and a bohemian-chic lifestyle.",
  "Una isla pequeña con playas tranquilas a un corto trayecto en ferry.": "A small island with calm beaches just a short ferry ride away.",
  "Uno de los mejores puntos de buceo y esnórquel del Caribe.": "One of the Caribbean’s best diving and snorkeling destinations.",
  "Parque temático natural con ríos subterráneos y cultura mexicana.": "A natural theme park with underground rivers and Mexican culture.",
  "A minutos del aeropuerto": "Minutes from the airport",
  "Playas de acceso público": "Public-access beaches",
  "Centros comerciales y vida nocturna": "Shopping and nightlife",
  "Quinta Avenida peatonal": "Pedestrian Fifth Avenue",
  "Ferry a Cozumel": "Ferry to Cozumel",
  "Gran variedad gastronómica": "Wide dining variety",
  "Zona arqueológica frente al mar": "Seaside archaeological site",
  "Cenotes cercanos": "Nearby cenotes",
  "Hoteles boutique": "Boutique hotels",
  "Playas de aguas calmas": "Calm-water beaches",
  "Ideal para un día completo": "Ideal for a full day",
  "Pueblo caminable": "Walkable town",
  "Arrecifes de coral protegidos": "Protected coral reefs",
  "Buceo y esnórquel": "Diving and snorkeling",
  "Pueblo con muelle turístico": "Town with a visitor pier",
  "Ríos subterráneos": "Underground rivers",
  "Espectáculos culturales": "Cultural shows",
  "Ideal para excursión de un día": "Ideal for a day trip",
  "La franja hotelera de Cancún concentra los resorts más reconocidos, playas de arena blanca y una oferta interminable de restaurantes, bares y vida nocturna. Ideal para quienes buscan comodidad y todo cerca.": "Cancún’s Hotel Zone brings together renowned resorts, white-sand beaches and an endless selection of restaurants, bars and nightlife. Ideal for travelers who want comfort with everything nearby.",
  "A poco más de una hora de Cancún, Playa del Carmen combina playas relajadas con la energía de la Quinta Avenida, llena de tiendas, cafés y restaurantes. Punto de partida habitual para excursiones a Cozumel.": "Just over an hour from Cancún, Playa del Carmen combines relaxed beaches with the energy of Fifth Avenue, lined with shops, cafés and restaurants. It is a popular starting point for trips to Cozumel.",
  "Tulum es famoso por sus ruinas mayas con vista al Caribe, sus cenotes cercanos y una zona hotelera de diseño relajado. Uno de los destinos más solicitados de la Riviera Maya.": "Tulum is known for its Mayan ruins overlooking the Caribbean, nearby cenotes and laid-back design hotels. It is one of the Riviera Maya’s most requested destinations.",
  "Frente a Cancún, Isla Mujeres ofrece playas tranquilas de aguas poco profundas, un pueblo colorido y paseos en golf cart. Traslado terrestre hasta el embarcadero, cruce en ferry no incluido.": "Across from Cancún, Isla Mujeres offers calm shallow beaches, a colorful town and golf-cart rides. Ground transfer to the ferry terminal is included; the ferry crossing is not.",
  "Cozumel es reconocida mundialmente por sus arrecifes de coral, ideales para buceo y esnórquel. Traslado terrestre hasta el puerto de embarque; el cruce en ferry se contrata por separado.": "Cozumel is world-famous for coral reefs ideal for diving and snorkeling. Ground transfer takes you to the departure port; the ferry crossing is booked separately.",
  "Xcaret combina naturaleza, ríos subterráneos, vida silvestre y espectáculos culturales en un solo parque. Una de las excursiones de un día más solicitadas desde Cancún.": "Xcaret combines nature, underground rivers, wildlife and cultural shows in one park. It is one of the most popular day trips from Cancún.",
  "El conductor nos esperó en la sala de llegadas con un letrero y nos llevó directo al hotel en Zona Hotelera. Muy puntual y el vehículo impecable.": "Our driver waited in arrivals with a sign and took us straight to our hotel in the Hotel Zone. Right on time, with a spotless vehicle.",
  "Rentamos el transporte por día completo para movernos entre Tulum y los cenotes cercanos. Comodidad total y el chofer conocía muy bien la zona.": "We booked transportation for a full day between Tulum and nearby cenotes. Total comfort, and the driver knew the area extremely well.",
  "Coordinamos un traslado especial para una boda con recepción de bienvenida para los invitados. Todo salió a tiempo y sin contratiempos.": "We arranged special transportation for a wedding, including a welcome for our guests. Everything ran on time and without a hitch.",
  "Viajamos en grupo familiar con niños pequeños y el vehículo tenía espacio de sobra para el equipaje. Excelente comunicación antes del viaje.": "We traveled as a family group with young children and had plenty of room for luggage. Excellent communication before the trip.",
  "Muy buena opción para llegar a Xcaret sin depender de tours. El conductor nos recogió puntual de regreso al hotel.": "A great way to reach Xcaret without relying on tours. The driver picked us up right on time for the return to our hotel.",
};

const EN_TO_ES = Object.fromEntries(Object.entries(ES_TO_EN).map(([es, en]) => [en, es]));

interface LanguageContextValue {
  language: PublicLanguage;
  toggleLanguage: () => void;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

function translateValue(value: string, language: PublicLanguage) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const clean = value.trim();
  if (!clean) return value;
  const dictionary = language === "en" ? ES_TO_EN : EN_TO_ES;
  let translated = dictionary[clean];
  if (!translated && language === "en") {
    if (clean.startsWith("Pagar ")) translated = clean.replace(/^Pagar /, "Pay ");
    else if (clean.startsWith("Desde ")) translated = clean.replace(/^Desde /, "From ");
    else if (clean.endsWith(" min desde el aeropuerto")) translated = clean.replace(" min desde el aeropuerto", " min from the airport");
  }
  if (!translated && language === "es") {
    if (clean.startsWith("Pay ")) translated = clean.replace(/^Pay /, "Pagar ");
    else if (clean.startsWith("From ")) translated = clean.replace(/^From /, "Desde ");
    else if (clean.endsWith(" min from the airport")) translated = clean.replace(" min from the airport", " min desde el aeropuerto");
  }
  return translated ? `${leading}${translated}${trailing}` : value;
}

function translateRoot(root: ParentNode, language: PublicLanguage) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const current = node.nodeValue ?? "";
    const next = translateValue(current, language);
    if (next !== current) node.nodeValue = next;
    node = walker.nextNode();
  }

  root.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title]").forEach((element) => {
    ["placeholder", "aria-label", "title"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value) element.setAttribute(attribute, translateValue(value, language));
    });
  });
}

export function PublicLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<PublicLanguage>("es");

  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en") setLanguage("en");
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);

    const roots = document.querySelectorAll<HTMLElement>(".adventure-theme");
    roots.forEach((root) => translateRoot(root, language));

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") {
          const current = mutation.target.nodeValue ?? "";
          const next = translateValue(current, language);
          if (next !== current) mutation.target.nodeValue = next;
          return;
        }
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const current = node.nodeValue ?? "";
            const next = translateValue(current, language);
            if (next !== current) node.nodeValue = next;
          } else if (node instanceof HTMLElement && node.closest(".adventure-theme")) {
            translateRoot(node, language);
          }
        });
      });
    });
    roots.forEach((root) => observer.observe(root, { childList: true, characterData: true, subtree: true }));
    return () => observer.disconnect();
  }, [language]);

  const value = React.useMemo(
    () => ({ language, toggleLanguage: () => setLanguage((current) => (current === "es" ? "en" : "es")) }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function usePublicLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) throw new Error("usePublicLanguage must be used within PublicLanguageProvider");
  return context;
}

export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { language, toggleLanguage } = usePublicLanguage();
  const english = language === "en";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={english}
      aria-label={english ? "Cambiar idioma a español" : "Cambiar idioma a inglés"}
      onClick={toggleLanguage}
      className={`adventure-language-switch${compact ? " adventure-language-switch--compact" : ""}`}
    >
      <span className={!english ? "is-active" : ""}>ES</span>
      <i aria-hidden />
      <span className={english ? "is-active" : ""}>EN</span>
    </button>
  );
}
