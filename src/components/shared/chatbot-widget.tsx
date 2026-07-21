"use client";

// Widget de chatbot guiado: árbol de decisión con respuestas predefinidas, sin IA.
// TODO(prod): conectar a un motor conversacional real.

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bot, MessageSquareText, X } from "lucide-react";
import { useChatbotStore } from "@/stores/chatbot-store";
import { CHATBOT_NODES } from "@/mocks/chatbot";
import { WHATSAPP_PHONE } from "@/constants";
import { cn } from "@/lib/utils";
import type { ChatbotOption } from "@/types";

export function ChatbotWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, isTyping, currentNodeId, messages, toggleOpen, selectOption, recordChoice } = useChatbotStore();
  const listRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  React.useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) toggleOpen();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, toggleOpen]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/driver")) return null;

  const node = CHATBOT_NODES[currentNodeId];

  const handleOption = (option: ChatbotOption) => {
    if (option.action.kind === "node") {
      selectOption(option.label, option.action.nodeId);
      return;
    }
    if (option.action.kind === "whatsapp") {
      recordChoice(option.label);
      const message = "Hola, quiero hablar con un asesor de GreenGo Traslados.";
      window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      return;
    }
    // action.kind === "link"
    recordChoice(option.label);
    toggleOpen();
    router.push(option.action.href);
  };

  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-label="Asistente virtual de GreenGo"
          className="fixed bottom-40 right-5 z-40 flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-[24px] border-2 border-tropical-border bg-tropical-card shadow-sketch sm:bottom-44 sm:right-6"
        >
          <div className="flex items-center justify-between bg-gradient-tropical px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" aria-hidden />
              <span className="font-urbanist text-sm font-bold">Asistente GreenGo</span>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={toggleOpen}
              aria-label="Cerrar asistente"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  m.from === "bot"
                    ? "mr-auto bg-tropical-surface text-tropical-text"
                    : "ml-auto bg-tropical-primary text-white",
                )}
              >
                {m.text}
              </div>
            ))}
            {isTyping && (
              <div className="mr-auto flex items-center gap-1 rounded-xl bg-tropical-surface px-3 py-2 text-sm text-tropical-muted">
                <span className="animate-pulse">Escribiendo…</span>
              </div>
            )}
          </div>

          {!isTyping && (
            <div className="flex flex-wrap gap-2 border-t-2 border-dashed border-tropical-border p-3">
              {node.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOption(option)}
                  className="min-h-[44px] rounded-full border-2 border-tropical-primary/30 bg-tropical-primary/10 px-3 text-sm font-semibold text-tropical-primary transition-colors hover:bg-tropical-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tropical-secondary"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        aria-label={isOpen ? "Cerrar asistente virtual" : "Abrir asistente virtual"}
        aria-expanded={isOpen}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-tropical text-white shadow-sketch transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tropical-secondary focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden /> : <MessageSquareText className="h-6 w-6" aria-hidden />}
      </button>
    </>
  );
}
