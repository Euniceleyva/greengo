"use client";

// Borrador del formulario de reserva multi-paso (/reservar). Se persiste en
// localStorage para no perder los datos si el usuario recarga a mitad del
// proceso. No representa una reservación real hasta pasar por /pago.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReservationDraft, ReservationReceipt } from "@/types";

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
  submissionKey: string | null;
  reservationReceipt: ReservationReceipt | null;
  setStep: (step: number) => void;
  updateDraft: (patch: Partial<ReservationDraft>) => void;
  setConfirmedFolio: (folio: string) => void;
  clearConfirmedFolio: () => void;
  setSubmissionKey: (submissionKey: string) => void;
  setReservationReceipt: (receipt: ReservationReceipt) => void;
  resetReservation: () => void;
}

export const useReservationStore = create<ReservationState>()(
  persist(
    (set) => ({
      step: 1,
      draft: EMPTY_DRAFT,
      confirmedFolio: null,
      submissionKey: null,
      reservationReceipt: null,
      setStep: (step) => set({ step }),
      updateDraft: (patch) =>
        set((state) => ({
          draft: { ...state.draft, ...patch },
          confirmedFolio: null,
          submissionKey: null,
          reservationReceipt: null,
        })),
      setConfirmedFolio: (folio) => set({ confirmedFolio: folio }),
      clearConfirmedFolio: () =>
        set({ confirmedFolio: null, submissionKey: null, reservationReceipt: null }),
      setSubmissionKey: (submissionKey) => set({ submissionKey }),
      setReservationReceipt: (reservationReceipt) =>
        set({ reservationReceipt, confirmedFolio: reservationReceipt.folio }),
      resetReservation: () =>
        set({
          step: 1,
          draft: EMPTY_DRAFT,
          confirmedFolio: null,
          submissionKey: null,
          reservationReceipt: null,
        }),
    }),
    { name: "greengo-reservation-draft" },
  ),
);
