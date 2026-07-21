"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, Label } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
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
    <section className="marketing-grain relative flex min-h-[100dvh] flex-col overflow-hidden bg-[hsl(var(--marketing-ink))] text-[hsl(var(--marketing-paper))]">
      <video
        src="/images/hero-cancun.mp4"
        poster="/images/destinations/cancun.jpg"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-65 contrast-125 saturate-[.72]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,transparent_0%,hsl(var(--marketing-ink)/.2)_38%,hsl(var(--marketing-ink)/.92)_100%)]" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--marketing-ink)/.16)] via-transparent to-[hsl(var(--marketing-ink)/.96)]" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-[88rem] flex-1 flex-col items-center px-4 pb-10 pt-40 text-center sm:px-6 sm:pb-14 sm:pt-48 lg:px-8 lg:pt-52">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[hsl(var(--marketing-paper)/.72)]">Traslados privados · Cancún y Riviera Maya</p>
        <h1 className="marketing-display mt-6 w-full max-w-6xl text-balance text-[clamp(3.25rem,7.2vw,7.6rem)] font-medium leading-[0.84] tracking-[-0.055em] text-[hsl(var(--marketing-paper))]">
          La llegada ya forma parte del viaje.
        </h1>
        <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-[hsl(var(--marketing-paper)/.76)] sm:text-lg">
          Traslados privados con conductores profesionales, seguimiento de vuelo y atención clara desde el primer minuto.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#cotizar" className="flex min-h-12 items-center justify-center bg-[hsl(var(--marketing-paper))] px-7 text-sm font-semibold text-[hsl(var(--marketing-ink))] transition-transform hover:-translate-y-0.5 active:translate-y-0">Cotizar aquí</a>
          <button type="button" onClick={() => router.push("/reservar")} className="min-h-12 border border-[hsl(var(--marketing-paper)/.45)] px-7 text-sm font-semibold text-[hsl(var(--marketing-paper))] transition-colors hover:bg-[hsl(var(--marketing-paper))] hover:text-[hsl(var(--marketing-ink))]">Reservar ahora</button>
        </div>

        <form
          id="cotizar"
          onSubmit={onSubmit}
          className="quote-console mt-16 w-full scroll-mt-28 border border-[hsl(var(--marketing-paper)/.18)] bg-[hsl(var(--marketing-paper)/.96)] p-5 text-left text-[hsl(var(--marketing-ink))] shadow-[0_28px_80px_hsl(var(--marketing-shadow)/.35)] backdrop-blur-xl sm:p-7 lg:mt-24 lg:p-8"
          aria-label="Cotización rápida de traslado"
        >
          <div className="mb-7 flex flex-col justify-between gap-2 border-b border-[hsl(var(--marketing-line))] pb-5 sm:flex-row sm:items-end">
            <div><p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Diseña tu llegada</p><h2 className="marketing-display mt-1 text-3xl leading-none sm:text-4xl">Cotización inmediata</h2></div>
            <p className="max-w-xs text-xs leading-5 text-[hsl(var(--muted-foreground))]">Completa solo los datos de tu trayecto. Puedes terminar la reserva después.</p>
          </div>
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
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

          <Button type="submit" className="mt-6 w-full rounded-none bg-[hsl(var(--marketing-ink))] px-6 text-[hsl(var(--marketing-paper))] transition-transform hover:-translate-y-0.5 sm:w-auto">
            <Search /> Cotizar traslado
          </Button>

          {estimate && (
            <div className="mt-6 border-l-2 border-[hsl(var(--marketing-brass))] bg-[hsl(var(--marketing-canvas))] p-5">
              <p className="text-sm text-muted-foreground">{estimate.label}</p>
              <p className="marketing-display mt-1 text-4xl font-medium text-[hsl(var(--marketing-ink))]">
                {estimate.currency === "MXN" ? formatMXN(estimate.total) : formatUSD(estimate.total)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Estimado ilustrativo, sujeto a confirmación en tu reservación.
              </p>
              <Button type="button" onClick={onContinue} className="mt-4 w-full rounded-none bg-[hsl(var(--marketing-ink))] text-[hsl(var(--marketing-paper))] sm:w-auto">
                Continuar con mi reserva
              </Button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
