"use client";

import * as React from "react";

export type PublicLanguage = "es" | "en";
export type PublicCurrency = "MXN" | "USD";

export const PUBLIC_LANGUAGE_STORAGE_KEY = "marea-public-language";
export const DEMO_MXN_PER_USD = 17;

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
  "Tasa demo: 1 USD = 17 MXN": "Demo rate: 1 USD = 17 MXN",
  "Desde": "From",
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
  "Cuatro pasos claros. Cero vueltas innecesarias.": "Four clear steps. Zero unnecessary detours.",
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
  "Traslados privados en Cancún y Riviera Maya": "Private transfers in Cancún and the Riviera Maya",
  "TRASLADOS PRIVADOS EN CANCÚN Y RIVIERA MAYA": "PRIVATE TRANSFERS IN CANCÚN AND THE RIVIERA MAYA",
  "Traslados": "Transfers",
  "privados": "private",
  "en Cancún": "in Cancún",
  "en Cancún,": "in Cancún,",
  "y Riviera Maya.": "and the Riviera Maya.",
  "sin sorpresas.": "no surprises.",
  "Traslados privados en Cancún, sin esperas ni sorpresas": "Private transfers in Cancún, no waiting or surprises",
  "Aterriza. Sube. Disfruta.": "Land. Hop in. Enjoy.",
  "ATERRIZA.": "LAND.",
  "SUBE.": "HOP IN.",
  "DISFRUTA.": "ENJOY.",
  "Reserva transporte privado desde el Aeropuerto de Cancún hacia tu hotel, parque, playa o experiencia en la Riviera Maya. Viaja cómodo, seguro y sin esperas innecesarias.": "Book private transportation from Cancún Airport to your hotel, park, beach or Riviera Maya experience. Travel comfortably, safely and without unnecessary waits.",
  "Reserva transporte privado desde el Aeropuerto de Cancún hacia tu hotel, tour o destino en la Riviera Maya. Seguimos tu vuelo, cuidamos tu equipaje y te mostramos la tarifa antes de confirmar.": "Book private transportation from Cancún Airport to your hotel, tour or Riviera Maya destination. We track your flight, take care of your luggage and show you the fare before confirming.",
  "Te recogemos en el Aeropuerto de Cancún y te llevamos cómodamente a tu hotel o destino. Servicio privado, seguimiento de vuelo y tarifa clara desde el inicio.": "We pick you up at Cancún Airport and take you comfortably to your hotel or destination. Private service, flight tracking and a clear fare from the start.",
  "Tu chofer te espera al aterrizar en el Aeropuerto de Cancún. Seguimos tu vuelo y te llevamos directo a tu hotel o destino en la Riviera Maya, con tarifa clara desde el primer mensaje.": "Your driver waits for you when you land at Cancún Airport. We track your flight and take you straight to your hotel or Riviera Maya destination, with a clear fare from the first message.",
  "Reserva tu traslado privado desde el Aeropuerto de Cancún y empieza tus vacaciones sin filas ni negociaciones. Te llevamos directo a tu hotel, tour o destino en la Riviera Maya con seguimiento de vuelo y tarifa clara.": "Book your private transfer from Cancún Airport and start your vacation with no lines or negotiations. We take you straight to your hotel, tour or Riviera Maya destination with flight tracking and a clear fare.",
  "Reserva tu traslado privado desde el Aeropuerto de Cancún y empieza tus vacaciones sin filas ni negociaciones. Te llevamos directo a tu hotel, tour o destino.": "Book your private transfer from Cancún Airport and start your vacation with no lines or negotiations. We take you straight to your hotel, tour or destination.",
  "Cotizar traslado privado": "Quote private transfer",
  "Cotizar mi traslado": "Quote my transfer",
  "Ver tarifa de mi traslado": "See my transfer fare",
  "Aeropuerto de Cancún → hotel o destino": "Cancún Airport → hotel or destination",
  "Cotiza tu traslado en Cancún": "Quote your transfer in Cancún",
  "Tarifa clara antes de confirmar": "Clear fare before confirming",
  "Cotiza tu ruta en Cancún": "Quote your route in Cancún",
  "Servicios de transporte privado": "Private transportation services",
  "Traslados en Cancún para cada tipo de viaje.": "Cancún transfers for every type of trip.",
  "Traslados en Cancún sin filas, prisas ni costos ocultos.": "Cancún transfers with no lines, rushing or hidden costs.",
  "Del aeropuerto al hotel, entre resorts o a tus tours favoritos. Tú pones el plan; nosotros conectamos los puntos.": "From the airport to your hotel, between resorts or to your favorite tours. You make the plan; we connect the dots.",
  "Del aeropuerto al hotel, entre resorts o a tus tours favoritos. Tú pones el plan; nosotros ponemos puntualidad, ruta clara y conductor listo.": "From the airport to your hotel, between resorts or to your favorite tours. You make the plan; we bring punctuality, a clear route and a ready driver.",
  "Traslados directos entre hoteles de Cancún, Playa del Carmen, Tulum y la Riviera Maya, sin escalas ni transbordos.": "Direct transfers between hotels in Cancún, Playa del Carmen, Tulum and the Riviera Maya, with no stops or connections.",
  "Servicio privado desde o hacia el Aeropuerto de Cancún con seguimiento de vuelo, recepción en llegadas y salida puntual.": "Private service to or from Cancún Airport with flight tracking, arrivals reception and punctual departure.",
  "Vehículo privado con chofer por horas o por día completo para visitar playas, cenotes, parques y restaurantes a tu ritmo.": "Private vehicle with driver by the hour or full day to visit beaches, cenotes, parks and restaurants at your pace.",
  "Transporte para grupos, bodas, eventos y recepciones especiales con rutas planeadas para tu itinerario.": "Transportation for groups, weddings, events and special welcomes with routes planned around your itinerary.",
  "Cambia de hotel sin perder medio día: vamos por ti a la puerta y te llevamos directo a tu siguiente resort en Cancún, Playa del Carmen o Tulum.": "Change hotels without losing half a day: we pick you up at the door and take you straight to your next resort in Cancún, Playa del Carmen or Tulum.",
  "Te esperamos en llegadas, seguimos tu vuelo y te llevamos directo a tu hotel sin filas, transbordos ni esperas innecesarias.": "We wait for you at arrivals, track your flight and take you straight to your hotel with no lines, transfers or unnecessary waits.",
  "Un vehículo privado con chofer local por horas o día completo para visitar playas, cenotes, parques y restaurantes a tu ritmo.": "A private vehicle with a local driver by the hour or full day to visit beaches, cenotes, parks and restaurants at your pace.",
  "Coordinamos vans, sprinters y rutas para grupos, bodas o eventos, con horarios claros y atención por WhatsApp.": "We coordinate vans, Sprinters and routes for groups, weddings or events, with clear schedules and WhatsApp support.",
  "Traslados desde el Aeropuerto de Cancún a la Riviera Maya.": "Transfers from Cancún Airport to the Riviera Maya.",
  "Rutas a hoteles, playas,": "Routes to hotels, beaches,",
  "parques y ferries.": "parks and ferries.",
  "Cotiza tu traslado privado": "Quote your private transfer",
  "Indica origen, destino, fecha, horario, pasajeros y equipaje en el formulario de reserva.": "Enter origin, destination, date, time, passengers and luggage in the booking form.",
  "Revisa la tarifa estimada, comparte tus datos de contacto y recibe los detalles del servicio.": "Review the estimated fare, share your contact details and receive the service information.",
  "Reserva tu traslado privado en 4 pasos.": "Book your private transfer in 4 steps.",
  "Un proceso claro para llegar del Aeropuerto de Cancún a tu hotel o destino sin vueltas innecesarias.": "A clear process to get from Cancún Airport to your hotel or destination without unnecessary detours.",
  "Preguntas frecuentes sobre traslados en Cancún.": "Frequently asked questions about transfers in Cancún.",
  "Equipaje, vuelos, horarios, pagos y cambios: aquí están las respuestas rápidas antes de reservar.": "Luggage, flights, schedules, payments and changes: here are the quick answers before booking.",
  "Viajeros que reservaron transporte privado con GreenGo.": "Travelers who booked private transportation with GreenGo.",
  "Experiencias de rutas al aeropuerto, hoteles, parques y destinos de la Riviera Maya.": "Experiences on routes to the airport, hotels, parks and Riviera Maya destinations.",
  "Transporte privado cómodo, puntual y listo para tu ruta.": "Comfortable, punctual private transportation ready for your route.",
  "Viaja en unidades privadas y espaciosas, con atención personalizada desde el Aeropuerto de Cancún hasta tu hotel, parque o destino.": "Travel in spacious private vehicles with personalized attention from Cancún Airport to your hotel, park or destination.",
  "Seguimos tu vuelo en tiempo real": "We track your flight in real time",
  "Cuidamos tu equipaje como si fuera nuestro": "We take care of your luggage like it is ours",
  "Conductores locales que conocen la ruta": "Local drivers who know the route",
  "Unidades limpias y verificadas": "Clean, checked vehicles",
  "Atención por WhatsApp antes y durante tu viaje": "WhatsApp support before and during your trip",
  "Tu traslado empieza tranquilo desde el primer mensaje.": "Your transfer feels calm from the first message.",
  "Viaja en unidades privadas y espaciosas, con atención por WhatsApp desde que cotizas hasta que llegas a tu hotel, parque o destino.": "Travel in spacious private vehicles with WhatsApp support from quote to arrival at your hotel, park or destination.",
  "Recepción en el Aeropuerto de Cancún": "Reception at Cancún Airport",
  "Seguimiento de vuelo para ajustar tu pickup": "Flight tracking to adjust your pickup",
  "Conductores locales para rutas en Riviera Maya": "Local drivers for Riviera Maya routes",
  "Vehículos privados, limpios y verificados": "Private, clean and checked vehicles",
  "Tarifa clara antes de confirmar tu reserva": "Clear fare before confirming your booking",
  "Atención por WhatsApp antes y durante el traslado": "WhatsApp support before and during the transfer",
  "Seguro de pasajero incluido": "Passenger insurance included",
  "Transporte privado en Cancún con la confianza que buscas al llegar.": "Private transportation in Cancún with the confidence you want when you arrive.",
  "Cotiza tu traslado desde el aeropuerto a hoteles, tours y destinos de la Riviera Maya con atención personalizada antes, durante y después del viaje.": "Quote your transfer from the airport to hotels, tours and Riviera Maya destinations with personalized support before, during and after the trip.",
  "Rutas frecuentes: Cancún, Playa del Carmen, Tulum, Xcaret e Isla Mujeres.": "Frequent routes: Cancún, Playa del Carmen, Tulum, Xcaret and Isla Mujeres.",
  "Traslado hotel a hotel": "Hotel-to-hotel transfer",
  "Muévete entre resorts sin perder tiempo: te recogemos en tu lobby y te llevamos directo a tu siguiente hotel en Cancún, Playa del Carmen, Tulum o Riviera Maya.": "Move between resorts without wasting time: we pick you up in your lobby and take you straight to your next hotel in Cancún, Playa del Carmen, Tulum or the Riviera Maya.",
  "Aeropuerto de Cancún ↔ hotel": "Cancún Airport ↔ hotel",
  "Reserva tu traslado desde o hacia el Aeropuerto de Cancún con recepción en llegadas, seguimiento de vuelo y ruta directa a tu hotel.": "Book your transfer to or from Cancún Airport with arrivals reception, flight tracking and a direct route to your hotel.",
  "Transporte privado con chofer": "Private transportation with driver",
  "Contrata un vehículo con chofer local por horas o día completo para visitar playas, cenotes, restaurantes, parques y puntos turísticos a tu ritmo.": "Book a vehicle with a local driver by the hour or full day to visit beaches, cenotes, restaurants, parks and tourist spots at your pace.",
  "Transporte para grupos y eventos": "Transportation for groups and events",
  "Coordinamos vans, sprinters y rutas para bodas, familias, agencias y grupos, con horarios claros y soporte por WhatsApp.": "We coordinate vans, Sprinters and routes for weddings, families, agencies and groups, with clear schedules and WhatsApp support.",
  "Servicios de traslados privados en Cancún": "Private transfer services in Cancún",
  "Elige el traslado que necesitas en Cancún y Riviera Maya.": "Choose the transfer you need in Cancún and the Riviera Maya.",
  "Del Aeropuerto de Cancún a tu hotel, entre resorts o hacia tus tours favoritos. Tú eliges la ruta; GreenGo coordina conductor, horario y tarifa clara.": "From Cancún Airport to your hotel, between resorts or to your favorite tours. You choose the route; GreenGo coordinates driver, schedule and clear fare.",
  "Cotizar servicio": "Quote service",
  "Rutas populares desde el Aeropuerto de Cancún.": "Popular routes from Cancún Airport.",
  "Hoteles, playas,": "Hotels, beaches,",
  "tours y ferries.": "tours and ferries.",
  "Ver traslado": "See transfer",
  "Cotiza tu ruta": "Quote your route",
  "Indica origen, destino, fecha, horario, pasajeros y equipaje para calcular tu traslado privado.": "Enter origin, destination, date, time, passengers and luggage to calculate your private transfer.",
  "Confirma con tarifa clara": "Confirm with a clear fare",
  "Revisa los detalles del servicio antes de reservar y evita sorpresas al llegar a Cancún.": "Review the service details before booking and avoid surprises when you arrive in Cancún.",
  "Tu conductor te espera": "Your driver waits for you",
  "Te recibimos en el aeropuerto, hotel o punto acordado, con seguimiento de vuelo cuando aplica.": "We meet you at the airport, hotel or agreed point, with flight tracking when applicable.",
  "Reserva en línea": "Book online",
  "Cómo reservar tu traslado privado en Cancún.": "How to book your private transfer in Cancún.",
  "Un proceso simple para viajar del Aeropuerto de Cancún a tu hotel, tour o destino con conductor asignado y soporte por WhatsApp.": "A simple process to travel from Cancún Airport to your hotel, tour or destination with an assigned driver and WhatsApp support.",
  "Traslados privados que viajeros y grupos eligen en Cancún.": "Private transfers travelers and groups choose in Cancún.",
  "Rutas frecuentes al aeropuerto, hoteles, parques y destinos de la Riviera Maya con atención clara desde la reserva.": "Frequent routes to the airport, hotels, parks and Riviera Maya destinations with clear support from booking.",
  "Preguntas frecuentes sobre traslados privados en Cancún.": "Frequently asked questions about private transfers in Cancún.",
  "Resuelve dudas sobre el Aeropuerto de Cancún, equipaje, vuelos, pagos, cambios y transporte para grupos antes de reservar.": "Get answers about Cancún Airport, luggage, flights, payments, changes and group transportation before booking.",
  "GreenGo Transfers ofrece traslados privados en Cancún y Riviera Maya desde el aeropuerto hasta hoteles, tours, eventos y terminales de ferry.": "GreenGo Transfers offers private transfers in Cancún and the Riviera Maya from the airport to hotels, tours, events and ferry terminals.",
  "Traslados desde el Aeropuerto de Cancún a Zona Hotelera, Playa del Carmen, Tulum, Isla Mujeres, Cozumel, Xcaret y más destinos de Riviera Maya.": "Transfers from Cancún Airport to the Hotel Zone, Playa del Carmen, Tulum, Isla Mujeres, Cozumel, Xcaret and more Riviera Maya destinations.",
  "Traslados privados en Cancún y la Riviera Maya desde el aeropuerto hasta tu hotel, tour o evento.": "Private transfers in Cancún and the Riviera Maya from the airport to your hotel, tour or event.",
  "Servicio de traslados privados en Cancún, Playa del Carmen, Tulum, Isla Mujeres, Cozumel y Xcaret.": "Private transfer service in Cancún, Playa del Carmen, Tulum, Isla Mujeres, Cozumel and Xcaret.",
  "Traslado privado a": "Private transfer to",
  "Por qué viajar a": "Why travel to",
  "Otros traslados en la Riviera Maya": "More transfers in the Riviera Maya",
  "Traslado privado desde el Aeropuerto de Cancún a hoteles frente al Caribe mexicano.": "Private transfer from Cancún Airport to hotels facing the Mexican Caribbean.",
  "Viaja del Aeropuerto Internacional de Cancún a la Zona Hotelera en una unidad privada, sin filas ni transbordos. Esta franja concentra resorts frente al mar, playas de arena blanca, restaurantes, centros comerciales y vida nocturna, por lo que es una de las rutas más solicitadas para iniciar vacaciones con comodidad.": "Travel from Cancún International Airport to the Hotel Zone in a private vehicle, with no lines or transfers. This strip brings together beachfront resorts, white-sand beaches, restaurants, shopping centers and nightlife, making it one of the most requested routes for starting vacation comfortably.",
  "Transporte privado desde Cancún a Playa del Carmen, Quinta Avenida y ferry a Cozumel.": "Private transportation from Cancún to Playa del Carmen, Fifth Avenue and the ferry to Cozumel.",
  "Reserva un traslado privado desde el Aeropuerto de Cancún o tu hotel hacia Playa del Carmen. La ruta conecta con resorts, la Quinta Avenida, restaurantes, beach clubs y la terminal de ferry a Cozumel, ideal para quienes quieren moverse por la Riviera Maya con horario propio.": "Book a private transfer from Cancún Airport or your hotel to Playa del Carmen. The route connects with resorts, Fifth Avenue, restaurants, beach clubs and the ferry terminal to Cozumel, ideal for travelers who want to move around the Riviera Maya on their own schedule.",
  "Traslado privado de Cancún a Tulum, zona hotelera, ruinas y cenotes.": "Private transfer from Cancún to Tulum, hotel zone, ruins and cenotes.",
  "El traslado de Cancún a Tulum es una de las rutas largas más buscadas de la Riviera Maya. Con GreenGo puedes viajar en transporte privado hacia la zona hotelera, el centro, las ruinas mayas frente al Caribe o cenotes cercanos, con espacio para equipaje y salida ajustada a tu itinerario.": "The transfer from Cancún to Tulum is one of the Riviera Maya's most searched long routes. With GreenGo you can travel by private transportation to the hotel zone, downtown, the Mayan ruins facing the Caribbean or nearby cenotes, with room for luggage and departure adjusted to your itinerary.",
  "Transporte privado al ferry de Isla Mujeres desde aeropuerto, hotel o Zona Hotelera.": "Private transportation to the Isla Mujeres ferry from the airport, hotel or Hotel Zone.",
  "Llegar a Isla Mujeres comienza con un traslado terrestre privado al embarcadero de Cancún. Te llevamos desde el aeropuerto o tu hotel hasta la terminal de ferry para que cruces hacia playas tranquilas, el centro de la isla y sus paseos en golf cart. El cruce marítimo se contrata por separado.": "Getting to Isla Mujeres starts with a private ground transfer to the Cancún dock. We take you from the airport or your hotel to the ferry terminal so you can cross to calm beaches, the island center and golf-cart rides. The ferry crossing is booked separately.",
  "Traslado privado a la terminal de ferry a Cozumel desde Cancún o Riviera Maya.": "Private transfer to the Cozumel ferry terminal from Cancún or the Riviera Maya.",
  "Para viajar a Cozumel, coordinamos tu transporte privado hasta el puerto de embarque en Playa del Carmen. Es una ruta cómoda desde Cancún, hoteles de la Riviera Maya o el aeropuerto, pensada para conectar con el ferry hacia una isla famosa por arrecifes, buceo y esnórquel.": "To travel to Cozumel, we coordinate your private transportation to the departure port in Playa del Carmen. It is a comfortable route from Cancún, Riviera Maya hotels or the airport, designed to connect with the ferry to an island known for reefs, diving and snorkeling.",
  "Transporte privado a Xcaret desde Cancún, Playa del Carmen o tu hotel.": "Private transportation to Xcaret from Cancún, Playa del Carmen or your hotel.",
  "Evita depender de horarios de tour y reserva transporte privado a Xcaret desde Cancún, Playa del Carmen o cualquier hotel de la Riviera Maya. Te llevamos al parque y podemos coordinar el regreso después de sus ríos subterráneos, actividades naturales y espectáculos culturales.": "Avoid relying on tour schedules and book private transportation to Xcaret from Cancún, Playa del Carmen or any Riviera Maya hotel. We take you to the park and can coordinate the return after its underground rivers, nature activities and cultural shows.",
  "¿Cómo reservo un traslado privado en Cancún?": "How do I book a private transfer in Cancún?",
  "Completa el formulario de cotización rápida o entra a \"Reservar ahora\". Elige el tipo de servicio, origen, destino, fecha, horario, pasajeros y datos de contacto para confirmar tu traslado.": "Complete the quick quote form or go to \"Book now\". Choose the service type, origin, destination, date, time, passengers and contact details to confirm your transfer.",
  "Completa el formulario de cotización rápida o entra a \"Reservar ahora\". Elige origen, destino, fecha, horario y pasajeros; revisa la tarifa y confirma tus datos para apartar tu traslado.": "Complete the quick quote form or go to \"Book now\". Choose origin, destination, date, time and passengers; review the fare and confirm your details to reserve your transfer.",
  "Completa el formulario de cotización rápida o entra a \"Reservar ahora\". Elige origen, destino, fecha, horario y pasajeros; revisa la tarifa y confirma tus datos para apartar tu traslado privado.": "Complete the quick quote form or go to \"Book now\". Choose origin, destination, date, time and passengers; review the fare and confirm your details to reserve your private transfer.",
  "¿Qué pasa si mi vuelo al Aeropuerto de Cancún se retrasa?": "What happens if my flight to Cancún Airport is delayed?",
  "Monitoreamos el número de vuelo que proporcionas al reservar. Si el aterrizaje cambia, ajustamos la llegada del conductor para recibirte en el horario real.": "We monitor the flight number you provide when booking. If landing time changes, we adjust the driver's arrival to meet you at the actual time.",
  "¿Puedo cambiar mi reservación de traslado?": "Can I change my transfer booking?",
  "Sí, puedes solicitar cambios de fecha, hora, hotel o destino desde la confirmación de tu reservación o por WhatsApp con al menos 24 horas de anticipación.": "Yes, you can request changes to date, time, hotel or destination from your booking confirmation or by WhatsApp at least 24 hours in advance.",
  "¿Qué formas de pago aceptan para reservar?": "What payment methods do you accept for booking?",
  "Aceptamos tarjeta de crédito o débito, pago en efectivo en OXXO y transferencia SPEI. La disponibilidad de métodos de pago se confirma antes de finalizar tu reservación.": "We accept credit or debit cards, OXXO cash payments and SPEI transfers. Payment method availability is confirmed before finalizing your booking.",
  "¿Ofrecen transporte privado para grupos grandes?": "Do you offer private transportation for large groups?",
  "¿Cuánto equipaje puedo llevar en mi traslado?": "How much luggage can I bring on my transfer?",
  "¿La tarifa del traslado incluye casetas y estacionamiento?": "Does the transfer fare include tolls and parking?",
  "¿Ofrecen transporte privado para grupos en Cancún?": "Do you offer private transportation for groups in Cancún?",
  "Revisa la tarifa antes de pagar, comparte tus datos de contacto y recibe los detalles del servicio.": "Review the fare before paying, share your contact details and receive the service information.",
  "Tu conductor te espera en el punto acordado, con seguimiento de vuelo cuando aplica.": "Your driver waits at the agreed pickup point, with flight tracking when applicable.",
  "Un proceso claro para llegar del Aeropuerto de Cancún a tu hotel o destino con tarifa visible, conductor asignado y soporte por WhatsApp.": "A clear process to get from Cancún Airport to your hotel or destination with a visible fare, assigned driver and WhatsApp support.",
  "La tarifa se muestra antes de confirmar e incluye los conceptos indicados en tu cotización. Si algún estacionamiento o cargo especial aplica en destino, te lo avisamos antes del servicio.": "The fare is shown before confirming and includes the items listed in your quote. If parking or a special destination charge applies, we let you know before the service.",
  "Asistente GreenGo": "GreenGo Assistant",
  "Rutas, tarifas y reservas": "Routes, fares and bookings",
  "Asistente virtual de GreenGo": "GreenGo virtual assistant",
  "Cerrar asistente": "Close assistant",
  "Cerrar asistente virtual": "Close virtual assistant",
  "Abrir asistente virtual": "Open virtual assistant",
  "Escribiendo…": "Typing…",
  "¡Hola! Te ayudo a cotizar tu traslado privado en Cancún, revisar destinos o hablar con un asesor.": "Hi! I can help you quote your private transfer in Cancún, review destinations or talk to an advisor.",
  "Cotizar un traslado": "Quote a transfer",
  "Ver destinos": "See destinations",
  "Tipos de servicio": "Service types",
  "Hablar con un humano": "Talk to a person",
  "Cotiza tu ruta en segundos: elige origen, destino, fecha, horario y número de pasajeros.": "Quote your route in seconds: choose origin, destination, date, time and number of passengers.",
  "Ir a cotizar": "Go to quote",
  "Ver todos los destinos": "See all destinations",
  "Ver detalle de servicios": "See service details",
  "Abrir WhatsApp": "Open WhatsApp",
  "Volver al inicio del chat": "Back to chat start",
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

