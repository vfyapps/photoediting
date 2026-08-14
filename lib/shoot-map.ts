import { parseAccoId } from "@/lib/ares-import";
import postcodeCoords from "@/lib/postcode-coords.json";

/**
 * Resolvet acco-id's/fotografen-locaties naar coördinaten via de gecommitte
 * GeoNames-lookup (BUILDPLAN-V3.md V3-WP6.2). Bewust een server-only module:
 * postcode-coords.json is ~1.6 MB en hoort nooit in de client-bundle terecht
 * te komen — alleen page.tsx (server component) importeert dit bestand, de
 * kaart zelf krijgt alleen de opgeloste punten door.
 */

type CoordEntry = [number, number, string];
const coords = postcodeCoords as unknown as Record<string, CoordEntry>;

export function resolveAccoIdLocation(accoId: string): { lat: number; lon: number; placeName: string } | null {
  const parsed = parseAccoId(accoId);
  if (!parsed) return null;
  const entry = coords[`${parsed.land}.${parsed.postcode}`];
  if (!entry) return null;
  return { lat: entry[0], lon: entry[1], placeName: entry[2] };
}

export function resolveLandPostcode(land: string | null, postcode: string | null) {
  if (!land || !postcode) return null;
  const entry = coords[`${land}.${postcode}`];
  if (!entry) return null;
  return { lat: entry[0], lon: entry[1], placeName: entry[2] };
}

export type ShootForMap = {
  accoId: string;
  status: string;
  photographerAlias: string | null;
  expertAlias: string | null;
};

export type ShootCluster = {
  key: string;
  land: string;
  postcode: string;
  placeName: string;
  lat: number;
  lon: number;
  shoots: ShootForMap[];
};

/** Eén punt per postcode: meerdere shoots in dezelfde postcode delen een marker. */
export function clusterShoots(
  shoots: { acco_id: string; status: string; photographer_alias: string | null; expert_alias: string | null }[],
): ShootCluster[] {
  const byKey = new Map<string, ShootCluster>();

  for (const shoot of shoots) {
    const location = resolveAccoIdLocation(shoot.acco_id);
    if (!location) continue;
    const parsed = parseAccoId(shoot.acco_id);
    if (!parsed) continue;
    const key = `${parsed.land}.${parsed.postcode}`;

    const entry = byKey.get(key);
    const shootEntry: ShootForMap = {
      accoId: shoot.acco_id,
      status: shoot.status,
      photographerAlias: shoot.photographer_alias,
      expertAlias: shoot.expert_alias,
    };
    if (entry) {
      entry.shoots.push(shootEntry);
    } else {
      byKey.set(key, {
        key,
        land: parsed.land,
        postcode: parsed.postcode,
        placeName: location.placeName,
        lat: location.lat,
        lon: location.lon,
        shoots: [shootEntry],
      });
    }
  }

  return [...byKey.values()];
}

export type PhotographerPoint = {
  id: string;
  name: string;
  aresAlias: string | null;
  lat: number;
  lon: number;
  placeName: string;
};

export function resolvePhotographers(
  photographers: { id: string; name: string; ares_alias: string | null; land: string | null; postcode: string | null }[],
): PhotographerPoint[] {
  const result: PhotographerPoint[] = [];
  for (const p of photographers) {
    const location = resolveLandPostcode(p.land, p.postcode);
    if (!location) continue;
    result.push({ id: p.id, name: p.name, aresAlias: p.ares_alias, ...location });
  }
  return result;
}
