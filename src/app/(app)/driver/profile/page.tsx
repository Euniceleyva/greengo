"use client";

import { Star, Phone, Car, Route as RouteIcon, AlertTriangle, ShieldAlert, IdCard, FileText, Upload, Trash2, CheckCircle2 } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { useActiveDriverId } from "@/lib/use-active-driver";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { Avatar } from "@/components/shared/avatar";
import { DriverStatusBadge } from "@/components/shared/badges";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { vehicleLabel } from "@/lib/lookups";
import { toast } from "@/components/ui/toast";
import { DriverLicenseNotice } from "@/components/driver/license-notice";
import { driverDocumentLabel } from "@/lib/driver-compliance";
import type { DriverDocumentFile, DriverDocumentKind } from "@/types";

export default function DriverProfilePage() {
  const hydrated = useHydrated();
  const driverId = useActiveDriverId();
  const { drivers, vehicles, driverDocuments, upsertDriverDocument, deleteDriverDocument } = useDemoStore();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const driver = drivers.find((d) => d.id === driverId);
  if (!driver) return null;
  const vehicle = vehicles.find((item) => item.id === driver.assignedVehicleId);
  const documents = driverDocuments ?? [];
  const licenseDocument = documents.find((document) => document.driverId === driver.id && document.kind === "licencia_digital");
  const circulationDocument = documents.find((document) => document.driverId === driver.id && document.kind === "tarjeta_circulacion");

  const handlePdfUpload = (kind: DriverDocumentKind, file: File | undefined) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.warning("Solo puedes subir archivos PDF.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.warning("El PDF no debe superar 8 MB en este DEMO.");
      return;
    }
    upsertDriverDocument({
      driverId: driver.id,
      vehicleId: driver.assignedVehicleId,
      kind,
      fileName: file.name,
      fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
      mimeType: "application/pdf",
      expiresOn: kind === "licencia_digital" ? driver.licenseExpiresOn : vehicle?.documents.find((doc) => doc.name.toLowerCase().includes("circulación"))?.expiresOn,
    });
    toast.success(`${driverDocumentLabel(kind)} guardada en el DEMO.`);
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Avatar name={driver.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">{driver.name}</h1>
            <p className="text-sm text-muted-foreground">{driver.phone}</p>
            <div className="mt-1.5">
              <DriverStatusBadge status={driver.status} />
            </div>
          </div>
        </CardContent>
      </Card>

      <DriverLicenseNotice driver={driver} compact action={false} />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Documentos rápidos</h2>
          <span className="text-[11px] font-medium text-muted-foreground">
            {[licenseDocument, circulationDocument].filter(Boolean).length}/2 cargados
          </span>
        </div>
        <div className="space-y-3">
          <DocumentUploadCard
            title="Licencia digital"
            description="PDF de tu licencia vigente"
            document={licenseDocument}
            expiresOn={driver.licenseExpiresOn}
            onUpload={(file) => handlePdfUpload("licencia_digital", file)}
            onDelete={() => {
              deleteDriverDocument(driver.id, "licencia_digital");
              toast.success("Licencia digital eliminada del DEMO.");
            }}
          />
          <DocumentUploadCard
            title="Tarjeta de circulación"
            description={vehicle ? `${vehicle.code} · ${vehicle.plates}` : "Sin unidad asignada"}
            document={circulationDocument}
            expiresOn={vehicle?.documents.find((doc) => doc.name.toLowerCase().includes("circulación"))?.expiresOn}
            disabled={!vehicle}
            onUpload={(file) => handlePdfUpload("tarjeta_circulacion", file)}
            onDelete={() => {
              deleteDriverDocument(driver.id, "tarjeta_circulacion");
              toast.success("Tarjeta de circulación eliminada del DEMO.");
            }}
          />
        </div>
      </div>

      <details className="group rounded-lg border border-border bg-card">
        <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold">
          Datos básicos
          <span className="text-xs text-muted-foreground group-open:hidden">Ver</span>
          <span className="hidden text-xs text-muted-foreground group-open:inline">Ocultar</span>
        </summary>
        <div className="space-y-2 border-t border-border px-4 py-3 text-sm">
          <Row icon={IdCard} label="Licencia" value={driver.licenseNumber} />
          <Row label="Vigencia" value={formatDate(driver.licenseExpiresOn, "dd MMM yyyy")} />
          <Row icon={Car} label="Unidad" value={vehicleLabel(vehicles, driver.assignedVehicleId)} />
          <Row icon={ShieldAlert} label="Emergencia" value={driver.emergencyContact} />
          <Row icon={Phone} label="Tel. emergencia" value={driver.emergencyPhone} />
        </div>
      </details>

      <details className="group rounded-lg border border-border bg-card">
        <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold">
          Desempeño
          <span className="text-xs text-muted-foreground group-open:hidden">Ver</span>
          <span className="hidden text-xs text-muted-foreground group-open:inline">Ocultar</span>
        </summary>
        <div className="grid grid-cols-2 gap-2 border-t border-border p-3">
          <Metric icon={RouteIcon} label="Viajes" value={String(driver.completedTrips)} />
          <Metric icon={Star} label="Calificación" value={String(driver.rating)} />
          <Metric icon={RouteIcon} label="Km" value={formatNumber(driver.drivenKm)} />
          <Metric icon={AlertTriangle} label="Incidencias" value={String(driver.incidents)} />
        </div>
      </details>

      <p className="px-2 text-center text-xs text-muted-foreground">
        Perfil simulado del DEMO. Los datos no corresponden a una persona real.
      </p>
    </div>
  );
}

function DocumentUploadCard({
  title,
  description,
  document,
  expiresOn,
  disabled = false,
  onUpload,
  onDelete,
}: {
  title: string;
  description: string;
  document?: DriverDocumentFile;
  expiresOn?: string;
  disabled?: boolean;
  onUpload: (file: File | undefined) => void;
  onDelete: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <span className={document ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success" : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info-soft text-info"}>
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold">{title}</p>
                  {document && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
                </div>
                <p className="truncate text-xs text-muted-foreground">{document ? document.fileName : description}</p>
              </div>
              {expiresOn && (
                <span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground">
                  {formatDate(expiresOn, "dd MMM")}
                </span>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {document && (
                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
                  <Trash2 /> Eliminar
                </Button>
              )}
              <label>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  disabled={disabled}
                  onChange={(event) => {
                    onUpload(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
                <span
                  className={[
                    "inline-flex h-9 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                    disabled ? "cursor-not-allowed bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90",
                  ].join(" ")}
                >
                  <Upload className="h-4 w-4" /> {document ? "Reemplazar" : "Subir PDF"}
                </span>
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center p-4 text-center">
        <Icon className="h-5 w-5 text-primary" />
        <p className="mt-1 text-xl font-bold">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
