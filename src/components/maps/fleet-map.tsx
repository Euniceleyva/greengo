"use client";

// Mapa de flota con Leaflet + OpenStreetMap (sin credenciales).
// Usa divIcons de color para evitar depender de imágenes de marcador.
// TODO(prod): en producción podría usarse Google Maps Platform y datos GPS reales.
import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLng } from "@/types";
import { CANCUN_CENTER } from "@/constants";
import { cn } from "@/lib/utils";

export interface MapMarker {
  id: string;
  position: LatLng;
  color: string;
  title: string;
  popup?: React.ReactNode;
}

export interface MapRoute {
  points: LatLng[];
  color: string;
  dashed?: boolean;
}

interface FleetMapProps {
  markers?: MapMarker[];
  routes?: MapRoute[];
  center?: LatLng;
  zoom?: number;
  className?: string;
  selectedId?: string | null;
}

function coloredIcon(color: string, active: boolean) {
  const size = active ? 20 : 16;
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 0 0 1px rgba(0,0,0,.25),0 1px 3px rgba(0,0,0,.4)"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function Recenter({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Corrige el tamaño del mapa cuando se monta dentro de contenedores flex/grid
// (Leaflet necesita recalcular la cuadrícula tras el primer layout).
function InvalidateOnMount() {
  const map = useMap();
  React.useEffect(() => {
    const fix = () => map.invalidateSize();
    const t1 = setTimeout(fix, 0);
    const t2 = setTimeout(fix, 250);
    window.addEventListener("resize", fix);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", fix);
    };
  }, [map]);
  return null;
}

export default function FleetMap({
  markers = [],
  routes = [],
  center = CANCUN_CENTER,
  zoom = 11,
  className,
  selectedId = null,
}: FleetMapProps) {
  return (
    <div className={cn("h-full w-full", className)}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full rounded-lg"
      >
        <InvalidateOnMount />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routes.map((r, i) => (
          <Polyline
            key={i}
            positions={r.points}
            pathOptions={{
              color: r.color,
              weight: 4,
              opacity: 0.8,
              dashArray: r.dashed ? "8 8" : undefined,
            }}
          />
        ))}
        {markers.map((m) => (
          <Marker key={m.id} position={m.position} icon={coloredIcon(m.color, m.id === selectedId)}>
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}
        {selectedId && <Recenter center={center} zoom={zoom} />}
      </MapContainer>
    </div>
  );
}
