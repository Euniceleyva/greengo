"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { TOUR_DESTINATIONS } from "@/mocks/tour-destinations";
import { HOTEL_BOOKING_ZONES, getBookingZone, isCustomHotelId } from "@/data/booking-zones";
import { getCancunToday, getPublicFareQuote, type PublicFareQuote } from "@/lib/public-fares";
import { LocalizedCurrency } from "@/components/shared/public-language";
import type { ServiceType, TourOrigin, TransferKind } from "@/types";

gsap.registerPlugin(useGSAP);

const TRANSFER_KIND_LABELS: Record<TransferKind, string> = {
  hotel_hotel: "Hotel a hotel",
  hotel_aeropuerto: "Hotel a aeropuerto",
  aeropuerto_hotel: "Aeropuerto a hotel",
  tour: "Tour",
};

const HERO_ROUTE_PATH = "M24 188C120 80 207 238 302 129C387 31 459 170 628 48";
const AIRPORT_LOCATION_ID = "loc-aeropuerto";

const TOUR_DESTINATION_TO_LOCATION_ID: Record<string, string> = {
  "tour-tulum": "loc-tulum",
  "tour-puerto-morelos": "loc-puerto-morelos",
  "tour-playa-del-carmen-ferry-to-cozumel": "loc-playa-carmen",
  "tour-ferry-to-isla-mujeres": "loc-puerto-juarez",
  "tour-cancun": "loc-zona-hotelera",
};

