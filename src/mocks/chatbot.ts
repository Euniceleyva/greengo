import type { ChatbotNode } from "@/types";

// Árbol de decisión del chatbot guiado. Respuestas 100% predefinidas, sin IA.
// TODO(prod): conectar a un motor conversacional real.
export const CHATBOT_NODES: Record<string, ChatbotNode> = {
  start: {
    id: "start",
    message: "¡Hola! Te ayudo a cotizar tu traslado privado en Cancún, revisar destinos o hablar con un asesor.",
    messageEn: "Hi! I can help you quote your private transfer in Cancún, review destinations or talk to an advisor.",
    options: [
      { id: "opt-cotizar", label: "Cotizar un traslado", labelEn: "Quote a transfer", action: { kind: "node", nodeId: "cotizar" } },
      { id: "opt-destinos", label: "Ver destinos", labelEn: "See destinations", action: { kind: "node", nodeId: "destinos" } },
      { id: "opt-servicios", label: "Tipos de servicio", labelEn: "Service types", action: { kind: "node", nodeId: "servicios" } },
      { id: "opt-humano", label: "Hablar con un humano", labelEn: "Talk to a person", action: { kind: "node", nodeId: "humano" } },
    ],
  },
  cotizar: {
    id: "cotizar",
    message:
      "Cotiza tu ruta en segundos: elige origen, destino, fecha, horario y número de pasajeros.",
    messageEn:
      "Quote your route in seconds: choose origin, destination, date, time and number of passengers.",
    options: [
      { id: "opt-ir-reservar", label: "Ir a cotizar", labelEn: "Go to quote", action: { kind: "link", href: "/reservar" } },
      { id: "opt-volver-1", label: "Volver al inicio del chat", labelEn: "Back to chat start", action: { kind: "node", nodeId: "start" } },
    ],
  },
  destinos: {
    id: "destinos",
    message:
      "Cubrimos los destinos más solicitados de Cancún y la Riviera Maya: Zona Hotelera, Playa del Carmen, Tulum, Isla Mujeres, Cozumel y Xcaret.",
    messageEn:
      "We cover the most requested destinations in Cancún and the Riviera Maya: Hotel Zone, Playa del Carmen, Tulum, Isla Mujeres, Cozumel and Xcaret.",
    options: [
      { id: "opt-ver-destinos", label: "Ver todos los destinos", labelEn: "See all destinations", action: { kind: "link", href: "/#destinos" } },
      { id: "opt-volver-2", label: "Volver al inicio del chat", labelEn: "Back to chat start", action: { kind: "node", nodeId: "start" } },
    ],
  },
  servicios: {
    id: "servicios",
    message:
      "Ofrecemos 4 tipos de servicio: hotel a hotel, aeropuerto ↔ hotel, transporte abierto (chofer por periodo) y soluciones a medida.",
    messageEn:
      "We offer 4 service types: hotel to hotel, airport ↔ hotel, open transportation with driver by period, and tailored solutions.",
    options: [
      { id: "opt-ver-servicios", label: "Ver detalle de servicios", labelEn: "See service details", action: { kind: "link", href: "/#servicios" } },
      { id: "opt-volver-3", label: "Volver al inicio del chat", labelEn: "Back to chat start", action: { kind: "node", nodeId: "start" } },
    ],
  },
  humano: {
    id: "humano",
    message: "Con gusto te conectamos con nuestro equipo por WhatsApp para atenderte directamente.",
    messageEn: "We can connect you with our team on WhatsApp for direct assistance.",
    options: [
      { id: "opt-whatsapp", label: "Abrir WhatsApp", labelEn: "Open WhatsApp", action: { kind: "whatsapp" } },
      { id: "opt-volver-4", label: "Volver al inicio del chat", labelEn: "Back to chat start", action: { kind: "node", nodeId: "start" } },
    ],
  },
};

export const CHATBOT_START_NODE_ID = "start";
