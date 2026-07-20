// Catálogo mock de aeropuertos usado en el mini-cotizador de la Landing Page
// para los traslados Hotel-Aeropuerto / Aeropuerto-Hotel. Solo para el DEMO.

export interface Airport {
  id: string;
  code: string;
  name: string;
}

export const AIRPORTS: Airport[] = [
  { id: "airport-cun", code: "CUN", name: "Aeropuerto Internacional de Cancún (CUN)" },
  { id: "airport-tqo", code: "TQO", name: "Aeropuerto Internacional de Tulum Felipe Carrillo Puerto (TQO)" },
  { id: "airport-czm", code: "CZM", name: "Aeropuerto Internacional de Cozumel (CZM)" },
  { id: "airport-ctm", code: "CTM", name: "Aeropuerto Internacional de Chetumal (CTM)" },
];
