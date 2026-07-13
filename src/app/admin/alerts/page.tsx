"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check, Car, Route as RouteIcon, MessageSquarePlus } from "lucide-react";
import { useDemoStore } from "@/stores/demo-store";
import { useHydrated } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Textarea, Label } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/misc";
import { EmptyState } from "@/components/shared/states";
import { AlertPriorityBadge } from "@/components/shared/badges";
import { Badge } from "@/components/ui/badge";
import { ALERT_TYPE_LABELS, ALERT_PRIORITY_LABELS } from "@/constants";
import type { Alert, AlertPriority } from "@/types";
import { timeAgo } from "@/lib/format";
import { toast } from "@/components/ui/toast";

type Tab = "pendiente" | "revisada" | "todas";

export default function AlertsPage() {
  const hydrated = useHydrated();
  const { alerts, vehicles, markAlertReviewed, setAlertPriority, addAlertNote } = useDemoStore();
  const [tab, setTab] = useState<Tab>("pendiente");
  const [noteFor, setNoteFor] = useState<Alert | null>(null);
  const [noteText, setNoteText] = useState("");

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const vehicleCode = (id: string | null) => vehicles.find((v) => v.id === id)?.code;
  const filtered = alerts.filter((a) => (tab === "todas" ? true : a.status === tab));
  const pendingCount = alerts.filter((a) => a.status === "pendiente").length;

  const saveNote = () => {
    if (noteFor) {
      addAlertNote(noteFor.id, noteText);
      toast.success("Nota agregada a la alerta.");
      setNoteFor(null);
      setNoteText("");
    }
  };

  return (
    <div>
      <PageHeader
        title="Alertas"
        description="Eventos operativos detectados. Revisa, prioriza y documenta."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Alertas" }]}
      />

      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-1">
        {(["pendiente", "revisada", "todas"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {t === "pendiente" ? `Pendientes (${pendingCount})` : t === "revisada" ? "Revisadas" : "Todas"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title="Sin alertas" description="No hay alertas en esta vista." />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{ALERT_TYPE_LABELS[a.type]}</span>
                      <AlertPriorityBadge priority={a.priority} />
                      {a.status === "revisada" && <Badge tone="success">Revisada</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{timeAgo(a.createdAt)}</span>
                      {a.vehicleId && (
                        <Link href={`/admin/vehicles/${a.vehicleId}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                          <Car className="h-3 w-3" /> {vehicleCode(a.vehicleId)}
                        </Link>
                      )}
                      {a.tripId && (
                        <Link href={`/admin/trips/${a.tripId}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                          <RouteIcon className="h-3 w-3" /> Ver viaje
                        </Link>
                      )}
                    </div>
                    {a.note && (
                      <p className="mt-2 rounded-md bg-secondary p-2 text-xs text-muted-foreground">
                        Nota: {a.note}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Select
                      value={a.priority}
                      onChange={(e) => {
                        setAlertPriority(a.id, e.target.value as AlertPriority);
                        toast.info(`Prioridad: ${ALERT_PRIORITY_LABELS[e.target.value as AlertPriority]}`);
                      }}
                      className="h-8 w-28 text-xs"
                      aria-label="Prioridad"
                    >
                      {(Object.keys(ALERT_PRIORITY_LABELS) as AlertPriority[]).map((p) => (
                        <option key={p} value={p}>{ALERT_PRIORITY_LABELS[p]}</option>
                      ))}
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => { setNoteFor(a); setNoteText(a.note ?? ""); }}>
                      <MessageSquarePlus /> Nota
                    </Button>
                    {a.status === "pendiente" && (
                      <Button size="sm" onClick={() => { markAlertReviewed(a.id); toast.success("Alerta marcada como revisada."); }}>
                        <Check /> Revisar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!noteFor} onClose={() => setNoteFor(null)} title="Agregar nota a la alerta">
        <div className="space-y-3">
          <Label>Nota de seguimiento</Label>
          <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Describe la revisión o el hallazgo…" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNoteFor(null)}>Cancelar</Button>
            <Button onClick={saveNote}>Guardar nota</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
