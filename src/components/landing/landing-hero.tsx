"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowDownRight, ArrowRight, Plane, Search, ShieldCheck } from "lucide-react";
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
import type { HeroQuoteEstimate, TourOrigin, TransferKind } from "@/types";
import { usePublicLocale } from "@/components/shared/public-locale";

const TRANSFER_KIND_LABELS: Record<TransferKind, string> = {
  hotel_hotel: "Hotel a hotel",
  hotel_aeropuerto: "Hotel a aeropuerto",
  aeropuerto_hotel: "Aeropuerto a hotel",
  tour: "Tour",
};

export function LandingHero() {
  const router = useRouter();
  const { text, money } = usePublicLocale();

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

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[var(--mkt-night)] text-white">
      <div data-hero-media className="absolute inset-0 will-change-transform">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
          poster="/images/images/400.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/images/hero-cancun.webm" type="video/webm" />
          <source src="/images/hero-cancun-optimizado.mp4" type="video/mp4" />
        </video>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,31,43,.82)_0%,rgba(8,31,43,.42)_48%,rgba(8,31,43,.08)_75%),linear-gradient(0deg,rgba(8,31,43,.68)_0%,transparent_55%)]" aria-hidden />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1480px] flex-col justify-end px-5 pb-8 pt-28 sm:px-8 lg:px-12 lg:pb-10">
        <div className="mb-12 max-w-[820px] lg:mb-16">
        <p data-hero-beat className="mkt-eyebrow mb-5 flex items-center gap-3 text-white/75"><span className="h-px w-10 bg-[var(--mkt-gold)]" />Cancún · Riviera Maya</p>
        <h1 data-hero-beat className="max-w-[800px] font-heading text-[clamp(3.4rem,7vw,7.5rem)] font-medium leading-[.86] tracking-[-.055em] text-white">{text("Llegar también puede sentirse como vacaciones.", "Arriving can feel like a vacation, too.")}</h1>
        <p data-hero-beat className="mt-7 max-w-xl text-base leading-7 text-white/76 sm:text-lg">
          {text("Del aeropuerto al mar con calma, privacidad y todo resuelto. Después, la Riviera es tuya: playa, mesa, música y noche.", "From the airport to the sea with calm, privacy, and every detail handled. Then the Riviera is yours: beach, dining, music, and nights out.")}
        </p>
        <div data-hero-beat className="mt-8 flex flex-wrap items-center gap-6">
          <Button size="lg" onClick={() => router.push("/reservar")} className="rounded-none bg-[var(--mkt-coral)] px-7 hover:bg-[#9f4e39]">{text("Comenzar mi viaje", "Start my trip")} <ArrowRight /></Button>
          <a href="#destinos" className="mkt-link text-sm text-white/85">{text("Descubrir la costa", "Discover the coast")} <ArrowDownRight className="h-4 w-4" /></a>
        </div>
        <div data-hero-beat className="mt-8 flex flex-wrap gap-x-7 gap-y-2 text-[11px] uppercase tracking-[.12em] text-white/55"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--mkt-gold)]" />{text("Conductores verificados", "Verified drivers")}</span><span className="flex items-center gap-2"><Plane className="h-4 w-4 text-[var(--mkt-gold)]" />{text("Seguimiento de vuelo", "Flight tracking")}</span></div>
        </div>

        <div data-horizon className="h-px w-full bg-gradient-to-r from-[var(--mkt-gold)] via-white/45 to-transparent" />

        <form
          onSubmit={onSubmit}
          data-quote-panel
          className="w-full border-b border-white/20 bg-[rgba(8,31,43,.76)] p-5 text-left backdrop-blur-md sm:p-6 lg:px-8"
          aria-label="Cotización rápida de traslado"
        >
          <div className="mb-4 flex items-end justify-between"><div><p className="mkt-eyebrow text-[var(--mkt-gold)]">{text("Tu llegada", "Your arrival")}</p><h2 className="mt-1 font-heading text-2xl font-medium text-white">{text("Cotiza sin prisa", "Get a relaxed quote")}</h2></div><p className="hidden text-xs text-white/45 lg:block">{text("Estimación inmediata · reserva en minutos", "Instant estimate · book in minutes")}</p></div>
          <div className="grid gap-4 text-white sm:grid-cols-2 lg:grid-cols-4 [&_label]:text-white/65 [&_legend]:text-white/65 [&_input]:border-white/20 [&_input]:bg-white/10 [&_input]:text-white [&_select]:border-white/20 [&_select]:bg-[#173b46] [&_select]:text-white [&_[role=combobox]]:border-white/20 [&_[role=combobox]]:bg-white/10 [&_[role=combobox]]:text-white">
            <div className="sm:col-span-2 lg:col-span-4">
              <Label htmlFor="hero-transfer-kind">{text("Tipo de traslado", "Transfer type")}</Label>
              <Select
                id="hero-transfer-kind"
                value={transferKind}
                onChange={(e) => setTransferKind(e.target.value as TransferKind)}
                className="mt-1"
              >
                {(Object.keys(TRANSFER_KIND_LABELS) as TransferKind[]).map((kind) => (
                  <option key={kind} value={kind}>
                    {text(TRANSFER_KIND_LABELS[kind], kind === "hotel_hotel" ? "Hotel to hotel" : kind === "hotel_aeropuerto" ? "Hotel to airport" : kind === "aeropuerto_hotel" ? "Airport to hotel" : "Tour")}
                  </option>
                ))}
              </Select>
            </div>

            {transferKind === "hotel_hotel" && (
              <>
                <div>
                  <Label htmlFor="hero-origin-hotel">{text("Hotel de origen", "Pickup hotel")}</Label>
                  <Combobox
                    id="hero-origin-hotel"
                    className="mt-1"
                    options={HOTELS}
                    value={originHotelId}
                    onChange={setOriginHotelId}
                    placeholder={text("Selecciona un hotel", "Select a hotel")}
                    searchPlaceholder={text("Buscar hotel...", "Search hotels...")}
                  />
                </div>
                <div>
                  <Label htmlFor="hero-destination-hotel">{text("Hotel de destino", "Destination hotel")}</Label>
                  <Combobox
                    id="hero-destination-hotel"
                    className="mt-1"
                    options={HOTELS}
                    value={destinationHotelId}
                    onChange={setDestinationHotelId}
                    placeholder={text("Selecciona un hotel", "Select a hotel")}
                    searchPlaceholder={text("Buscar hotel...", "Search hotels...")}
                  />
                  {sameHotelError && (
                    <p className="mt-1 text-xs text-destructive">{text("El hotel de origen y destino deben ser distintos.", "Pickup and destination hotels must be different.")}</p>
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
                    placeholder={text("Selecciona un hotel", "Select a hotel")}
                    searchPlaceholder={text("Buscar hotel...", "Search hotels...")}
                  />
                </div>
                <div>
                  <Label htmlFor="hero-airport">{text("Aeropuerto", "Airport")}</Label>
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
                  <Label htmlFor="hero-airport">{text("Aeropuerto", "Airport")}</Label>
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
                    placeholder={text("Selecciona un hotel", "Select a hotel")}
                    searchPlaceholder={text("Buscar hotel...", "Search hotels...")}
                  />
                </div>
              </>
            )}

            {transferKind === "tour" && (
              <>
                <fieldset className="sm:col-span-2 lg:col-span-4">
                  <legend className="text-sm font-medium text-foreground">{text("Salida desde", "Pickup from")}</legend>
                  <div className="mt-1.5 flex gap-4">
                    <label className="flex min-h-[44px] items-center gap-2 text-sm text-foreground">
                      <input
                        type="radio"
                        className="h-4 w-4"
                        checked={tourOrigin === "aeropuerto"}
                        onChange={() => setTourOrigin("aeropuerto")}
                      />
                      {text("Aeropuerto", "Airport")}
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
                      <Label htmlFor="hero-airport">{text("Aeropuerto", "Airport")}</Label>
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
                        placeholder={text("Selecciona un hotel", "Select a hotel")}
                        searchPlaceholder={text("Buscar hotel...", "Search hotels...")}
                      />
                    </>
                  )}
                </div>

                <div>
                  <Label htmlFor="hero-tour-destination">{text("Destino", "Destination")}</Label>
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
              <Label htmlFor="hero-date">{text("Fecha", "Date")}</Label>
              <input
                id="hero-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </div>
            <div>
              <Label htmlFor="hero-time">{text("Horario", "Time")}</Label>
              <input
                id="hero-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </div>
            <div>
              <Label htmlFor="hero-passengers">{text("Pasajeros", "Passengers")}</Label>
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

          <Button type="submit" className="mt-5 w-full rounded-none bg-[var(--mkt-coral)] sm:w-auto">
            <Search /> {text("Cotizar traslado", "Get quote")}
          </Button>

          {estimate && (
            <div className="mt-4 flex flex-col justify-between gap-4 border-t border-white/20 pt-4 text-white sm:flex-row sm:items-end">
              <div><p className="text-sm text-white/55">{estimate.label}</p>
              <p className="mt-1 font-heading text-3xl font-medium text-white">
                {money(estimate.total, estimate.currency)}
              </p>
              <p className="mt-1 text-xs text-white/45">
                {text("Estimado ilustrativo, sujeto a confirmación en tu reservación.", "Illustrative estimate, subject to confirmation when booking.")}
              </p></div>
              <Button type="button" onClick={onContinue} className="w-full rounded-none bg-white text-[var(--mkt-ink)] hover:bg-[var(--mkt-bg)] sm:w-auto">
                {text("Continuar con mi reserva", "Continue booking")}
              </Button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
