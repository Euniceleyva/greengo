import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/mocks/testimonials";
import { SERVICE_TYPE_LABELS } from "@/constants";

export function LandingTestimonials() {
  return (
    <section data-adventure-reveal className="adventure-testimonials px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-[1280px]">
      <div className="adventure-testimonials__heading">
        <h2 data-reveal-item>Mensajes que llegaron antes que la postal.</h2>
        <p data-reveal-item>Historias ilustrativas de viajeros que ya hicieron la ruta.</p>
      </div>

      <div className="adventure-testimonial-wall mt-12">
        {TESTIMONIALS.map((t) => {
          const initials = t.name
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("");
          return (
            <article key={t.id} data-reveal-item className="adventure-testimonial-note">
              <div className="flex items-center gap-0.5" aria-label={`${t.rating} de 5 estrellas`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    aria-hidden
                    fill={i < t.rating ? "currentColor" : "none"}
                    strokeWidth={1.5}
                    style={{ color: i < t.rating ? "var(--adventure-coral)" : "hsl(var(--border))" }}
                  />
                ))}
              </div>
              <p className="adventure-testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: t.avatarColor }}
                  aria-hidden
                >
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.origin} · {SERVICE_TYPE_LABELS[t.serviceType]}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      </div>
    </section>
  );
}
