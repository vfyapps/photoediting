/**
 * Hemelsbrede afstand (haversine), niet over de weg (BUILDPLAN-V3.md
 * V3-WP6, "Eén eerlijke beperking"): voor de shootplanner-kaart is dat
 * voldoende om te zien welke shoots te combineren zijn, maar in bergachtig
 * gebied kan de werkelijke reistijd flink afwijken. Overal waar dit getal
 * aan een gebruiker wordt getoond, hoort "hemelsbreed" erbij.
 */

const EARTH_RADIUS_KM = 6371;

export type LatLon = { lat: number; lon: number };

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceKm(a: LatLon, b: LatLon): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}
