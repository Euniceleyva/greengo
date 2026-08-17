"use client";

import * as React from "react";
import Image from "next/image";
import {
  CalendarDays,
  CircleDollarSign,
  Download,
  FileText,
  MapPinned,
  RefreshCw,
} from "lucide-react";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { formatDate } from "@/lib/format";
import { SERVICE_TYPE_LABELS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/constants";
import type { PaymentStatus, Trip } from "@/types";

type Period = "hoy" | "semana" | "mes" | "todos" | "personalizado";

const PERIOD_OPTIONS: Array<{ value: Period; label: string }> = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mes" },
  { value: "todos", label: "Todos" },
  { value: "personalizado", label: "Elegir fechas" },
];

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pagado: "Pagado",
  pendiente: "Pendiente",
  parcial: "Pago parcial",
  cotizacion: "Por cotizar",
};

const PAYMENT_TONES: Record<PaymentStatus, BadgeTone> = {
  pagado: "success",
  pendiente: "warning",
  parcial: "info",
  cotizacion: "neutral",
};

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

function isoDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

async function imageToDataUrl(src: string) {
  const response = await fetch(src);
  if (!response.ok) throw new Error("No se pudo cargar el logotipo para el reporte.");
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function getPeriodRange(period: Period, from: string, to: string) {
  const today = new Date();
  if (period === "hoy") return { from: isoDate(today), to: isoDate(today) };
  if (period === "semana") {
    return {
      from: isoDate(startOfWeek(today, { weekStartsOn: 1 })),
      to: isoDate(endOfWeek(today, { weekStartsOn: 1 })),
    };
  }
  if (period === "mes") {
    return { from: isoDate(startOfMonth(today)), to: isoDate(endOfMonth(today)) };
  }
  if (period === "personalizado") return { from, to };
  return { from: "", to: "" };
}

function periodDescription(period: Period, from: string, to: string) {
  const range = getPeriodRange(period, from, to);
  if (!range.from && !range.to) return "Histórico completo";
  if (range.from === range.to && range.from) return formatDate(range.from, "dd MMMM yyyy");
  if (range.from && range.to) {
    return `${formatDate(range.from, "dd MMM yyyy")} al ${formatDate(range.to, "dd MMM yyyy")}`;
  }
  return "Rango seleccionado";
}

function filterTrips(trips: Trip[], period: Period, from: string, to: string) {
  const range = getPeriodRange(period, from, to);
  return trips
    .filter((trip) => trip.bookingSource === "web")
    .filter((trip) => (!range.from || trip.date >= range.from) && (!range.to || trip.date <= range.to))
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
}

export function ServicesSummary() {
  const hydrated = useHydrated();
  const trips = useDemoStore((state) => state.trips);
  const [period, setPeriod] = React.useState<Period>("todos");
  const [from, setFrom] = React.useState(isoDate(startOfMonth(new Date())));
  const [to, setTo] = React.useState(isoDate(new Date()));
  const [isCreatingPdf, setIsCreatingPdf] = React.useState(false);

  const visibleTrips = React.useMemo(
    () => (hydrated ? filterTrips(trips, period, from, to) : []),
    [hydrated, trips, period, from, to],
  );

  const confirmedIncome = visibleTrips
    .filter((trip) => trip.paymentStatus === "pagado" && trip.status !== "cancelado")
    .reduce((total, trip) => total + trip.amount, 0);
  const pendingIncome = visibleTrips
    .filter((trip) => (trip.paymentStatus === "pendiente" || trip.paymentStatus === "parcial") && trip.status !== "cancelado")
    .reduce((total, trip) => total + trip.amount, 0);
  const plannedKm = visibleTrips
    .filter((trip) => trip.status !== "cancelado")
    .reduce((total, trip) => total + trip.plannedKm, 0);
  const currentPeriod = periodDescription(period, from, to);

  const downloadPdf = async () => {
    if (!visibleTrips.length) return;
    setIsCreatingPdf(true);
    try {
      const [{ jsPDF }, { default: autoTable }, logoData] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
        imageToDataUrl("/images/logos/logo_anterior_color.png"),
      ]);
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(157, 197, 45);
      doc.rect(0, 0, pageWidth * 0.55, 3, "F");
      doc.setFillColor(148, 217, 217);
      doc.rect(pageWidth * 0.55, 0, pageWidth * 0.27, 3, "F");
      doc.setFillColor(234, 163, 61);
      doc.rect(pageWidth * 0.82, 0, pageWidth * 0.18, 3, "F");
      doc.addImage(logoData, "PNG", 14, 6, 23, 19);
      doc.setTextColor(20, 49, 41);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Reporte de servicios", 43, 14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(85, 119, 110);
      doc.text(`Periodo: ${currentPeriod}`, 43, 21);
      doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth - 14, 18, { align: "right" });
      doc.setDrawColor(220, 231, 228);
      doc.line(14, 30, pageWidth - 14, 30);

      const summary = [
        ["Servicios", String(visibleTrips.length)],
        ["Ingreso confirmado", `${money.format(confirmedIncome)} MXN`],
        ["Por cobrar", `${money.format(pendingIncome)} MXN`],
        ["Km programados", `${plannedKm.toFixed(1)} km`],
      ];
      const boxWidth = (pageWidth - 28 - 12) / 4;
      const summaryColors = [
        [235, 247, 247],
        [244, 249, 230],
        [255, 246, 232],
        [243, 247, 246],
      ];
      summary.forEach(([label, value], index) => {
        const x = 14 + index * (boxWidth + 4);
        doc.setFillColor(...(summaryColors[index] as [number, number, number]));
        doc.roundedRect(x, 39, boxWidth, 18, 2, 2, "F");
        doc.setTextColor(82, 103, 97);
        doc.setFontSize(7.5);
        doc.text(label.toUpperCase(), x + 4, 46);
        doc.setTextColor(20, 49, 41);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(value, x + 4, 53);
        doc.setFont("helvetica", "normal");
      });

      autoTable(doc, {
        startY: 63,
        margin: { left: 14, right: 14, bottom: 15 },
        head: [["Fecha", "Folio", "Cliente", "Recorrido", "Pasajeros", "Km", "Importe", "Pago"]],
        body: visibleTrips.map((trip) => [
          `${formatDate(trip.date, "dd/MM/yy")} ${trip.time}`,
          trip.folio,
          trip.client,
          `${trip.origin} a ${trip.destination}`,
          String(trip.passengers),
          trip.plannedKm.toFixed(1),
          trip.amount ? money.format(trip.amount) : "Por cotizar",
          PAYMENT_LABELS[trip.paymentStatus ?? "pendiente"],
        ]),
        theme: "plain",
        styles: {
          font: "helvetica",
          fontSize: 8,
          textColor: [32, 53, 47],
          cellPadding: 3,
          lineColor: [220, 231, 228],
          lineWidth: { bottom: 0.2 },
          valign: "middle",
        },
        headStyles: {
          fillColor: [20, 49, 41],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          lineWidth: 0,
        },
        alternateRowStyles: { fillColor: [248, 251, 250] },
        columnStyles: {
          0: { cellWidth: 24 },
          1: { cellWidth: 28 },
          2: { cellWidth: 35 },
          3: { cellWidth: 79 },
          4: { cellWidth: 22, halign: "center" },
          5: { cellWidth: 15, halign: "right" },
          6: { cellWidth: 28, halign: "right" },
          7: { cellWidth: 25 },
        },
        didDrawPage: () => {
          const pageNumber = doc.getNumberOfPages();
          doc.setTextColor(111, 128, 123);
          doc.setFontSize(7.5);
          doc.text("Resumen generado desde las reservaciones web de GreenGo Transfers.", 14, 201);
          doc.text(`Página ${pageNumber}`, pageWidth - 14, 201, { align: "right" });
        },
      });

      const range = getPeriodRange(period, from, to);
      const suffix = range.from && range.to ? `${range.from}_${range.to}` : "historico";
      doc.save(`reporte-servicios-${suffix}.pdf`);
    } finally {
      setIsCreatingPdf(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
      <header className="relative mb-6 overflow-hidden rounded-2xl border border-white/10 bg-foreground px-5 py-5 text-white shadow-card sm:px-6">
        <div className="absolute inset-x-0 top-0 flex h-1" aria-hidden>
          <span className="w-[55%] bg-primary" />
          <span className="w-[27%] bg-info" />
          <span className="flex-1 bg-warning" />
        </div>
        <div className="absolute -right-12 -top-24 h-52 w-52 rounded-full bg-info/5" aria-hidden />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-soft ring-1 ring-black/10 sm:h-[72px] sm:w-[72px]">
            <Image
              src="/images/logos/logo_anterior_color.png"
              alt="GreenGo Transfers"
              width={551}
              height={453}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <span className="hidden h-12 w-px bg-white/10 sm:block" aria-hidden />
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-info sm:text-[11px]">Control de reservaciones</p>
            <h1 className="mt-0.5 truncate text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]">Servicios e ingresos</h1>
            <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] font-semibold text-white/70 ring-1 ring-inset ring-white/10">
              <CalendarDays className="h-3 w-3 shrink-0 text-warning" />
              <span className="truncate">{currentPeriod}</span>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-2 sm:w-auto sm:pl-4">
          <div className="hidden text-right lg:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">Reporte del periodo</p>
            <p className="mt-0.5 text-xs font-medium text-white/70">Tabla y totales incluidos</p>
          </div>
          <Button
            onClick={downloadPdf}
            disabled={!visibleTrips.length || isCreatingPdf}
            className="h-11 w-full rounded-lg bg-primary px-4 font-bold text-primary-foreground shadow-none hover:bg-primary/90 sm:w-auto"
          >
            {isCreatingPdf ? <RefreshCw className="animate-spin" /> : <Download />}
            {isCreatingPdf ? "Preparando PDF" : "Descargar PDF"}
          </Button>
        </div>
        </div>
      </header>

      <section aria-label="Resumen del periodo" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard tone="blue" icon={FileText} label="Servicios" value={String(visibleTrips.length)} detail="Reservaciones web" />
        <SummaryCard tone="lime" icon={CircleDollarSign} label="Ingreso confirmado" value={money.format(confirmedIncome)} detail="Servicios pagados" />
        <SummaryCard tone="orange" icon={CircleDollarSign} label="Por cobrar" value={money.format(pendingIncome)} detail="Pendientes y parciales" />
        <SummaryCard tone="neutral" icon={MapPinned} label="Km programados" value={`${plannedKm.toFixed(1)} km`} detail="Recorrido estimado" />
      </section>

      <section aria-labelledby="period-title" className="mb-6 rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-foreground">
              <CalendarDays className="h-4 w-4" />
              <h2 id="period-title" className="text-sm font-bold">Periodo del reporte</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{currentPeriod}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriod(option.value)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  period === option.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted/50 text-foreground hover:border-info hover:bg-info-soft",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {period === "personalizado" && (
          <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2 sm:max-w-xl">
            <label className="text-xs font-bold text-foreground">
              Desde
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(event) => setFrom(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <label className="text-xs font-bold text-foreground">
              Hasta
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => setTo(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-bold text-foreground">Detalle de servicios</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Ordenados por fecha del servicio</p>
          </div>
          <span className="rounded-full bg-info-soft px-3 py-1.5 text-xs font-bold text-foreground ring-1 ring-info/20">
            {visibleTrips.length} {visibleTrips.length === 1 ? "registro" : "registros"}
          </span>
        </div>

        {!hydrated ? (
          <div className="flex min-h-52 items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" /> Cargando reservaciones
          </div>
        ) : visibleTrips.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center">
            <CalendarDays className="h-8 w-8 text-info" />
            <h3 className="mt-3 font-bold text-foreground">No hay servicios en este periodo</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Prueba otro periodo o elige “Todos” para consultar el histórico.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1020px] text-left text-sm">
                <thead className="bg-foreground text-[11px] uppercase tracking-[0.08em] text-white/75">
                  <tr>
                    <th className="px-5 py-3 font-bold">Fecha / folio</th>
                    <th className="px-4 py-3 font-bold">Cliente</th>
                    <th className="px-4 py-3 font-bold">Recorrido</th>
                    <th className="px-4 py-3 text-center font-bold">Pasajeros</th>
                    <th className="px-4 py-3 text-right font-bold">Km</th>
                    <th className="px-4 py-3 text-right font-bold">Importe</th>
                    <th className="px-5 py-3 font-bold">Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleTrips.map((trip) => <ServiceRow key={trip.id} trip={trip} />)}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border md:hidden">
              {visibleTrips.map((trip) => <ServiceCard key={trip.id} trip={trip} />)}
            </div>
          </>
        )}
      </section>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Se muestran únicamente las reservaciones realizadas desde el sitio web.
      </p>
    </div>
  );
}

