"use client";

// Wrapper que carga el mapa solo en cliente (Leaflet usa window).
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { Skeleton } from "@/components/ui/misc";
import type { MapMarker, MapRoute } from "./fleet-map";
import type { LatLng } from "@/types";

const FleetMap = dynamic(() => import("./fleet-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-lg" />,
});

export type { MapMarker, MapRoute };

export function MapView(props: {
  markers?: MapMarker[];
  routes?: MapRoute[];
  center?: LatLng;
  zoom?: number;
  className?: string;
  selectedId?: string | null;
}) {
  return <FleetMap {...props} />;
}
