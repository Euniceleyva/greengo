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
      const message = "Hola, quiero hablar con un asesor de Atria Transfers.";
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
          aria-label="Asistente virtual de Atria"
          className="marketing-widget fixed bottom-40 right-5 z-40 flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-none border border-border bg-card shadow-popover sm:bottom-44 sm:right-6"
        >
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" aria-hidden />
              <span className="text-sm font-semibold">Asistente Atria</span>
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
                    ? "mr-auto bg-secondary text-foreground"
                    : "ml-auto bg-primary text-primary-foreground",
                )}
              >
                {m.text}
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
                  className="min-h-[44px] rounded-full border border-primary/30 bg-primary-soft px-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        className="marketing-widget fixed bottom-3 right-3 z-40 flex h-12 w-12 items-center justify-center rounded-none bg-[hsl(var(--marketing-ink))] text-[hsl(var(--marketing-paper))] shadow-popover transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden /> : <MessageSquareText className="h-6 w-6" aria-hidden />}
      </button>
    </>
  );
}
