"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function MarketingMotion() {
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.utils.toArray<HTMLElement>("[data-motion-image]").forEach((image) => {
      gsap.fromTo(
        image,
        { scale: 0.86, opacity: 0.58, filter: "brightness(0.65)" },
        {
          scale: 1,
          opacity: 1,
          filter: "brightness(1)",
          ease: "none",
          scrollTrigger: {
            trigger: image,
            start: "top 92%",
            end: "bottom 18%",
            scrub: 0.8,
          },
        },
      );
    });

    const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]");
    cards.forEach((card, index) => {
      gsap.to(card, {
        scale: 1 - (cards.length - index - 1) * 0.025,
        opacity: index === cards.length - 1 ? 1 : 0.72,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: `top ${110 + index * 18}px`,
          end: "+=420",
          scrub: true,
        },
      });
    });
  });

  return null;
}
