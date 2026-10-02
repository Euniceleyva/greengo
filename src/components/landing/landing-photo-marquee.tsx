"use client";

import * as React from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { usePublicLanguage } from "@/components/shared/public-language";

gsap.registerPlugin(useGSAP);

const MARQUEE_PHOTOS = [
  {
    id: "happy-couple-private-transfer",
    src: "/images/gallery/01-happy-couple-private-transfer.webp",
    altEs: "Pareja disfrutando su traslado privado en Cancún",
    altEn: "Couple enjoying their private transfer in Cancún",
    focus: "50% 45%",
  },
  {
    id: "friends-private-van",
    src: "/images/gallery/02-friends-private-van.webp",
    altEs: "Grupo de amigas junto a su van privada en Cancún",
    altEn: "Group of friends beside their private van in Cancún",
    focus: "50% 38%",
  },
  {
    id: "passengers-inside-van",
    src: "/images/gallery/03-passengers-inside-van.webp",
    altEs: "Pasajeras sonriendo dentro de una van de traslado",
    altEn: "Passengers smiling inside a transfer van",
    focus: "50% 38%",
  },
  {
    id: "private-van-palm-lined-resort",
    src: "/images/gallery/04-private-van-palm-lined-resort.webp",
    altEs: "Van privada en una avenida rodeada de palmeras",
    altEn: "Private van on a palm-lined resort road",
    focus: "58% 58%",
  },
  {
    id: "friends-inside-transfer-van",
    src: "/images/gallery/05-friends-inside-transfer-van.webp",
    altEs: "Amigas viajando cómodamente dentro de la van",
    altEn: "Friends traveling comfortably inside the van",
    focus: "43% 42%",
  },
  {
    id: "caribbean-beach-riviera-maya",
    src: "/images/greengo-guests/06-caribbean-beach-riviera-maya.webp",
    altEs: "Playa de agua turquesa en la Riviera Maya",
    altEn: "Turquoise-water beach in the Riviera Maya",
    focus: "50% 58%",
  },
  {
    id: "family-group-hotel-pickup",
    src: "/images/gallery/07-family-group-hotel-pickup.webp",
    altEs: "Familia lista para iniciar su traslado desde el hotel",
    altEn: "Family ready to begin their transfer from the hotel",
    focus: "50% 38%",
  },
  {
    id: "family-private-van",
    src: "/images/gallery/08-family-private-van.webp",
    altEs: "Familia frente a su transporte privado en Cancún",
    altEn: "Family in front of their private transportation in Cancún",
    focus: "50% 40%",
  },
  {
    id: "greengo-branded-transfer-van",
    src: "/images/gallery/09-greengo-branded-transfer-van.webp",
    altEs: "Van de GreenGo Transfers frente a un hotel",
    altEn: "GreenGo Transfers van outside a hotel",
    focus: "50% 52%",
  },
  {
    id: "passenger-welcome-sign",
    src: "/images/gallery/10-passenger-welcome-sign.webp",
    altEs: "Pasajero recibido con un letrero personalizado dentro de la van",
    altEn: "Passenger welcomed with a personalized sign inside the van",
    focus: "50% 42%",
  },
  {
    id: "family-group-private-transfer",
    src: "/images/gallery/11-family-group-private-transfer.webp",
    altEs: "Familia reunida junto a su van de traslado privado",
    altEn: "Family gathered beside their private transfer van",
    focus: "50% 38%",
  },
  {
    id: "couple-resort-arrival",
    src: "/images/gallery/12-couple-resort-arrival.webp",
    altEs: "Pareja llegando con equipaje a su resort",
    altEn: "Couple arriving at their resort with luggage",
    focus: "50% 40%",
  },
  {
    id: "travelers-luggage-hotel-arrival",
    src: "/images/gallery/13-travelers-luggage-hotel-arrival.webp",
    altEs: "Viajeros con equipaje al llegar a su hotel",
    altEn: "Travelers with luggage arriving at their hotel",
    focus: "50% 42%",
  },
  {
    id: "airport-welcome-group",
    src: "/images/gallery/14-airport-welcome-group.webp",
    altEs: "Grupo recibido con letrero en el Aeropuerto de Cancún",
    altEn: "Group welcomed with a sign at Cancún Airport",
    focus: "50% 40%",
  },
  {
    id: "family-airport-reception",
    src: "/images/gallery/15-family-airport-reception.webp",
    altEs: "Familia recibida por el equipo de traslado en el aeropuerto",
    altEn: "Family welcomed by the transfer team at the airport",
    focus: "50% 46%",
  },
  {
    id: "large-family-private-van",
    src: "/images/gallery/16-large-family-private-van.webp",
    altEs: "Familia numerosa junto a su van privada en la Riviera Maya",
    altEn: "Large family beside their private van in the Riviera Maya",
    focus: "50% 45%",
  },
  {
    id: "tulum-sign",
    src: "/images/greengo-guests/17-tulum-sign.webp",
    altEs: "Letrero de Tulum rodeado de vegetación tropical",
    altEn: "Tulum sign surrounded by tropical greenery",
    focus: "50% 48%",
  },
  {
    id: "family-riviera-maya-excursion",
    src: "/images/gallery/18-family-riviera-maya-excursion.webp",
    altEs: "Familia durante una excursión en la Riviera Maya",
    altEn: "Family during an excursion in the Riviera Maya",
    focus: "50% 46%",
  },
  {
    id: "couple-driver-hotel-arrival",
    src: "/images/gallery/19-couple-driver-hotel-arrival.webp",
    altEs: "Pareja con su conductor al llegar al hotel",
    altEn: "Couple with their driver upon arriving at the hotel",
    focus: "50% 40%",
  },
  {
    id: "group-airport-welcome",
    src: "/images/gallery/20-group-airport-welcome.webp",
    altEs: "Grupo de pasajeros recibido en el Aeropuerto de Cancún",
    altEn: "Group of passengers welcomed at Cancún Airport",
    focus: "50% 45%",
  },
  {
    id: "private-van-resort-entrance",
    src: "/images/gallery/21-private-van-resort-entrance.webp",
    altEs: "Van privada esperando en la entrada de un resort",
    altEn: "Private van waiting at a resort entrance",
    focus: "50% 52%",
  },
  {
    id: "couple-airport-reception",
    src: "/images/gallery/22-couple-airport-reception.webp",
    altEs: "Pareja con letrero de bienvenida en el aeropuerto",
    altEn: "Couple holding a welcome sign at the airport",
    focus: "50% 38%",
  },
  {
    id: "friends-private-transfer",
    src: "/images/gallery/23-friends-private-transfer.webp",
    altEs: "Grupo de amigas junto a su transporte privado",
    altEn: "Group of friends beside their private transportation",
    focus: "50% 45%",
  },
  {
    id: "family-cancun-airport-welcome",
    src: "/images/gallery/24-family-cancun-airport-welcome.webp",
    altEs: "Familia recibida con letrero en el Aeropuerto de Cancún",
    altEn: "Family welcomed with a sign at Cancún Airport",
    focus: "50% 38%",
  },
  {
    id: "couple-cancun-airport-pickup",
    src: "/images/gallery/25-couple-cancun-airport-pickup.webp",
    altEs: "Pareja lista para abordar su traslado en el aeropuerto",
    altEn: "Couple ready to board their airport transfer",
    focus: "50% 45%",
  },
  {
    id: "couple-driver-airport-selfie",
    src: "/images/gallery/26-couple-driver-airport-selfie.webp",
    altEs: "Pareja tomándose una foto con su conductor en el aeropuerto",
    altEn: "Couple taking a photo with their driver at the airport",
    focus: "50% 35%",
  },
  {
    id: "friends-cancun-airport-arrival",
    src: "/images/gallery/27-friends-cancun-airport-arrival.webp",
    altEs: "Grupo de amigas al llegar al Aeropuerto de Cancún",
    altEn: "Group of friends arriving at Cancún Airport",
    focus: "50% 38%",
  },
];

