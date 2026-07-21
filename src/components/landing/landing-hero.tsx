"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { Select, Label } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { HOTELS } from "@/mocks/hotels";
import { AIRPORTS } from "@/mocks/airports";
import { TOUR_DESTINATIONS } from "@/mocks/tour-destinations";
import {
  estimateHeroQuote,
  heroDestinationLocationId,
  heroOriginLocationId,
  transferKindToServiceType,
} from "@/mocks/hero-quote";
import { LocalizedCurrency } from "@/components/shared/public-language";
import type { HeroQuoteEstimate, TourOrigin, TransferKind } from "@/types";

gsap.registerPlugin(useGSAP);

const TRANSFER_KIND_LABELS: Record<TransferKind, string> = {
  hotel_hotel: "Hotel a hotel",
  hotel_aeropuerto: "Hotel a aeropuerto",
  aeropuerto_hotel: "Aeropuerto a hotel",
  tour: "Tour",
};

export function LandingHero() {
  const router = useRouter();
  const heroRef = React.useRef<HTMLElement>(null);

  const [transferKind, setTransferKind] = React.useState<TransferKind>("hotel_hotel");
  const [originHotelId, setOriginHotelId] = React.useState(HOTELS[0].id);
  const [destinationHotelId, setDestinationHotelId] = React.useState(HOTELS[1].id);
  const [hotelId, setHotelId] = React.useState(HOTELS[0].id);
  const [airportId, setAirportId] = React.useState(AIRPORTS[0].id);
  const [tourOrigin, setTourOrigin] = React.useState<TourOrigin>("aeropuerto");
  const [tourDestinationId, setTourDestinationId] = React.useState(TOUR_DESTINATIONS[0].id);
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [passengers, setPassengers] = React.useState(2);
  const [estimate, setEstimate] = React.useState<HeroQuoteEstimate | null>(null);
  const [sameHotelError, setSameHotelError] = React.useState(false);

  // Cualquier cambio en las opciones invalida el estimado ya mostrado.
  React.useEffect(() => {
    setEstimate(null);
  }, [transferKind, originHotelId, destinationHotelId, hotelId, airportId, tourOrigin, tourDestinationId, date, time, passengers]);

  const tourDestination = TOUR_DESTINATIONS.find((d) => d.id === tourDestinationId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (transferKind === "hotel_hotel" && originHotelId === destinationHotelId) {
      setSameHotelError(true);
      return;
    }
    setSameHotelError(false);

    const result = estimateHeroQuote({
      kind: transferKind,
      passengers,
      time,
      airportId:
        transferKind === "hotel_aeropuerto" || transferKind === "aeropuerto_hotel"
          ? airportId
          : transferKind === "tour" && tourOrigin === "aeropuerto"
            ? airportId
            : undefined,
      tourDestination: transferKind === "tour" ? tourDestination : undefined,
    });
    setEstimate(result);
  };

  const onContinue = () => {
    const serviceType = transferKindToServiceType(transferKind);
    const originLocationId = heroOriginLocationId(transferKind, tourOrigin);
    const destinationLocationId = heroDestinationLocationId(transferKind, tourDestinationId);

    let hotelLabel = "";
    let notes = "";

    if (transferKind === "hotel_hotel") {
      const origin = HOTELS.find((h) => h.id === originHotelId);
      const destination = HOTELS.find((h) => h.id === destinationHotelId);
      hotelLabel = origin?.name ?? "";
      notes = `Traslado hotel a hotel: ${origin?.name ?? "—"} → ${destination?.name ?? "—"}.`;
    } else if (transferKind === "hotel_aeropuerto") {
      const hotel = HOTELS.find((h) => h.id === hotelId);
      const airport = AIRPORTS.find((a) => a.id === airportId);
      hotelLabel = hotel?.name ?? "";
      notes = `Traslado hotel a aeropuerto: ${hotel?.name ?? "—"} → ${airport?.name ?? "—"}.`;
    } else if (transferKind === "aeropuerto_hotel") {
      const hotel = HOTELS.find((h) => h.id === hotelId);
      const airport = AIRPORTS.find((a) => a.id === airportId);
      hotelLabel = hotel?.name ?? "";
      notes = `Traslado aeropuerto a hotel: ${airport?.name ?? "—"} → ${hotel?.name ?? "—"}.`;
    } else {
      const originLabel =
        tourOrigin === "aeropuerto"
          ? AIRPORTS.find((a) => a.id === airportId)?.name
          : HOTELS.find((h) => h.id === hotelId)?.name;
      if (tourOrigin === "hotel") hotelLabel = HOTELS.find((h) => h.id === hotelId)?.name ?? "";
      notes = `Tour a ${tourDestination?.name ?? "—"}, salida desde ${originLabel ?? "—"}.`;
    }

    const params = new URLSearchParams({
      origin: originLocationId,
      destination: destinationLocationId,
      passengers: String(passengers),
      serviceType,
    });
    if (date) params.set("date", date);
    if (time) params.set("time", time);
    if (hotelLabel) params.set("hotel", hotelLabel);
    if (notes) params.set("notes", notes);

    router.push(`/reservar?${params.toString()}`);
  };

  useGSAP(
    () => {
      const route = heroRef.current?.querySelector<SVGPathElement>("[data-hero-route]");
      const routeLength = route?.getTotalLength() ?? 0;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (route) gsap.set(route, { strokeDasharray: routeLength, strokeDashoffset: routeLength });

        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .fromTo(
            "[data-hero-media]",
            { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", scale: 1.06 },
            { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", scale: 1, duration: 1.05 },
          )
          .from("[data-hero-word]", { yPercent: 115, rotation: 2, stagger: 0.09, duration: 0.72 }, "-=0.48");

        if (route) {
          intro.to(route, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, "-=0.36");
        }

        intro
          .from("[data-hero-sticker]", { scale: 0.55, rotation: -18, autoAlpha: 0, stagger: 0.08, duration: 0.52 }, "-=0.42")
          .from("[data-hero-quote]", { y: 32, rotation: 1.5, autoAlpha: 0, duration: 0.68 }, "-=0.22");

        gsap.to("[data-hero-float]", {
          y: -8,
          rotation: 2,
          duration: 2.8,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-hero-media], [data-hero-word], [data-hero-sticker], [data-hero-quote]", {
          clearProps: "all",
          autoAlpha: 1,
        });
        if (route) gsap.set(route, { strokeDashoffset: 0 });
      });

      return () => mm.revert();
    },
    { scope: heroRef },
  );

  return (
    <section ref={heroRef} className="adventure-hero relative overflow-hidden">
      <div className="adventure-hero__grain" aria-hidden />
      <div className="adventure-hero__layout mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 lg:px-10 lg:pb-24 lg:pt-10">
        <div className="adventure-hero__copy relative z-10">
          <div data-hero-sticker className="adventure-stamp adventure-stamp--sun">CUN · MX<br />365 días de sol</div>
          <p className="adventure-kicker">El traslado es el primer capítulo</p>
          <h1 className="adventure-hero__title" aria-label="Aterriza. Sube. Empieza la aventura.">
            <span className="adventure-word-mask"><span data-hero-word className="normal-case">Aterriza.</span></span>
            <span className="adventure-word-mask"><span data-hero-word className="text-[var(--adventure-sun)]">Sube.</span></span>
            <span className="adventure-word-mask"><span data-hero-word>Empieza la</span></span>
            <span className="adventure-word-mask"><span data-hero-word className="adventure-title-stroke">aventura.</span></span>
          </h1>
          <p className="adventure-hero__lede">
            Del avión al Caribe, sin perder el ritmo. Traslados privados para moverte por Cancún y la Riviera Maya.
          </p>
          <button type="button" onClick={() => router.push("/reservar")} className="adventure-text-link">
            Armar mi ruta <ArrowRight aria-hidden />
          </button>
        </div>

        <div data-hero-media className="adventure-hero__media">
          <video
            poster="/images/destinations/cancun.webp"
            autoPlay
            muted
            loop
            playsInline
            aria-label="Costa turquesa de Cancún vista desde el aire"
            className="h-full w-full object-cover"
          >
            <source src="/images/hero-cancun.webm" type="video/webm" />
            <source src="/images/hero-cancun-optimizado.mp4" type="video/mp4" />
          </video>
          <div className="adventure-hero__media-label"><MapPin aria-hidden /> Cancún → donde empiece tu plan</div>
          <div data-hero-sticker data-hero-float className="adventure-sticker adventure-sticker--coral">PLAYA<br />MODE</div>
        </div>

        <svg className="adventure-hero__route" viewBox="0 0 660 240" fill="none" aria-hidden>
          <path data-hero-route d="M24 188C120 80 207 238 302 129C387 31 459 170 628 48" />
          <circle cx="24" cy="188" r="7" />
          <circle cx="628" cy="48" r="7" />
        </svg>

        <form
          onSubmit={onSubmit}
          data-hero-quote
          className="adventure-quote text-left"
          aria-label="Cotización rápida de traslado"
        >
          <div className="adventure-quote__header">
            <div>
              <span>Salida inmediata</span>
              <h2>Traza tu primera ruta</h2>
            </div>
            <span className="adventure-quote__code">CUN / 001</span>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-4">
              <Label htmlFor="hero-transfer-kind">Tipo de traslado</Label>
              <Select
                id="hero-transfer-kind"
                value={transferKind}
                onChange={(e) => setTransferKind(e.target.value as TransferKind)}
                className="mt-1"
              >
                {(Object.keys(TRANSFER_KIND_LABELS) as TransferKind[]).map((kind) => (
                  <option key={kind} value={kind}>
                    {TRANSFER_KIND_LABELS[kind]}
                  </option>
                ))}
              </Select>
            </div>

            {transferKind === "hotel_hotel" && (
              <>
                <div>
                  <Label htmlFor="hero-origin-hotel">Hotel de origen</Label>
                  <Combobox
                    id="hero-origin-hotel"
                    className="mt-1"
                    options={HOTELS}
                    value={originHotelId}
                    onChange={setOriginHotelId}
                    placeholder="Selecciona un hotel"
                    searchPlaceholder="Buscar hotel..."
                  />
                </div>
                <div>
                  <Label htmlFor="hero-destination-hotel">Hotel de destino</Label>
                  <Combobox
                    id="hero-destination-hotel"
                    className="mt-1"
                    options={HOTELS}
                    value={destinationHotelId}
                    onChange={setDestinationHotelId}
                    placeholder="Selecciona un hotel"
                    searchPlaceholder="Buscar hotel..."
                  />
                  {sameHotelError && (
                    <p className="mt-1 text-xs text-destructive">El hotel de origen y destino deben ser distintos.</p>
                  )}
                </div>
              </>
            )}

            {transferKind === "hotel_aeropuerto" && (
              <>
                <div>
                  <Label htmlFor="hero-hotel">Hotel</Label>
                  <Combobox
                    id="hero-hotel"
                    className="mt-1"
                    options={HOTELS}
                    value={hotelId}
                    onChange={setHotelId}
                    placeholder="Selecciona un hotel"
                    searchPlaceholder="Buscar hotel..."
                  />
                </div>
                <div>
                  <Label htmlFor="hero-airport">Aeropuerto</Label>
                  <Select id="hero-airport" value={airportId} onChange={(e) => setAirportId(e.target.value)} className="mt-1">
                    {AIRPORTS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </>
            )}

            {transferKind === "aeropuerto_hotel" && (
              <>
                <div>
                  <Label htmlFor="hero-airport">Aeropuerto</Label>
                  <Select id="hero-airport" value={airportId} onChange={(e) => setAirportId(e.target.value)} className="mt-1">
                    {AIRPORTS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hero-hotel">Hotel</Label>
                  <Combobox
                    id="hero-hotel"
                    className="mt-1"
                    options={HOTELS}
                    value={hotelId}
                    onChange={setHotelId}
                    placeholder="Selecciona un hotel"
                    searchPlaceholder="Buscar hotel..."
                  />
                </div>
              </>
            )}

            {transferKind === "tour" && (
              <>
                <fieldset className="sm:col-span-2 lg:col-span-4">
                  <legend className="text-sm font-medium text-foreground">Salida desde</legend>
                  <div className="mt-1.5 flex gap-4">
                    <label className="flex min-h-[44px] items-center gap-2 text-sm text-foreground">
                      <input
                        type="radio"
                        className="h-4 w-4"
                        checked={tourOrigin === "aeropuerto"}
                        onChange={() => setTourOrigin("aeropuerto")}
                      />
                      Aeropuerto
                    </label>
                    <label className="flex min-h-[44px] items-center gap-2 text-sm text-foreground">
                      <input
                        type="radio"
                        className="h-4 w-4"
                        checked={tourOrigin === "hotel"}
                        onChange={() => setTourOrigin("hotel")}
                      />
                      Hotel
                    </label>
                  </div>
                </fieldset>

                <div>
                  {tourOrigin === "aeropuerto" ? (
                    <>
                      <Label htmlFor="hero-airport">Aeropuerto</Label>
                      <Select
                        id="hero-airport"
                        value={airportId}
                        onChange={(e) => setAirportId(e.target.value)}
                        className="mt-1"
                      >
                        {AIRPORTS.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </Select>
                    </>
                  ) : (
                    <>
                      <Label htmlFor="hero-hotel">Hotel</Label>
                      <Combobox
                        id="hero-hotel"
                        className="mt-1"
                        options={HOTELS}
                        value={hotelId}
                        onChange={setHotelId}
                        placeholder="Selecciona un hotel"
                        searchPlaceholder="Buscar hotel..."
                      />
                    </>
                  )}
                </div>

                <div>
                  <Label htmlFor="hero-tour-destination">Destino</Label>
                  <Select
                    id="hero-tour-destination"
                    value={tourDestinationId}
                    onChange={(e) => setTourDestinationId(e.target.value)}
                    className="mt-1"
                  >
                    {TOUR_DESTINATIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="hero-date">Fecha</Label>
              <input
                id="hero-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </div>
            <div>
              <Label htmlFor="hero-time">Horario</Label>
              <input
                id="hero-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </div>
            <div>
              <Label htmlFor="hero-passengers">Pasajeros</Label>
              <input
                id="hero-passengers"
                type="number"
                min={1}
                max={20}
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="mt-1 flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </div>
          </div>

          <div className="px-4 pb-4 sm:px-5 sm:pb-5">
            <Button type="submit" className="adventure-cta w-full sm:w-auto">
              <Search /> Ver precio de mi ruta
            </Button>

          {estimate && (
            <div className="adventure-estimate mt-4 p-4">
              <p className="text-sm text-muted-foreground">{estimate.label}</p>
              <p className="mt-1 font-heading text-2xl font-bold text-primary">
                <LocalizedCurrency amount={estimate.total} sourceCurrency={estimate.currency} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Estimado ilustrativo, sujeto a confirmación en tu reservación.
              </p>
              <Button type="button" onClick={onContinue} className="mt-3 w-full sm:w-auto">
                Continuar a reservar <ArrowRight aria-hidden />
              </Button>
            </div>
          )}
          </div>
        </form>
      </div>
    </section>
  );
}