export function translatePublicText(value: string, language: PublicLanguage) {
  return translateValue(value, language);
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
    const saved = window.localStorage.getItem(PUBLIC_LANGUAGE_STORAGE_KEY);
    if (saved === "en") setLanguage("en");
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(PUBLIC_LANGUAGE_STORAGE_KEY, language);
    window.dispatchEvent(new CustomEvent("greengo-language-change", { detail: language }));

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

export function usePublicCurrency() {
  const { language } = usePublicLanguage();

  return React.useCallback(
    (amount: number, sourceCurrency: PublicCurrency = "MXN") => {
      const targetCurrency: PublicCurrency = language === "es" ? "MXN" : "USD";
      let converted = amount;

      if (sourceCurrency === "MXN" && targetCurrency === "USD") converted = amount / DEMO_MXN_PER_USD;
      if (sourceCurrency === "USD" && targetCurrency === "MXN") converted = amount * DEMO_MXN_PER_USD;

      const formatted = new Intl.NumberFormat(language === "es" ? "es-MX" : "en-US", {
        style: "currency",
        currency: targetCurrency,
        maximumFractionDigits: 0,
      }).format(converted);

      return `${formatted} ${targetCurrency}`;
    },
    [language],
  );
}

export function LocalizedCurrency({
  amount,
  sourceCurrency = "MXN",
}: {
  amount: number;
  sourceCurrency?: PublicCurrency;
}) {
  const formatCurrency = usePublicCurrency();
  return <>{formatCurrency(amount, sourceCurrency)}</>;
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
