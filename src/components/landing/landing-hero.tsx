"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Plane, MapPin } from "lucide-react";
import { Button, Select, Label } from "@/components/landing/ui/public-controls";
import { Combobox } from "@/components/ui/combobox";
import { PalmDoodle, SunDoodle, PassportStamp, StickerBadge } from "@/components/landing/decor/decorations";
import { useHeroIntro } from "@/lib/use-hero-intro";
import { HOTELS } from "@/mocks/hotels";
import { AIRPORTS } from "@/mocks/airports";
import { TOUR_DESTINATIONS } from "@/mocks/tour-destinations";
import {
  estimateHeroQuote,
  formatUSD,
  heroDestinationLocationId,
  heroOriginLocationId,
  transferKindToServiceType,
} from "@/mocks/hero-quote";
import { formatMXN } from "@/lib/utils";
import type { HeroQuoteEstimate, TourOrigin, TransferKind } from "@/types";

const TRANSFER_KIND_LABELS: Record<TransferKind, string> = {
  hotel_hotel: "Hotel a hotel",
  hotel_aeropuerto: "Hotel a aeropuerto",
  aeropuerto_hotel: "Aeropuerto a hotel",
  tour: "Tour",
};

const HEADLINE_WORDS = ["Tu", "viaje", "a", "Cancún", "empieza", "aquí"];

