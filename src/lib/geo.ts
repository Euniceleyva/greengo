import type { LatLng } from "@/types";

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Distancia Haversine en km entre dos coordenadas. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Longitud total (km) de una polilínea. */
export function routeLengthKm(route: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversineKm(route[i - 1], route[i]);
  }
  return total;
}

/** Interpola una ruta para obtener puntos intermedios (simulación de avance). */
export function interpolateRoute(route: LatLng[], steps: number): LatLng[] {
  if (route.length < 2) return route;
  const points: LatLng[] = [];
  for (let i = 1; i < route.length; i++) {
    const [lat1, lng1] = route[i - 1];
    const [lat2, lng2] = route[i];
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      points.push([lat1 + (lat2 - lat1) * t, lng1 + (lng2 - lng1) * t]);
    }
  }
  points.push(route[route.length - 1]);
  return points;
}
