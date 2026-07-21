"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useReservationStore } from "@/stores/reservation-store";
import { useHydrated } from "@/lib/hooks";
import { ReservationStepper } from "./reservation-stepper";
import { Step1Service } from "./step1-service";
import { Step2Details } from "./step2-details";
import { Step3Contact } from "./step3-contact";
import { Step4Summary } from "./step4-summary";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import type { ServiceType } from "@/types";

const VALID_SERVICE_TYPES: ServiceType[] = ["hotel_hotel", "aeropuerto", "transporte_abierto", "a_medida"];

const STEP_TITLES: Record<number, string> = {
  1: "Elige tu servicio",
  2: "Detalles del viaje",
  3: "Datos de contacto",
  4: "Confirma tu reservación",
};

export function ReservationWizard() {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const step = useReservationStore((s) => s.step);
  const updateDraft = useReservationStore((s) => s.updateDraft);
  const setStep = useReservationStore((s) => s.setStep);
  const clearConfirmedFolio = useReservationStore((s) => s.clearConfirmedFolio);
  const appliedParams = React.useRef(false);
  const [paramsApplied, setParamsApplied] = React.useState(false);

  React.useEffect(() => {
    if (!hydrated || appliedParams.current) return;
    appliedParams.current = true;

    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const passengers = searchParams.get("passengers");
    const serviceTypeParam = searchParams.get("serviceType");
    const hotel = searchParams.get("hotel");
    const notes = searchParams.get("notes");

    if (origin || destination || date || time || passengers || serviceTypeParam || hotel || notes) {
      updateDraft({
        ...(origin ? { originLocationId: origin } : {}),
        ...(destination ? { destinationLocationId: destination } : {}),
        ...(date ? { date } : {}),
        ...(time ? { time } : {}),
        ...(passengers ? { passengers: Number(passengers) } : {}),
        ...(serviceTypeParam && VALID_SERVICE_TYPES.includes(serviceTypeParam as ServiceType)
          ? { serviceType: serviceTypeParam as ServiceType }
          : {}),
        ...(hotel ? { hotel } : {}),
        ...(notes ? { notes } : {}),
      });
      setStep(1);
      clearConfirmedFolio();
    }
    setParamsApplied(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated || !paramsApplied) {
    return (
      <Card className="p-6 sm:p-8">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="mt-8 h-64 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <ReservationStepper current={step} />
      <h1 className="mt-8 font-urbanist text-2xl font-extrabold text-tropical-text">{STEP_TITLES[step]}</h1>
      <div className="mt-6">
        {step === 1 && <Step1Service />}
        {step === 2 && <Step2Details />}
        {step === 3 && <Step3Contact />}
        {step === 4 && <Step4Summary />}
      </div>
    </Card>
  );
}