export function LandingHero() {
  const router = useRouter();

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

  // Refs para la secuencia de entrada GSAP del hero.
  const rootRef = React.useRef<HTMLElement>(null);
  const maskRef = React.useRef<HTMLDivElement>(null);
  const wordsRef = React.useRef<HTMLSpanElement[]>([]);
  const underlineRef = React.useRef<SVGPathElement>(null);
  const routeRef = React.useRef<SVGPathElement>(null);
  const stickersRef = React.useRef<HTMLDivElement[]>([]);
  const quoteRef = React.useRef<HTMLDivElement>(null);
  const ctaRef = React.useRef<HTMLDivElement>(null);

  useHeroIntro({
    root: rootRef,
    mask: maskRef,
    words: wordsRef,
    underline: underlineRef,
    route: routeRef,
    stickers: stickersRef,
    quote: quoteRef,
    cta: ctaRef,
  });

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

  const addWordRef = (el: HTMLSpanElement | null, i: number) => {
    if (el) wordsRef.current[i] = el;
  };
  const addStickerRef = (el: HTMLDivElement | null, i: number) => {
    if (el) stickersRef.current[i] = el;
  };

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-gradient-deep paper-texture">
      {/* Doodles decorativos de fondo */}
      <PalmDoodle className="pointer-events-none absolute -left-4 top-10 h-28 w-24 opacity-30 sm:h-36 sm:w-32" />
      <SunDoodle className="animate-float-soft pointer-events-none absolute right-6 top-8 h-16 w-16 opacity-70 sm:h-20 sm:w-20" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:pt-24">
        {/* Columna editorial */}
        <div className="text-center lg:text-left">
          <div
            ref={maskRef}
            className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-3xl shadow-sketch lg:mx-0"
            style={{ clipPath: "inset(0 0 0% 0 round 24px)" }}
          >
            <video
              src="/images/hero-cancun.mp4"
              poster="/images/destinations/cancun.jpg"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tropical-deep/70 via-tropical-deep/10 to-transparent" aria-hidden />
            <div
              ref={(el) => addStickerRef(el, 0)}
              className="absolute bottom-3 left-3"
            >
              <StickerBadge tone="accent">100% seguro</StickerBadge>
            </div>
          </div>

          <h1 className="mt-8 font-urbanist text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {HEADLINE_WORDS.map((word, i) => (
              <span key={word + i} ref={(el) => addWordRef(el, i)} className="mr-3 inline-block">
                {word === "Cancún" ? (
                  <span className="relative inline-block text-tropical-primary-light">
                    {word}
                    <svg
                      className="absolute -bottom-2 left-0 h-4 w-full"
                      viewBox="0 0 200 20"
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <path
                        ref={underlineRef}
                        d="M2 14 C 40 4, 80 18, 120 8 S 180 4, 198 12"
                        fill="none"
                        stroke="hsl(var(--brand-accent))"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                ) : (
                  word
                )}
              </span>
            ))}
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-hand text-2xl text-tropical-surface/90 lg:mx-0 sm:text-3xl">
            de aeropuerto a hotel, entre destinos o a tu ritmo — sin complicaciones.
          </p>

          <div className="mx-auto mt-6 hidden max-w-sm lg:mx-0 lg:block">
            <svg viewBox="0 0 320 120" className="h-16 w-full overflow-visible" aria-hidden fill="none">
              <path
                ref={routeRef}
                d="M6 100 C 60 100, 70 40, 120 40 S 190 90, 240 60 S 280 10, 312 14"
                stroke="hsl(var(--brand-accent))"
                strokeWidth="4"
                strokeDasharray="2 12"
                strokeLinecap="round"
              />
              <circle cx="6" cy="100" r="6" fill="hsl(var(--brand-secondary))" />
            </svg>
          </div>

          <div ref={ctaRef} className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Button size="lg" onClick={() => router.push("/reservar")}>
              Reservar ahora
            </Button>
            <div
              ref={(el) => addStickerRef(el, 1)}
              className="hidden sm:block"
            >
              <PassportStamp label="Cancún ✓" className="bg-white/5" />
            </div>
          </div>
        </div>

        {/* Mini-cotizador — presentado como pase de viaje */}
        <div
          ref={quoteRef}
          className="sketch-tilt-right mx-auto w-full max-w-lg rounded-[28px] border-2 border-dashed border-tropical-primary-light/60 bg-tropical-card p-1 shadow-sketch"
        >
          <div className="rounded-[24px] bg-tropical-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-tropical-border pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-tropical text-white">
                  <Plane className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="font-urbanist text-sm font-extrabold leading-none text-tropical-text">
                    Pase de traslado
                  </p>
                  <p className="mt-0.5 text-[11px] text-tropical-muted">Cotiza en segundos</p>
                </div>
              </div>
              <span className="font-hand text-lg text-tropical-secondary">GreenGo</span>
            </div>

            <form onSubmit={onSubmit} aria-label="Cotización rápida de traslado">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="hero-transfer-kind">Tipo de traslado</Label>
                  <Select
                    id="hero-transfer-kind"
                    value={transferKind}
                    onChange={(e) => setTransferKind(e.target.value as TransferKind)}
                    className="mt-1.5"
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
                        className="mt-1.5"
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
                        className="mt-1.5"
                        options={HOTELS}
                        value={destinationHotelId}
                        onChange={setDestinationHotelId}
                        placeholder="Selecciona un hotel"
                        searchPlaceholder="Buscar hotel..."
                      />
                      {sameHotelError && (
                        <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">
                          El hotel de origen y destino deben ser distintos.
                        </p>
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
                        className="mt-1.5"
                        options={HOTELS}
                        value={hotelId}
                        onChange={setHotelId}
                        placeholder="Selecciona un hotel"
                        searchPlaceholder="Buscar hotel..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-airport">Aeropuerto</Label>
                      <Select id="hero-airport" value={airportId} onChange={(e) => setAirportId(e.target.value)} className="mt-1.5">
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
                      <Select id="hero-airport" value={airportId} onChange={(e) => setAirportId(e.target.value)} className="mt-1.5">
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
                        className="mt-1.5"
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
                    <fieldset className="sm:col-span-2">
                      <legend className="font-urbanist text-sm font-semibold text-tropical-text">Salida desde</legend>
                      <div className="mt-1.5 flex gap-4">
                        <label className="flex min-h-[44px] items-center gap-2 text-sm text-tropical-text">
                          <input
                            type="radio"
                            className="h-4 w-4 accent-tropical-primary"
                            checked={tourOrigin === "aeropuerto"}
                            onChange={() => setTourOrigin("aeropuerto")}
                          />
                          Aeropuerto
                        </label>
                        <label className="flex min-h-[44px] items-center gap-2 text-sm text-tropical-text">
                          <input
                            type="radio"
                            className="h-4 w-4 accent-tropical-primary"
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
                            className="mt-1.5"
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
                            className="mt-1.5"
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
                        className="mt-1.5"
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
                    className="mt-1.5 flex h-11 w-full rounded-xl border-2 border-tropical-border bg-tropical-card px-3.5 py-2 text-sm text-tropical-text focus-visible:outline-none focus-visible:border-tropical-secondary focus-visible:ring-2 focus-visible:ring-tropical-secondary/30"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-time">Horario</Label>
                  <input
                    id="hero-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1.5 flex h-11 w-full rounded-xl border-2 border-tropical-border bg-tropical-card px-3.5 py-2 text-sm text-tropical-text focus-visible:outline-none focus-visible:border-tropical-secondary focus-visible:ring-2 focus-visible:ring-tropical-secondary/30"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="hero-passengers">Pasajeros</Label>
                  <div className="mt-1.5 flex items-center gap-1 rounded-xl border-2 border-tropical-border bg-tropical-card px-2 py-1">
                    <MapPin className="ml-1 h-4 w-4 shrink-0 text-tropical-muted" aria-hidden />
                    <input
                      id="hero-passengers"
                      type="number"
                      min={1}
                      max={20}
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      className="h-9 w-full bg-transparent px-2 text-sm text-tropical-text focus-visible:outline-none"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="mt-5 w-full">
                <Search /> Cotizar traslado
              </Button>

              {estimate && (
                <div className="mt-4 rounded-2xl border-2 border-dashed border-tropical-secondary/50 bg-tropical-surface p-4">
                  <p className="text-sm text-tropical-muted">{estimate.label}</p>
                  <p className="mt-1 font-urbanist text-2xl font-extrabold text-tropical-primary">
                    {estimate.currency === "MXN" ? formatMXN(estimate.total) : formatUSD(estimate.total)}
                  </p>
                  <p className="mt-1 text-xs text-tropical-muted">
                    Estimado ilustrativo, sujeto a confirmación en tu reservación.
                  </p>
                  <Button type="button" variant="accent" onClick={onContinue} className="mt-3 w-full">
                    Continuar con mi reserva
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
