"use client";

// Widget de chatbot guiado: árbol de decisión con respuestas predefinidas, sin IA.
// TODO(prod): conectar a un motor conversacional real.

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Bot, MessageSquareText, Sparkles, X } from "lucide-react";
import { useChatbotStore } from "@/stores/chatbot-store";
import { CHATBOT_NODES } from "@/mocks/chatbot";
import { WHATSAPP_PHONE } from "@/constants";
import { cn } from "@/lib/utils";
import {
  PUBLIC_LANGUAGE_STORAGE_KEY,
  translatePublicText,
  type PublicLanguage,
} from "@/components/shared/public-language";
import type { ChatbotOption } from "@/types";

export function ChatbotWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, isTyping, currentNodeId, messages, toggleOpen, selectOption, recordChoice } = useChatbotStore();
  const [language, setLanguage] = React.useState<PublicLanguage>("es");
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

  React.useEffect(() => {
    const saved = window.localStorage.getItem(PUBLIC_LANGUAGE_STORAGE_KEY);
    if (saved === "en") setLanguage("en");
    else if (document.documentElement.lang === "en") setLanguage("en");

    const onLanguageChange = (event: Event) => {
      const next = (event as CustomEvent<PublicLanguage>).detail;
      if (next === "es" || next === "en") setLanguage(next);
    };

    window.addEventListener("greengo-language-change", onLanguageChange);
    return () => window.removeEventListener("greengo-language-change", onLanguageChange);
  }, []);

  if (pathname.startsWith("/admin") || pathname.startsWith("/driver")) return null;

  const node = CHATBOT_NODES[currentNodeId];
  const t = (value: string) => translatePublicText(value, language);
  const chatText = (message: { text: string; textEn?: string }) =>
    language === "en" ? message.textEn ?? t(message.text) : message.text;
  const optionLabel = (option: ChatbotOption) => (language === "en" ? option.labelEn : option.label);

  const handleOption = (option: ChatbotOption) => {
    if (option.action.kind === "node") {
      selectOption(option.label, option.labelEn, option.action.nodeId);
      return;
    }
    if (option.action.kind === "whatsapp") {
      recordChoice(option.label, option.labelEn);
      const message =
        language === "en"
          ? "Hi, I want to talk to a GreenGo Transfers advisor."
          : "Hola, quiero hablar con un asesor de GreenGo Traslados.";
      window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      return;
    }
    // action.kind === "link"
    recordChoice(option.label, option.labelEn);
    toggleOpen();
    router.push(option.action.href);
  };

  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-label={t("Asistente virtual de GreenGo")}
          className="greengo-chatbot-panel"
        >
          <div className="greengo-chatbot-header">
            <div className="flex min-w-0 items-center gap-3">
              <span className="greengo-chatbot-mark">
                <Bot className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <span className="greengo-chatbot-title">{t("Asistente GreenGo")}</span>
                <p className="greengo-chatbot-subtitle">{t("Rutas, tarifas y reservas")}</p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={toggleOpen}
              aria-label={t("Cerrar asistente")}
              className="greengo-chatbot-close"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div ref={listRef} className="greengo-chatbot-messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "greengo-chatbot-bubble",
                  m.from === "bot"
                    ? "greengo-chatbot-bubble--bot"
                    : "greengo-chatbot-bubble--user",
                )}
              >
                {chatText(m)}
              </div>
            ))}
            {isTyping && (
              <div className="greengo-chatbot-bubble greengo-chatbot-bubble--bot">
                <span className="animate-pulse">{t("Escribiendo…")}</span>
              </div>
            )}
          </div>

          {!isTyping && (
            <div className="greengo-chatbot-actions">
              {node.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOption(option)}
                  className="greengo-chatbot-option"
                >
                  <span>{optionLabel(option)}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        aria-label={isOpen ? t("Cerrar asistente virtual") : t("Abrir asistente virtual")}
        aria-expanded={isOpen}
        className="greengo-assistant-button"
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden /> : (
          <>
            <MessageSquareText className="h-6 w-6" aria-hidden />
            <Sparkles className="greengo-assistant-spark" aria-hidden />
          </>
        )}
      </button>
    </>
  );
}
