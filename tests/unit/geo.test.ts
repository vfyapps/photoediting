import { describe, expect, it } from "vitest";

import { haversineDistanceKm } from "@/lib/geo";

describe("haversineDistanceKm", () => {
  it("geeft 0 voor hetzelfde punt", () => {
    expect(haversineDistanceKm({ lat: 47.6, lon: 12.7 }, { lat: 47.6, lon: 12.7 })).toBe(0);
  });

  it("klopt bij benadering voor Amsterdam - Wenen (~960 km hemelsbreed)", () => {
    const amsterdam = { lat: 52.3676, lon: 4.9041 };
    const wenen = { lat: 48.2082, lon: 16.3738 };
    const km = haversineDistanceKm(amsterdam, wenen);
    expect(km).toBeGreaterThan(900);
    expect(km).toBeLessThan(1020);
  });

  it("klopt bij benadering voor twee dicht bij elkaar liggende postcodes (~38 km)", () => {
    // AT.5090 (Au) en AT.5453 (Werfen), reëel voorbeeld uit de Ares-data.
    const au = { lat: 47.596, lon: 12.705 };
    const werfen = { lat: 47.478, lon: 13.183 };
    const km = haversineDistanceKm(au, werfen);
    expect(km).toBeGreaterThan(30);
    expect(km).toBeLessThan(45);
  });

  it("is symmetrisch", () => {
    const a = { lat: 51.2, lon: 5.1 };
    const b = { lat: 43.6, lon: 7.0 };
    expect(haversineDistanceKm(a, b)).toBeCloseTo(haversineDistanceKm(b, a), 6);
  });
});
