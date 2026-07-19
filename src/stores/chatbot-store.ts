"use client";

// Estado del widget de chatbot guiado (flujo de respuestas predefinidas, sin IA).
// TODO(prod): conectar a un motor conversacional real.

import { create } from "zustand";
import { CHATBOT_NODES, CHATBOT_START_NODE_ID } from "@/mocks/chatbot";

export interface ChatMessage {
  id: string;
  from: "bot" | "user";
  text: string;
}

interface ChatbotState {
  isOpen: boolean;
  isTyping: boolean;
  currentNodeId: string;
  messages: ChatMessage[];
  toggleOpen: () => void;
  close: () => void;
  selectOption: (label: string, nextNodeId: string) => void;
  recordChoice: (label: string) => void;
  resetChat: () => void;
}

function initialMessages(): ChatMessage[] {
  return [{ id: "msg-start", from: "bot", text: CHATBOT_NODES[CHATBOT_START_NODE_ID].message }];
}

export const useChatbotStore = create<ChatbotState>()((set, get) => ({
  isOpen: false,
  isTyping: false,
  currentNodeId: CHATBOT_START_NODE_ID,
  messages: initialMessages(),

  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
  close: () => set({ isOpen: false }),

  selectOption: (label, nextNodeId) => {
    const userMsg: ChatMessage = { id: `msg-${Date.now()}-u`, from: "user", text: label };
    set((s) => ({ messages: [...s.messages, userMsg], isTyping: true }));

    setTimeout(() => {
      const node = CHATBOT_NODES[nextNodeId];
      if (!node) {
        set({ isTyping: false });
        return;
      }
      const botMsg: ChatMessage = { id: `msg-${Date.now()}-b`, from: "bot", text: node.message };
      set((s) => ({ messages: [...s.messages, botMsg], isTyping: false, currentNodeId: nextNodeId }));
    }, 900);
  },

  recordChoice: (label) => {
    const userMsg: ChatMessage = { id: `msg-${Date.now()}-u`, from: "user", text: label };
    set((s) => ({ messages: [...s.messages, userMsg] }));
  },

  resetChat: () => {
    const { currentNodeId } = get();
    if (currentNodeId === CHATBOT_START_NODE_ID) return;
    set({ currentNodeId: CHATBOT_START_NODE_ID, messages: initialMessages(), isTyping: false });
  },
}));
