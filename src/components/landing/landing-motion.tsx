"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function LandingMotion({ children }: { children: React.ReactNode }) {
  const root = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-adventure-reveal]").forEach((section) => {
          const targets = section.querySelectorAll<HTMLElement>("[data-reveal-item]");
          if (!targets.length) return;

          gsap.from(targets, {
            y: 28,
            opacity: 0.55,
            duration: 0.72,
            stagger: 0.075,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 78%",
              once: true,
            },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-postcard]").forEach((postcard, index) => {
          gsap.to(postcard, {
            y: index % 2 === 0 ? -12 : 10,
            rotation: index % 2 === 0 ? -1.2 : 1.1,
            ease: "none",
            scrollTrigger: {
              trigger: postcard,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
