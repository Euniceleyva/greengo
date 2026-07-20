// Catálogo mock de destinos de tour (fuente: destinos.txt) usado en el
// mini-cotizador de la Landing Page para el tipo de traslado "Tour". Precios
// y tiempos son ilustrativos, no reflejan tarifas reales del negocio.

export interface TourDestination {
  id: string;
  name: string;
  priceFromUSD: number;
  transferLabel: string;
}

export const TOUR_DESTINATIONS: TourDestination[] = [
  { id: "tour-cancun", name: "Cancun", priceFromUSD: 44, transferLabel: "20 minutes" },
  { id: "tour-ferry-to-isla-mujeres", name: "Ferry to Isla Mujeres", priceFromUSD: 50, transferLabel: "35 minutes" },
  { id: "tour-costa-mujeres", name: "Costa Mujeres", priceFromUSD: 56, transferLabel: "35 minutes" },
  { id: "tour-puerto-morelos", name: "Puerto Morelos", priceFromUSD: 63, transferLabel: "35 minutes" },
  { id: "tour-bahia-petempich", name: "Bahia Petempich", priceFromUSD: 50, transferLabel: "35 minutes" },
  { id: "tour-playa-del-carmen-ferry-to-cozumel", name: "Playa del Carmen (Ferry to Cozumel)", priceFromUSD: 75, transferLabel: "55 minutes" },
  { id: "tour-puerto-aventuras", name: "Puerto Aventuras", priceFromUSD: 100, transferLabel: "1 hr and 30 minutes" },
  { id: "tour-bahia-principe", name: "Bahia Principe", priceFromUSD: 106, transferLabel: "1 hour and 25 minutes" },
  { id: "tour-akumal", name: "Akumal", priceFromUSD: 106, transferLabel: "1 hour and 45 minutes" },
  { id: "tour-tulum", name: "Tulum", priceFromUSD: 156, transferLabel: "2 hours" },
];