function PhotoSequence({ duplicate = false, language }: { duplicate?: boolean; language: "es" | "en" }) {
  return (
    <div className="adventure-photo-marquee__sequence" aria-hidden={duplicate || undefined}>
      {MARQUEE_PHOTOS.map((photo) => (
        <figure className="adventure-photo-marquee__photo" key={`${duplicate ? "copy" : "original"}-${photo.id}`}>
          <Image
            src={photo.src}
            alt={duplicate ? "" : language === "en" ? photo.altEn : photo.altEs}
            fill
            sizes="(max-width: 640px) 58vw, (max-width: 1024px) 34vw, 26vw"
            className="object-cover"
            style={{ objectPosition: photo.focus }}
          />
        </figure>
      ))}
    </div>
  );
}

export function LandingPhotoMarquee() {
  const { language } = usePublicLanguage();
  const rootRef = React.useRef<HTMLElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const tweenRef = React.useRef<gsap.core.Tween | null>(null);
  const pausedRef = React.useRef(false);
  const visibleRef = React.useRef(true);
  const [paused, setPaused] = React.useState(false);

  const syncPlayback = React.useCallback(() => {
    const tween = tweenRef.current;
    if (!tween) return;
    if (pausedRef.current || !visibleRef.current) tween.pause();
    else tween.play();
  }, []);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const track = trackRef.current;
        const root = rootRef.current;
        if (!track || !root) return;

        const tween = gsap.to(track, {
          xPercent: -50,
          duration: MARQUEE_PHOTOS.length * 5,
          ease: "none",
          repeat: -1,
        });
        tweenRef.current = tween;

        const observer = new IntersectionObserver(
          ([entry]) => {
            visibleRef.current = entry.isIntersecting;
            syncPlayback();
          },
          { threshold: 0.05 },
        );
        observer.observe(root);

        return () => {
          observer.disconnect();
          tweenRef.current = null;
        };
      });

      return () => media.revert();
    },
    { scope: rootRef, dependencies: [syncPlayback] },
  );

  const pauseTemporarily = () => tweenRef.current?.pause();
  const resumeIfAllowed = () => syncPlayback();

  const togglePlayback = () => {
    const nextPaused = !pausedRef.current;
    pausedRef.current = nextPaused;
    setPaused(nextPaused);
    syncPlayback();
  };

  return (
    <section
      ref={rootRef}
      className="adventure-photo-marquee"
      aria-label={language === "en" ? "Continuous gallery of GreenGo experiences" : "Galería continua de experiencias GreenGo"}
      onMouseEnter={pauseTemporarily}
      onMouseLeave={resumeIfAllowed}
    >
      <button
        type="button"
        className="adventure-photo-marquee__control"
        aria-pressed={paused}
        aria-label={language === "en" ? (paused ? "Play gallery" : "Pause gallery") : paused ? "Reproducir galería" : "Pausar galería"}
        title={language === "en" ? (paused ? "Play gallery" : "Pause gallery") : paused ? "Reproducir galería" : "Pausar galería"}
        onClick={togglePlayback}
      >
        {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
      </button>
      <div className="adventure-photo-marquee__viewport">
        <div ref={trackRef} className="adventure-photo-marquee__track">
          <PhotoSequence language={language} />
          <PhotoSequence duplicate language={language} />
        </div>
      </div>
    </section>
  );
}
