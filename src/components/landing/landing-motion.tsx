"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function LandingMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ reduce: "(prefers-reduced-motion: reduce)", desktop: "(min-width: 768px)" }, (context) => {
      const { reduce, desktop } = context.conditions as { reduce: boolean; desktop: boolean };
      if (reduce) {
        gsap.set("[data-reveal], [data-hero-beat], [data-hero-media]", { clearProps: "all", autoAlpha: 1 });
        return;
      }

      const hero = gsap.timeline({ defaults: { ease: "power3.out" } });
      hero
        .fromTo("[data-hero-media]", { scale: 1.08, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.35 })
        .from("[data-horizon]", { scaleX: 0, transformOrigin: "left center", duration: 1.05 }, 0.35)
        .from("[data-hero-beat]", { y: desktop ? 28 : 18, autoAlpha: 0, duration: 0.85, stagger: 0.09 }, 0.42)
        .from("[data-quote-panel]", { y: 30, autoAlpha: 0, duration: 0.9 }, 0.78);

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 24,
          autoAlpha: 0,
          duration: 0.72,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        });
      });

      if (desktop) {
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          gsap.fromTo(el, { yPercent: -4 }, {
            yPercent: 4,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 1.2 },
          });
        });
      }
    });
    return () => mm.revert();
  }, { scope });

  return <div ref={scope} className="public-theme min-h-screen bg-background">{children}</div>;
}