function SummaryCard({
  tone,
  icon: Icon,
  label,
  value,
  detail,
}: {
  tone: "lime" | "blue" | "orange" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
}) {
  const toneClasses = {
    lime: "border-primary/60 bg-primary-soft",
    blue: "border-info/40 bg-info-soft",
    orange: "border-warning/40 bg-warning-soft",
    neutral: "border-border bg-white",
  }[tone];
  const iconClasses = {
    lime: "bg-primary text-primary-foreground",
    blue: "bg-info text-info-foreground",
    orange: "bg-warning text-warning-foreground",
    neutral: "bg-muted text-foreground",
  }[tone];
  return (
    <article className={cn("relative overflow-hidden rounded-2xl border p-4 shadow-soft", toneClasses)}>
      <span className={cn("absolute inset-x-0 top-0 h-1", iconClasses)} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconClasses)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}

function ServiceRow({ trip }: { trip: Trip }) {
  const payment = trip.paymentStatus ?? "pendiente";
  return (
    <tr className="align-middle transition-colors hover:bg-info-soft/45">
      <td className="px-5 py-4">
        <p className="font-bold text-foreground">{formatDate(trip.date, "dd MMM yyyy")} · {trip.time}</p>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">{trip.folio}</p>
      </td>
      <td className="px-4 py-4">
        <p className="max-w-44 truncate font-semibold text-foreground">{trip.client}</p>
        <p className="mt-1 text-xs text-muted-foreground">{SERVICE_TYPE_LABELS[trip.serviceType]}</p>
      </td>
      <td className="max-w-[360px] px-4 py-4">
        <RouteLine origin={trip.origin} destination={trip.destination} />
      </td>
      <td className="px-4 py-4 text-center font-semibold text-foreground">{trip.passengers}</td>
      <td className="px-4 py-4 text-right font-semibold text-foreground">{trip.plannedKm.toFixed(1)}</td>
      <td className="px-4 py-4 text-right font-bold text-foreground">{trip.amount ? money.format(trip.amount) : "Por cotizar"}</td>
      <td className="px-5 py-4"><Badge tone={PAYMENT_TONES[payment]} dot>{PAYMENT_LABELS[payment]}</Badge></td>
    </tr>
  );
}

