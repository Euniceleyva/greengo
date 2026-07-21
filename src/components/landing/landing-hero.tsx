"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Search } from "lucide-react";
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
    <section className="relative overflow-hidden px-5 pb-28 pt-28 sm:px-8 sm:pt-32 lg:pb-40">
      <div className="mx-auto grid max-w-[1380px] gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-14">
        <div className="pb-2 lg:pb-12">
          <h1 className="w-full max-w-6xl text-[clamp(3.2rem,7vw,7.8rem)] font-black leading-[0.87] tracking-[-0.072em] text-[#132e2a]">
            Menos traslado. Más aventura.
          </h1>
          <p className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-[#31534e] sm:text-xl">
            Del aeropuerto a la primera playa, de tu hotel al cenote que nadie olvida. Tú trae las ganas; nosotros hacemos que llegar también sea parte del viaje.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => document.querySelector("#cotizador")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#132e2a] px-7 text-sm font-black text-white transition-transform hover:scale-105">
              Diseña tu ruta <ArrowDownRight className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" onClick={() => document.querySelector("#destinos")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border-2 border-[#132e2a] px-7 text-sm font-black text-[#132e2a] transition-transform hover:scale-105">
              Explora destinos <ArrowUpRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="adventure-grain group relative min-h-[34rem] overflow-hidden rounded-[2rem] bg-[#0e9c9a] sm:min-h-[42rem] lg:min-h-[49rem]">
          <video
            src="/images/hero-cancun.mp4"
            poster="/images/destinations/cancun.jpg"
            autoPlay
            muted
            loop
            playsInline
            aria-label="Costa de Cancún vista desde el aire"
            className="absolute inset-0 h-full w-full object-cover opacity-90 contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#132e2a]/70 via-transparent to-[#c8f04b]/10" aria-hidden />
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-6 p-7 text-white sm:p-10">
            <p className="max-w-xs text-2xl font-black leading-tight tracking-[-0.04em] sm:text-3xl">Cancún es apenas el punto de partida.</p>
            <ArrowDownRight className="h-10 w-10 shrink-0" strokeWidth={1.5} aria-hidden />
          </div>
        </div>
      </div>

      <div id="cotizador" className="relative mx-auto mt-16 max-w-[1180px] scroll-mt-28 lg:mt-[-4rem]">
        <form
          onSubmit={onSubmit}
          className="w-full rounded-[2rem] border border-[#132e2a]/10 bg-white p-5 text-left shadow-[0_30px_80px_rgba(19,46,42,0.14)] sm:p-8"
          aria-label="Cotización rápida de traslado"
        >
          <div className="mb-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-black tracking-[-0.04em] text-[#132e2a] sm:text-3xl">¿A dónde empieza lo bueno?</h2>
              <p className="mt-1 text-sm font-medium text-[#55706c]">Arma una cotización rápida. Sin llamadas, sin vueltas.</p>
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#55706c]">Precio estimado al instante</span>
          </div>
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

          <Button type="submit" className="mt-5 w-full rounded-full bg-[#c8f04b] font-black text-[#132e2a] hover:bg-[#b9df45] sm:w-auto">
            <Search /> Cotizar traslado
          </Button>

          {estimate && (
            <div className="mt-5 rounded-2xl border-0 bg-[#132e2a] p-5 text-white">
              <p className="text-sm text-white/65">{estimate.label}</p>
              <p className="mt-1 text-3xl font-black text-[#c8f04b]">
                {estimate.currency === "MXN" ? formatMXN(estimate.total) : formatUSD(estimate.total)}
              </p>
              <p className="mt-1 text-xs text-white/55">
                Estimado ilustrativo, sujeto a confirmación en tu reservación.
              </p>
              <Button type="button" onClick={onContinue} className="mt-3 w-full rounded-full bg-white font-black text-[#132e2a] hover:bg-white/90 sm:w-auto">
                Continuar con mi reserva
              </Button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