export function LandingHero() {
  const router = useRouter();
  const heroRef = React.useRef<HTMLElement>(null);

  const [transferKind, setTransferKind] = React.useState<TransferKind>("aeropuerto_hotel");
  const [originZoneId, setOriginZoneId] = React.useState("loc-zona-hotelera");
  const [destinationZoneId, setDestinationZoneId] = React.useState("loc-puerto-morelos");
  const [originHotelId, setOriginHotelId] = React.useState("");
  const [destinationHotelId, setDestinationHotelId] = React.useState("");
  const [originHotelName, setOriginHotelName] = React.useState("");
  const [destinationHotelName, setDestinationHotelName] = React.useState("");
  const [tourOrigin, setTourOrigin] = React.useState<TourOrigin>("aeropuerto");
  const [tourDestinationId, setTourDestinationId] = React.useState(TOUR_DESTINATIONS[0].id);
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [passengers, setPassengers] = React.useState(2);
  const [quote, setQuote] = React.useState<PublicFareQuote | "custom" | null>(null);
  const [routeError, setRouteError] = React.useState("");
  const [canPlayVideo, setCanPlayVideo] = React.useState(false);
  const today = React.useMemo(() => getCancunToday(), []);

  // Cualquier cambio en las opciones invalida el estimado ya mostrado.
  React.useEffect(() => {
    setQuote(null);
    setRouteError("");
  }, [transferKind, originZoneId, destinationZoneId, originHotelId, destinationHotelId, originHotelName, destinationHotelName, tourOrigin, tourDestinationId, date, time, passengers]);

  React.useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const media = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const update = () => setCanPlayVideo(media.matches && !connection?.saveData);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const tourDestination = TOUR_DESTINATIONS.find((d) => d.id === tourDestinationId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const needsOriginHotel = transferKind === "hotel_hotel" || transferKind === "hotel_aeropuerto" || (transferKind === "tour" && tourOrigin === "hotel");
    const needsDestinationHotel = transferKind === "hotel_hotel" || transferKind === "aeropuerto_hotel";

    if (needsOriginHotel && !isHeroHotelComplete(originZoneId, originHotelId, originHotelName)) {
      setRouteError("Selecciona el hotel o escribe el nombre del alojamiento de origen.");
      return;
    }
    if (needsDestinationHotel && !isHeroHotelComplete(destinationZoneId, destinationHotelId, destinationHotelName)) {
      setRouteError("Selecciona el hotel o escribe el nombre del alojamiento de destino.");
      return;
    }
    if (transferKind === "hotel_hotel" && originZoneId === destinationZoneId && originHotelId === destinationHotelId && originHotelName === destinationHotelName) {
      setRouteError("El hotel de origen y destino deben ser distintos.");
      return;
    }

    setRouteError("");
    if (transferKind === "aeropuerto_hotel" || transferKind === "hotel_aeropuerto") {
      const result = getPublicFareQuote({
        originLocationId: transferKind === "aeropuerto_hotel" ? AIRPORT_LOCATION_ID : originZoneId,
        destinationLocationId: transferKind === "aeropuerto_hotel" ? destinationZoneId : AIRPORT_LOCATION_ID,
        passengers,
        time,
      });
      setQuote(result ?? "custom");
      return;
    }
    setQuote("custom");
  };

  const onContinue = () => {
    const serviceType: ServiceType = transferKind === "hotel_hotel"
      ? "hotel_hotel"
      : transferKind === "tour"
        ? "a_medida"
        : "aeropuerto";
    const originLocationId = transferKind === "aeropuerto_hotel" || (transferKind === "tour" && tourOrigin === "aeropuerto")
      ? AIRPORT_LOCATION_ID
      : originZoneId;
    const destinationLocationId = transferKind === "hotel_aeropuerto"
      ? AIRPORT_LOCATION_ID
      : transferKind === "tour"
        ? TOUR_DESTINATION_TO_LOCATION_ID[tourDestinationId] ?? "loc-xcaret"
        : destinationZoneId;
    let notes = "";
    if (transferKind === "tour") notes = `Tour a ${tourDestination?.name ?? "—"}.`;

    const params = new URLSearchParams({
      origin: originLocationId,
      destination: destinationLocationId,
      passengers: String(passengers),
      serviceType,
      direction: "sencillo",
      fromQuote: "1",
    });
    if (date) params.set("date", date);
    if (time) params.set("time", time);
    if (originLocationId !== AIRPORT_LOCATION_ID) {
      params.set("originHotelId", originHotelId);
      if (originHotelName) params.set("originHotelName", originHotelName);
    }
    if (destinationLocationId !== AIRPORT_LOCATION_ID) {
      params.set(
        "destinationHotelId",
        transferKind === "tour" ? `${destinationLocationId}-otro` : destinationHotelId,
      );
      const resolvedDestinationName = transferKind === "tour" ? tourDestination?.name ?? "Destino del tour" : destinationHotelName;
      if (resolvedDestinationName) params.set("destinationHotelName", resolvedDestinationName);
    }
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
          <p className="adventure-kicker">TRASLADOS PRIVADOS EN CANCÚN Y RIVIERA MAYA</p>
          <h1 className="adventure-hero__title" aria-label="Aborda. Viaja. Disfruta.">
            <span className="adventure-word-mask"><span data-hero-word>ABORDA.</span></span>
            <span className="adventure-word-mask"><span data-hero-word className="text-[var(--adventure-sun)]">VIAJA.</span></span>
            <span className="adventure-word-mask"><span data-hero-word className="text-[var(--adventure-coral)]">DISFRUTA.</span></span>
          </h1>
          <p className="adventure-hero__lede">
            Reserva tu traslado privado desde el Aeropuerto de Cancún y empieza tus vacaciones sin filas ni negociaciones. Te llevamos directo a tu hotel, tour o destino.
          </p>
          <button type="button" onClick={() => router.push("/reservar")} className="adventure-text-link">
            Cotizar mi traslado <ArrowRight aria-hidden />
          </button>
        </div>

        <div data-hero-media className="adventure-hero__media">
          {canPlayVideo ? (
            <video
              poster="/images/destinations/cancun.webp"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Costa turquesa de Cancún vista desde el aire"
              className="h-full w-full object-cover"
            >
              <source src="/images/hero-cancun.webm" type="video/webm" />
              <source src="/images/hero-cancun-optimizado.mp4" type="video/mp4" />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/destinations/cancun.webp"
              alt="Costa turquesa de Cancún vista desde el aire"
              className="h-full w-full object-cover"
            />
          )}
          <div className="adventure-hero__media-label"><MapPin aria-hidden /> Aeropuerto de Cancún → hotel o destino</div>
          <div data-hero-sticker data-hero-float className="adventure-sticker adventure-sticker--coral">PLAYA<br />MODE</div>
        </div>

        <svg className="adventure-hero__route" viewBox="0 0 660 240" fill="none" aria-hidden>
          <defs>
            <g id="hero-route-van-shape">
              <ellipse className="adventure-hero__van-shadow" cx="0" cy="11" rx="24" ry="6" />
              <rect className="adventure-hero__van-body" x="-24" y="-13" width="47" height="22" rx="6" />
              <rect className="adventure-hero__van-cabin" x="3" y="-17" width="18" height="17" rx="5" />
              <rect className="adventure-hero__van-window" x="-16" y="-9" width="12" height="7" rx="2" />
              <rect className="adventure-hero__van-window" x="-1" y="-9" width="11" height="7" rx="2" />
              <rect className="adventure-hero__van-window" x="12" y="-10" width="7" height="8" rx="2" />
              <rect className="adventure-hero__van-stripe" x="-19" y="1" width="31" height="4" rx="2" />
              <circle className="adventure-hero__van-wheel" cx="-13" cy="10" r="5" />
              <circle className="adventure-hero__van-wheel" cx="14" cy="10" r="5" />
              <circle className="adventure-hero__van-hub" cx="-13" cy="10" r="1.6" />
              <circle className="adventure-hero__van-hub" cx="14" cy="10" r="1.6" />
            </g>
          </defs>
          <path className="adventure-hero__road-shadow" d={HERO_ROUTE_PATH} />
          <path className="adventure-hero__road-border" d={HERO_ROUTE_PATH} />
          <path data-hero-route className="adventure-hero__road-asphalt" d={HERO_ROUTE_PATH} />
          <path className="adventure-hero__road-texture adventure-hero__road-texture--one" d={HERO_ROUTE_PATH} />
          <path className="adventure-hero__road-texture adventure-hero__road-texture--two" d={HERO_ROUTE_PATH} />
          <path className="adventure-hero__road-lane" d={HERO_ROUTE_PATH} />
          <g className="adventure-hero__van adventure-hero__van--animated">
            <use href="#hero-route-van-shape" />
            <animateMotion dur="7.2s" repeatCount="indefinite" rotate="auto" begin="1.25s" path={HERO_ROUTE_PATH} />
          </g>
          <g className="adventure-hero__van adventure-hero__van--static" transform="translate(374 111) rotate(22)">
            <use href="#hero-route-van-shape" />
          </g>
        </svg>

        <form
          onSubmit={onSubmit}
          data-hero-quote
          className="adventure-quote text-left"
          aria-label="Cotización rápida de traslado"
        >
          <div className="adventure-quote__header">
            <div>
              <span>Tarifa clara antes de confirmar</span>
              <h2>Cotiza tu ruta en Cancún</h2>
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
                <HeroZoneHotelFields
                  prefix="hero-origin"
                  label="Origen"
                  zoneId={originZoneId}
                  hotelId={originHotelId}
                  hotelName={originHotelName}
                  onZoneChange={(value) => { setOriginZoneId(value); setOriginHotelId(""); setOriginHotelName(""); }}
                  onHotelChange={setOriginHotelId}
                  onHotelNameChange={setOriginHotelName}
                />
                <HeroZoneHotelFields
                  prefix="hero-destination"
                  label="Destino"
                  zoneId={destinationZoneId}
                  hotelId={destinationHotelId}
                  hotelName={destinationHotelName}
                  onZoneChange={(value) => { setDestinationZoneId(value); setDestinationHotelId(""); setDestinationHotelName(""); }}
                  onHotelChange={setDestinationHotelId}
                  onHotelNameChange={setDestinationHotelName}
                />
              </>
            )}

            {transferKind === "hotel_aeropuerto" && (
              <>
                <HeroZoneHotelFields
                  prefix="hero-origin"
                  label="Origen"
                  zoneId={originZoneId}
                  hotelId={originHotelId}
                  hotelName={originHotelName}
                  onZoneChange={(value) => { setOriginZoneId(value); setOriginHotelId(""); setOriginHotelName(""); }}
                  onHotelChange={setOriginHotelId}
                  onHotelNameChange={setOriginHotelName}
                />
                <div>
                  <Label htmlFor="hero-airport">Aeropuerto</Label>
                  <Input id="hero-airport" value="Aeropuerto Internacional de Cancún" readOnly className="mt-1" />
                </div>
              </>
            )}

            {transferKind === "aeropuerto_hotel" && (
              <>
                <div>
                  <Label htmlFor="hero-airport">Aeropuerto</Label>
                  <Input id="hero-airport" value="Aeropuerto Internacional de Cancún" readOnly className="mt-1" />
                </div>
                <HeroZoneHotelFields
                  prefix="hero-destination"
                  label="Destino"
                  zoneId={destinationZoneId}
                  hotelId={destinationHotelId}
                  hotelName={destinationHotelName}
                  onZoneChange={(value) => { setDestinationZoneId(value); setDestinationHotelId(""); setDestinationHotelName(""); }}
                  onHotelChange={setDestinationHotelId}
                  onHotelNameChange={setDestinationHotelName}
                />
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

                {tourOrigin === "aeropuerto" ? (
                  <div>
                    <Label htmlFor="hero-airport">Aeropuerto</Label>
                    <Input id="hero-airport" value="Aeropuerto Internacional de Cancún" readOnly className="mt-1" />
                  </div>
                ) : (
                  <HeroZoneHotelFields
                    prefix="hero-origin"
                    label="Origen"
                    zoneId={originZoneId}
                    hotelId={originHotelId}
                    hotelName={originHotelName}
                    onZoneChange={(value) => { setOriginZoneId(value); setOriginHotelId(""); setOriginHotelName(""); }}
                    onHotelChange={setOriginHotelId}
                    onHotelNameChange={setOriginHotelName}
                  />
                )}

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
                min={today}
                required
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
                required
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
                max={60}
                required
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

            {routeError && <p role="alert" className="mt-3 text-sm font-bold text-destructive">{routeError}</p>}

            {quote && (
              <div className="adventure-estimate mt-4 p-4" aria-live="polite">
                {quote === "custom" ? (
                  <>
                    <p className="text-sm font-bold text-foreground">Cotización personalizada</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Enviaremos la ruta al equipo sin realizar ningún cobro. Te confirmaremos la tarifa por WhatsApp.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Tarifa vigente para tu ruta</p>
                    <p className="mt-1 font-heading text-2xl font-bold text-primary">
                      <LocalizedCurrency amount={quote.total} sourceCurrency={quote.currency} />
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Precio calculado según ruta, horario y pasajeros. El servidor lo verificará antes del pago.
                    </p>
                    {quote.departure.isNight && (
                      <p className="mt-2 text-xs font-bold text-foreground">
                        Tarifa nocturna aplicada (10:00 p. m.–5:00 a. m.).
                      </p>
                    )}
                  </>
                )}
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

function isHeroHotelComplete(zoneId: string, hotelId: string, hotelName: string) {
  const zone = getBookingZone(zoneId);
  if (!zone || !hotelId || !zone.hotels.some((hotel) => hotel.id === hotelId)) return false;
  return !isCustomHotelId(zoneId, hotelId) || hotelName.trim().length >= 2;
}

function HeroZoneHotelFields({
  prefix,
  label,
  zoneId,
  hotelId,
  hotelName,
  onZoneChange,
  onHotelChange,
  onHotelNameChange,
}: {
  prefix: string;
  label: string;
  zoneId: string;
  hotelId: string;
  hotelName: string;
  onZoneChange: (value: string) => void;
  onHotelChange: (value: string) => void;
  onHotelNameChange: (value: string) => void;
}) {
  const zone = getBookingZone(zoneId);
  return (
    <>
      <div>
        <Label htmlFor={`${prefix}-zone`}>{label}</Label>
        <Select id={`${prefix}-zone`} value={zoneId} onChange={(event) => onZoneChange(event.target.value)} className="mt-1">
          {HOTEL_BOOKING_ZONES.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor={`${prefix}-hotel`}>Hotel o alojamiento</Label>
        <Select
          id={`${prefix}-hotel`}
          value={hotelId}
          onChange={(event) => onHotelChange(event.target.value)}
          className="mt-1"
          required
        >
          <option value="">Selecciona un hotel</option>
          {zone?.hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}
        </Select>
        {zone && isCustomHotelId(zone.id, hotelId) && (
          <Input
            value={hotelName}
            onChange={(event) => onHotelNameChange(event.target.value)}
            placeholder="Nombre del hotel o alojamiento"
            className="mt-2"
            required
          />
        )}
      </div>
    </>
  );
}
