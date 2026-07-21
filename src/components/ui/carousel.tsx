"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselProps {
  className?: string;
  autoPlayMs?: number;
  slides: React.ReactNode[];
  ariaLabel: string;
}

/** Carrusel accesible basado en Embla: autoplay pausable, gestos táctiles, teclado e indicadores. */
export function Carousel({ className, autoPlayMs = 5000, slides, ariaLabel }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const autoplayRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollTo = React.useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi || !isPlaying) {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      return;
    }
    autoplayRef.current = setInterval(() => emblaApi.scrollNext(), autoPlayMs);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [emblaApi, isPlaying, autoPlayMs]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") scrollPrev();
    if (e.key === "ArrowRight") scrollNext();
  };

  return (
    <div
      className={cn("relative", className)}
      role="region"
      aria-roledescription="carrusel"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
    >
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((slide, i) => (
            <div
              key={i}
              className="min-w-0 flex-[0_0_100%]"
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${slides.length}`}
              aria-hidden={selectedIndex !== i}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Anterior"
        className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-tropical-card/90 text-tropical-dark shadow-sketch ring-2 ring-tropical-border transition-colors hover:bg-tropical-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tropical-secondary"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        aria-label="Siguiente"
        className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-tropical-card/90 text-tropical-dark shadow-sketch ring-2 ring-tropical-border transition-colors hover:bg-tropical-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tropical-secondary"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setIsPlaying((v) => !v)}
          aria-label={isPlaying ? "Pausar carrusel" : "Reanudar carrusel"}
          className="flex h-11 w-11 items-center justify-center rounded-full text-tropical-muted transition-colors hover:bg-tropical-primary/10 hover:text-tropical-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tropical-secondary"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              aria-current={selectedIndex === i}
              className={cn(
                "h-2.5 rounded-full transition-all",
                selectedIndex === i ? "w-6 bg-tropical-primary" : "w-2.5 bg-tropical-border hover:bg-tropical-muted/40",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
