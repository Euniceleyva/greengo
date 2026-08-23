import "server-only";

// Cliente mínimo de Resend (https://resend.com/docs/api-reference/emails/send-email)
// via fetch, sin SDK adicional. Sin RESEND_API_KEY configurada, sendEmail lanza
// y el llamador debe marcar el envío como fallido para reintentar más tarde.

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export type SendEmailResult = {
  providerMessageId: string;
};

export function isEmailProviderConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY o RESEND_FROM_EMAIL no están configurados.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend respondió ${response.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await response.json()) as { id: string };
  return { providerMessageId: data.id };
}
