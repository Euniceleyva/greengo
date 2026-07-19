import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TESTIMONIALS } from "@/mocks/testimonials";
import { SERVICE_TYPE_LABELS } from "@/constants";

export function LandingTestimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Lo que dicen nuestros pasajeros
        </h2>
        <p className="mt-3 text-base text-muted-foreground">Testimonios ilustrativos del DEMO.</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => {
          const initials = t.name
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("");
          return (
            <Card key={t.id} className="flex flex-col p-6">
              <div className="flex items-center gap-0.5" aria-label={`${t.rating} de 5 estrellas`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    aria-hidden
                    fill={i < t.rating ? "currentColor" : "none"}
                    strokeWidth={1.5}
                    style={{ color: i < t.rating ? "#F68634" : "hsl(var(--border))" }}
                  />
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm italic text-foreground">&ldquo;{t.quote}&rdquo;</p>
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
            </Card>
          );
        })}
      </div>
    </section>
  );
}
