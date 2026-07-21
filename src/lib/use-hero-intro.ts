"use client";

import * as React from "react";
import gsap from "gsap";

export interface HeroIntroRefs {
  root: React.RefObject<HTMLElement>;
  mask: React.RefObject<HTMLDivElement>;
  words: React.RefObject<HTMLSpanElement[]>;
  underline: React.RefObject<SVGPathElement>;
  route: React.RefObject<SVGPathElement>;
  stickers: React.RefObject<HTMLDivElement[]>;
  quote: React.RefObject<HTMLDivElement>;
  cta: React.RefObject<HTMLDivElement>;
}

/**
 * Secuencia de entrada del hero: revelado de video, titular escalonado,
 * subrayado dibujado, ruta SVG, stickers y mini-cotizador.
 * Respeta prefers-reduced-motion (muestra todo directamente, sin animar).
 * Limpia el timeline al desmontar.
 */
export function useHeroIntro(refs: HeroIntroRefs) {
  React.useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const words = refs.words.current ?? [];
      const stickers = refs.stickers.current ?? [];

      if (prefersReduced) {
        gsap.set(
          [refs.mask.current, ...words, refs.underline.current, refs.route.current, ...stickers, refs.quote.current, refs.cta.current].filter(
            Boolean,
          ),
          { clearProps: "all" },
        );
        return;
      }

      gsap.set(words, { opacity: 0, y: 24 });
      gsap.set(refs.quote.current, { opacity: 0, y: 32, scale: 0.97 });
      gsap.set(refs.cta.current, { opacity: 0, y: 16 });
      gsap.set(stickers, { opacity: 0, scale: 0.6, rotate: -12 });

      const underlinePath = refs.underline.current;
      const routePath = refs.route.current;
      if (underlinePath) {
        const len = underlinePath.getTotalLength();
        gsap.set(underlinePath, { strokeDasharray: len, strokeDashoffset: len });
      }
      if (routePath) {
        const len = routePath.getTotalLength();
        gsap.set(routePath, { strokeDashoffset: len });
      }

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      if (refs.mask.current) {
        tl.fromTo(
          refs.mask.current,
          { clipPath: "inset(0 0 100% 0 round 24px)" },
          { clipPath: "inset(0 0 0% 0 round 24px)", duration: 1.1, ease: "power3.out" },
        );
      }

      tl.to(words, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, "-=0.5");

      if (underlinePath) {
        tl.to(underlinePath, { strokeDashoffset: 0, duration: 0.7, ease: "power1.inOut" }, "-=0.15");
      }

      if (routePath) {
        tl.to(routePath, { strokeDashoffset: 0, duration: 1, ease: "power1.inOut" }, "-=0.2");
      }

      if (stickers.length) {
        tl.to(stickers, { opacity: 1, scale: 1, rotate: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.6");
      }

      tl.to(refs.quote.current, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, "-=0.3");
      tl.to(refs.cta.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3");
    }, refs.root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
