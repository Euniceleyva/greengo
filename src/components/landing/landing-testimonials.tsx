import { Star } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/section-heading";
import { TESTIMONIALS } from "@/mocks/testimonials";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { cn } from "@/lib/utils";

const ROTATIONS = ["sm:-rotate-2", "sm:rotate-1", "sm:-rotate-1", "sm:rotate-2", "sm:-rotate-1", "sm:rotate-1"];

export function LandingTestimonials() {
  return (
    <section className="bg-tropical-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="postales de nuestros viajeros"
          title="Lo que dicen nuestros pasajeros"
          description="Testimonios ilustrativos del DEMO."
        />

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => {
            const initials = t.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("");
            return (
              <div
                key={t.id}
                className={cn(
                  "flex flex-col rounded-2xl border-2 border-tropical-border bg-tropical-card p-6 shadow-sketch transition-transform hover:-translate-y-1 hover:rotate-0",
                  ROTATIONS[i % ROTATIONS.length],
                )}
              >
                <div className="flex items-center gap-0.5" aria-label={`${t.rating} de 5 estrellas`}>
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star
                      key={star}
                      className="h-4 w-4"
                      aria-hidden
                      fill={star < t.rating ? "currentColor" : "none"}
                      strokeWidth={1.5}
                      style={{ color: star < t.rating ? "#F89924" : "hsl(var(--brand-border))" }}
                    />
                  ))}
                </div>
                <p className="mt-4 flex-1 font-hand text-xl leading-snug text-tropical-text">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 border-t-2 border-dashed border-tropical-border pt-4">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: t.avatarColor }}
                    aria-hidden
                  >
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-urbanist text-sm font-bold text-tropical-text">{t.name}</p>
                    <p className="truncate text-xs text-tropical-muted">
                      {t.origin} · {SERVICE_TYPE_LABELS[t.serviceType]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
