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
import { usePublicLocale } from "./public-locale";

export function ChatbotWidget() {
  const { locale } = usePublicLocale();
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

  const isDemo = pathname.startsWith("/demo");

  const node = CHATBOT_NODES[currentNodeId];

  const handleOption = (option: ChatbotOption) => {
    if (option.action.kind === "node") {
      selectOption(option.label, option.action.nodeId);
      return;
    }
    if (option.action.kind === "whatsapp") {
      recordChoice(option.label);
      const message = "Hola, quiero hablar con un asesor de Marea.";
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
          aria-label="Asistente virtual de Marea"
          className={cn("fixed bottom-40 right-5 z-40 flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden border shadow-popover sm:bottom-44 sm:right-6", isDemo ? "rounded-2xl border-border bg-card" : "border-[#294b55] bg-[#fbf7ee]")}
        >
          <div className={cn("flex items-center justify-between px-4 py-3", isDemo ? "bg-primary text-primary-foreground" : "bg-[#0b2a36] text-white")}>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" aria-hidden />
              <span className="font-heading text-sm font-semibold">{isDemo ? "Asistente GreenGo" : locale === "es" ? "Concierge Marea" : "Marea Concierge"}</span>
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
                    ? isDemo ? "mr-auto bg-secondary text-foreground" : "mr-auto bg-[#e7dccb] text-[#173842]"
                    : isDemo ? "ml-auto bg-primary text-primary-foreground" : "ml-auto bg-[#326f73] text-white",
                )}
              >
                {isDemo ? m.text : locale === "es" ? m.text.replace("¡Hola! Soy el asistente virtual de GreenGo Traslados. ¿En qué te puedo ayudar?", "Hola, soy el concierge virtual de Marea. ¿Cómo puedo ayudarte con tu viaje?") : m.text.replace("¡Hola! Soy el asistente virtual de GreenGo Traslados. ¿En qué te puedo ayudar?", "Hello, I’m Marea’s virtual concierge. How can I help with your trip?")}
              </div>
            ))}
            {isTyping && (
              <div className="mr-auto flex items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-sm text-muted-foreground">
                <span className="animate-pulse">Escribiendo…</span>
              </div>
            )}
          </div>

          {!isTyping && (
            <div className="flex flex-wrap gap-2 border-t border-border p-3">
              {node.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOption(option)}
                  className={cn("min-h-[44px] px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2", isDemo ? "rounded-full border border-primary/30 bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-ring" : "border border-[#326f73]/35 bg-[#e7dccb] text-[#173842] hover:bg-[#326f73] hover:text-white focus-visible:ring-[#b95f46]")}
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
        className={cn("fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center shadow-popover transition-transform focus-visible:outline-none focus-visible:ring-2 sm:bottom-6 sm:right-6", isDemo ? "rounded-full bg-primary text-primary-foreground hover:scale-105 focus-visible:ring-ring focus-visible:ring-offset-2" : "bg-[#0b2a36] text-white duration-200 hover:-translate-y-1 focus-visible:ring-[#c4a162]")}
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden /> : <MessageSquareText className="h-6 w-6" aria-hidden />}
      </button>
    </>
  );
}
