"use client";

// Borrador del formulario de reserva multi-paso (/reservar). Se persiste en
// localStorage para no perder los datos si el usuario recarga a mitad del
// proceso. No representa una reservación real hasta pasar por /pago.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReservationDraft } from "@/types";

const EMPTY_DRAFT: ReservationDraft = {
  serviceType: null,
  originLocationId: null,
  destinationLocationId: null,
  direction: "sencillo",
  date: "",
  time: "",
  passengers: 2,
  bags: 2,
  flightNumber: "",
  notes: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  hotel: "",
};

interface ReservationState {
  step: number;
  draft: ReservationDraft;
  // Folio de la reservación ya confirmada (paso /pago/confirmacion). Evita
  // crear un viaje duplicado en el store si el usuario recarga esa página.
  confirmedFolio: string | null;
  setStep: (step: number) => void;
  updateDraft: (patch: Partial<ReservationDraft>) => void;
  setConfirmedFolio: (folio: string) => void;
  clearConfirmedFolio: () => void;
  resetReservation: () => void;
}

export const useReservationStore = create<ReservationState>()(
  persist(
    (set) => ({
      step: 1,
      draft: EMPTY_DRAFT,
      confirmedFolio: null,
      setStep: (step) => set({ step }),
      updateDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      setConfirmedFolio: (folio) => set({ confirmedFolio: folio }),
      clearConfirmedFolio: () => set({ confirmedFolio: null }),
      resetReservation: () => set({ step: 1, draft: EMPTY_DRAFT, confirmedFolio: null }),
    }),
    { name: "greengo-reservation-draft" },
  ),
);
