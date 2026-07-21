"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function LandingMotion() {
  useGSAP(() => {
    const page = document.querySelector(".adventure-landing");
    if (!page || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-gsap-image]").forEach((image) => {
        gsap.timeline({
          scrollTrigger: {
            trigger: image,
            start: "top 92%",
            end: "bottom 8%",
            scrub: 0.8,
          },
        })
          .fromTo(image, { scale: 0.82, opacity: 0.35, filter: "brightness(0.58)" }, { scale: 1, opacity: 1, filter: "brightness(1)", ease: "none" })
          .to(image, { scale: 0.96, opacity: 0.24, filter: "brightness(0.55)", ease: "none" });
      });

      gsap.utils.toArray<HTMLElement>("[data-stack-card]").forEach((card, index) => {
        gsap.fromTo(card, { y: 90, rotate: index % 2 ? 1.2 : -1.2 }, {
          y: 0,
          rotate: 0,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 92%",
            end: "top 28%",
            scrub: 0.7,
          },
        });
        gsap.to(card, {
          scale: 1 - index * 0.018,
          scrollTrigger: {
            trigger: card,
            start: "top 15%",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, page);

    return () => context.revert();
  }, []);

  return null;
}
