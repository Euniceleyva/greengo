"use client";

import dynamic from "next/dynamic";

export const ChatbotWidgetLazy = dynamic(
  () => import("@/components/shared/chatbot-widget").then((m) => m.ChatbotWidget),
  { ssr: false },
);
