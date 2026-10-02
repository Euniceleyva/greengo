"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselProps {
  className?: string;
  autoPlayMs?: number;
  slides: React.ReactNode[];
  ariaLabel: string;
  language?: "es" | "en";
}

/** Carrusel accesible basado en Embla: autoplay pausable, gestos táctiles y teclado. */
export function Carousel({ className, autoPlayMs = 5000, slides, ariaLabel, language = "es" }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const autoplayRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

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
      aria-roledescription={language === "en" ? "carousel" : "carrusel"}
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
              aria-roledescription={language === "en" ? "slide" : "diapositiva"}
              aria-label={`${i + 1} ${language === "en" ? "of" : "de"} ${slides.length}`}
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
        aria-label={language === "en" ? "Previous image" : "Imagen anterior"}
        className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-transparent text-white drop-shadow-[0_2px_8px_rgba(0,0,0,.9)] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-8 w-8" strokeWidth={3} />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        aria-label={language === "en" ? "Next image" : "Imagen siguiente"}
        className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-transparent text-white drop-shadow-[0_2px_8px_rgba(0,0,0,.9)] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowRight className="h-8 w-8" strokeWidth={3} />
      </button>

      <button
        type="button"
        onClick={() => setIsPlaying((v) => !v)}
        aria-label={
          language === "en"
            ? isPlaying ? "Pause carousel" : "Resume carousel"
            : isPlaying ? "Pausar carrusel" : "Reanudar carrusel"
        }
        className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white shadow-md transition-[background-color,transform] hover:scale-105 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/60"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
    </div>
  );
}
