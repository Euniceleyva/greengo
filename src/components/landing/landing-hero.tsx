"use client";

import * as React from "react";
import Image from "next/image";
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
    <section className="relative overflow-hidden bg-primary">
      <Image
        src="/images/hero-cancun.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/80 to-background" aria-hidden />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Traslados turísticos en Cancún, sin complicaciones
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-white/90 sm:text-xl">
          Del aeropuerto a tu hotel, entre destinos o por el tiempo que necesites — con conductores
          profesionales y unidades listas para tu viaje.
        </p>
        <div className="mt-8">
          <Button size="lg" onClick={() => router.push("/reservar")} className="shadow-card">
            Reservar ahora
          </Button>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-10 w-full max-w-3xl rounded-2xl bg-card p-4 text-left shadow-popover sm:p-6"
          aria-label="Cotización rápida de traslado"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

          <Button type="submit" className="mt-4 w-full sm:w-auto">
            <Search /> Cotizar traslado
          </Button>

          {estimate && (
            <div className="mt-4 rounded-xl border border-border bg-surface-soft p-4">
              <p className="text-sm text-muted-foreground">{estimate.label}</p>
              <p className="mt-1 font-heading text-2xl font-bold text-primary">
                {estimate.currency === "MXN" ? formatMXN(estimate.total) : formatUSD(estimate.total)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Estimado ilustrativo, sujeto a confirmación en tu reservación.
              </p>
              <Button type="button" onClick={onContinue} className="mt-3 w-full sm:w-auto">
                Continuar con mi reserva
              </Button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
