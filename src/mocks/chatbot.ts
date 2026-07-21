import type { ChatbotNode } from "@/types";

// Árbol de decisión del chatbot guiado. Respuestas 100% predefinidas, sin IA.
// TODO(prod): conectar a un motor conversacional real.
export const CHATBOT_NODES: Record<string, ChatbotNode> = {
  start: {
    id: "start",
    message: "Hola. Soy el asistente virtual de Atria Transfers. ¿En qué te puedo ayudar?",
    options: [
      { id: "opt-cotizar", label: "Cotizar un traslado", action: { kind: "node", nodeId: "cotizar" } },
      { id: "opt-destinos", label: "Ver destinos", action: { kind: "node", nodeId: "destinos" } },
      { id: "opt-servicios", label: "Tipos de servicio", action: { kind: "node", nodeId: "servicios" } },
      { id: "opt-humano", label: "Hablar con un humano", action: { kind: "node", nodeId: "humano" } },
    ],
  },
  cotizar: {
    id: "cotizar",
    message:
      "Puedes cotizar tu traslado en segundos: elige origen, destino, fecha y número de pasajeros en nuestro formulario de reserva.",
    options: [
      { id: "opt-ir-reservar", label: "Ir a cotizar", action: { kind: "link", href: "/reservar" } },
      { id: "opt-volver-1", label: "Volver al inicio", action: { kind: "node", nodeId: "start" } },
    ],
  },
  destinos: {
    id: "destinos",
    message:
      "Cubrimos los destinos más solicitados de Cancún y la Riviera Maya: Zona Hotelera, Playa del Carmen, Tulum, Isla Mujeres, Cozumel y Xcaret.",
    options: [
      { id: "opt-ver-destinos", label: "Ver todos los destinos", action: { kind: "link", href: "/#destinos" } },
      { id: "opt-volver-2", label: "Volver al inicio", action: { kind: "node", nodeId: "start" } },
    ],
  },
  servicios: {
    id: "servicios",
    message:
      "Ofrecemos 4 tipos de servicio: hotel a hotel, aeropuerto ↔ hotel, transporte abierto (chofer por periodo) y soluciones a medida.",
    options: [
      { id: "opt-ver-servicios", label: "Ver detalle de servicios", action: { kind: "link", href: "/#servicios" } },
      { id: "opt-volver-3", label: "Volver al inicio", action: { kind: "node", nodeId: "start" } },
    ],
  },
  humano: {
    id: "humano",
    message: "Con gusto te conectamos con nuestro equipo por WhatsApp para atenderte directamente.",
    options: [
      { id: "opt-whatsapp", label: "Abrir WhatsApp", action: { kind: "whatsapp" } },
      { id: "opt-volver-4", label: "Volver al inicio", action: { kind: "node", nodeId: "start" } },
    ],
  },
};

export const CHATBOT_START_NODE_ID = "start";
