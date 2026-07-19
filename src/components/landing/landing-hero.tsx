"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, Label } from "@/components/ui/input";
import { LOCATIONS } from "@/mocks/locations";

export function LandingHero() {
  const router = useRouter();
  const [origin, setOrigin] = React.useState(LOCATIONS[0].id);
  const [destination, setDestination] = React.useState(LOCATIONS[1].id);
  const [date, setDate] = React.useState("");
  const [passengers, setPassengers] = React.useState(2);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      origin,
      destination,
      passengers: String(passengers),
    });
    if (date) params.set("date", date);
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
            <div>
              <Label htmlFor="hero-origin">Origen</Label>
              <Select id="hero-origin" value={origin} onChange={(e) => setOrigin(e.target.value)} className="mt-1">
                {LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="hero-destination">Destino</Label>
              <Select
                id="hero-destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </Select>
            </div>
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
        </form>
      </div>
    </section>
  );
}