function ServiceCard({ trip }: { trip: Trip }) {
  const payment = trip.paymentStatus ?? "pendiente";
  return (
    <article className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{trip.folio}</p>
          <p className="mt-1 font-bold text-foreground">{trip.client}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(trip.date, "dd MMM yyyy")} · {trip.time}</p>
        </div>
        <Badge tone={PAYMENT_TONES[payment]} dot>{PAYMENT_LABELS[payment]}</Badge>
      </div>
      <div className="mt-4 rounded-xl bg-info-soft p-3 ring-1 ring-info/15">
        <RouteLine origin={trip.origin} destination={trip.destination} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <MiniFact label="Pasajeros" value={String(trip.passengers)} />
        <MiniFact label="Recorrido" value={`${trip.plannedKm.toFixed(1)} km`} />
        <MiniFact label="Importe" value={trip.amount ? money.format(trip.amount) : "Cotizar"} />
      </div>
    </article>
  );
}

function RouteLine({ origin, destination }: { origin: string; destination: string }) {
  return (
    <div className="grid grid-cols-[14px_minmax(0,1fr)] gap-x-2 text-xs">
      <span className="relative row-span-2 mt-1 flex flex-col items-center" aria-hidden>
        <span className="h-2 w-2 rounded-full bg-warning" />
        <span className="h-4 w-px bg-info" />
        <span className="h-2 w-2 rounded-full bg-primary" />
      </span>
      <p className="truncate font-semibold text-muted-foreground" title={origin}>{origin}</p>
      <p className="mt-1 truncate font-semibold text-foreground" title={destination}>{destination}</p>
    </div>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold text-foreground">{value}</p>
    </div>
  );
}
