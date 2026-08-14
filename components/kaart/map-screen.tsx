"use client";

import { useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { AlertTriangle, Camera, Diamond } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { haversineDistanceKm } from "@/lib/geo";
import type { PhotographerPoint, ShootCluster } from "@/lib/shoot-map";
import { cn } from "@/lib/utils";

const openStatuses = ["Assigned", "Readytoshoot", "Signedup", "Onhold"];
const statusLabels: Record<string, string> = {
  Assigned: "Toegewezen",
  Readytoshoot: "Klaar om te fotograferen",
  Signedup: "Aangemeld",
  Onhold: "On hold",
  Completed: "Afgerond",
  Rejected: "Afgewezen",
};

const WIDTH = 900;
const HEIGHT = 680;
const RING_DISTANCES_KM = [25, 50, 100];
const COMBINE_RADIUS_KM = 50;

type Selection = { type: "photographer"; id: string } | { type: "cluster"; key: string } | null;

export function MapScreen({
  clusters,
  photographers,
  countries,
  unresolvedCount,
}: {
  clusters: ShootCluster[];
  photographers: PhotographerPoint[];
  countries: GeoJSON.FeatureCollection;
  unresolvedCount: number;
}) {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set(openStatuses));
  const [landFilter, setLandFilter] = useState("");
  const [selection, setSelection] = useState<Selection>(null);

  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    for (const c of clusters) for (const s of c.shoots) set.add(s.status);
    return [...set].sort((a, b) => (openStatuses.includes(b) ? 1 : 0) - (openStatuses.includes(a) ? 1 : 0));
  }, [clusters]);

  const availableLands = useMemo(() => [...new Set(clusters.map((c) => c.land))].sort(), [clusters]);

  const filteredClusters = useMemo(() => {
    return clusters
      .map((cluster) => ({
        ...cluster,
        shoots: cluster.shoots.filter((s) => statusFilter.has(s.status)),
      }))
      .filter((c) => c.shoots.length > 0 && (!landFilter || c.land === landFilter));
  }, [clusters, statusFilter, landFilter]);

  const { projection, pathGenerator } = useMemo(() => {
    const points = [
      ...filteredClusters.map((c) => ({ lat: c.lat, lon: c.lon })),
      ...photographers.map((p) => ({ lat: p.lat, lon: p.lon })),
    ];
    const bbox = computeBoundingBox(points);
    const proj = geoMercator().fitSize([WIDTH, HEIGHT], boundingBoxPolygon(bbox));
    return { projection: proj, pathGenerator: geoPath(proj) };
  }, [filteredClusters, photographers]);

  function toggleStatus(status: string) {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  const selectedPhotographer =
    selection?.type === "photographer" ? photographers.find((p) => p.id === selection.id) ?? null : null;
  const selectedCluster =
    selection?.type === "cluster" ? filteredClusters.find((c) => c.key === selection.key) ?? null : null;

  const totalShoots = filteredClusters.reduce((sum, c) => sum + c.shoots.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Openstaande shoots en fotografen, hemelsbreed. Voor het plannen van wie wat kan combineren — toewijzen zelf blijft in Ares."
        eyebrow="Planning"
        title="Kaart"
      />

      {unresolvedCount > 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <AlertTriangle className="size-3.5 shrink-0 text-warning" />
          {unresolvedCount} shoot(s) hebben een postcode die niet gegeocodeerd kon worden en staan niet op de kaart —
          zie Beheer &gt; Ares-import.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <svg className="min-w-[600px]" role="img" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            <title>Kaart met openstaande shoots en fotografen in West- en Midden-Europa</title>
            <g>
              {countries.features.map((feature) => (
                <path
                  className="fill-secondary stroke-border"
                  d={pathGenerator(feature) ?? undefined}
                  key={String(feature.properties?.land)}
                  strokeWidth={1}
                />
              ))}
            </g>

            {selectedPhotographer ? (
              <g className="pointer-events-none">
                {RING_DISTANCES_KM.map((km) => (
                  <circle
                    className="fill-none stroke-muted-foreground/30"
                    cx={projection([selectedPhotographer.lon, selectedPhotographer.lat])?.[0]}
                    cy={projection([selectedPhotographer.lon, selectedPhotographer.lat])?.[1]}
                    key={km}
                    r={kmToPixelRadius(km, selectedPhotographer.lat, projection)}
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                ))}
                {filteredClusters
                  .map((c) => ({
                    cluster: c,
                    km: haversineDistanceKm(selectedPhotographer, { lat: c.lat, lon: c.lon }),
                  }))
                  .sort((a, b) => a.km - b.km)
                  .slice(0, 5)
                  .map(({ cluster }) => {
                    const from = projection([selectedPhotographer.lon, selectedPhotographer.lat]);
                    const to = projection([cluster.lon, cluster.lat]);
                    if (!from || !to) return null;
                    return (
                      <line
                        className="stroke-chart-2/60"
                        key={cluster.key}
                        strokeWidth={1}
                        x1={from[0]}
                        x2={to[0]}
                        y1={from[1]}
                        y2={to[1]}
                      />
                    );
                  })}
              </g>
            ) : null}

            {filteredClusters.map((cluster) => {
              const point = projection([cluster.lon, cluster.lat]);
              if (!point) return null;
              const radius = 4 + 3 * Math.sqrt(cluster.shoots.length);
              const isSelected = selectedCluster?.key === cluster.key;
              return (
                <circle
                  className={cn(
                    "cursor-pointer fill-chart-1 stroke-card transition-opacity",
                    isSelected ? "opacity-100" : "opacity-75 hover:opacity-100",
                  )}
                  cx={point[0]}
                  cy={point[1]}
                  key={cluster.key}
                  onClick={() => setSelection({ type: "cluster", key: cluster.key })}
                  r={radius}
                  strokeWidth={isSelected ? 2 : 1}
                >
                  <title>
                    {cluster.land}.{cluster.postcode} ({cluster.placeName}) — {cluster.shoots.length} shoot(s)
                  </title>
                </circle>
              );
            })}

            {photographers.map((photographer) => {
              const point = projection([photographer.lon, photographer.lat]);
              if (!point) return null;
              const isSelected = selectedPhotographer?.id === photographer.id;
              const size = 9;
              return (
                <g
                  className="cursor-pointer"
                  key={photographer.id}
                  onClick={() => setSelection({ type: "photographer", id: photographer.id })}
                  transform={`translate(${point[0]}, ${point[1]}) rotate(45)`}
                >
                  <rect
                    className={cn(
                      "fill-chart-2 stroke-card transition-opacity",
                      isSelected ? "opacity-100" : "opacity-85 hover:opacity-100",
                    )}
                    height={size}
                    strokeWidth={isSelected ? 2 : 1}
                    width={size}
                    x={-size / 2}
                    y={-size / 2}
                  >
                    <title>{photographer.name}</title>
                  </rect>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-col gap-4">
          <FilterPanel
            availableLands={availableLands}
            availableStatuses={availableStatuses}
            landFilter={landFilter}
            onLandChange={setLandFilter}
            onToggleStatus={toggleStatus}
            statusFilter={statusFilter}
          />

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Camera className="size-3.5 text-chart-1" /> {filteredClusters.length} locatie(s), {totalShoots} shoots
            </span>
            <span className="flex items-center gap-1">
              <Diamond className="size-3.5 text-chart-2" /> {photographers.length} fotografen
            </span>
          </div>

          {selectedPhotographer ? (
            <PhotographerDetail
              clusters={filteredClusters}
              onClose={() => setSelection(null)}
              photographer={selectedPhotographer}
            />
          ) : selectedCluster ? (
            <ClusterDetail
              cluster={selectedCluster}
              onClose={() => setSelection(null)}
              onSelectCluster={(key) => setSelection({ type: "cluster", key })}
              onSelectPhotographer={(id) => setSelection({ type: "photographer", id })}
              otherClusters={filteredClusters}
              photographers={photographers}
            />
          ) : (
            <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
              Klik op een fotograaf (ruit) om zijn openstaande shoots op afstand gesorteerd te zien, of op een locatie
              (cirkel) om te zien wat er in de buurt ligt.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPanel({
  availableStatuses,
  statusFilter,
  onToggleStatus,
  availableLands,
  landFilter,
  onLandChange,
}: {
  availableStatuses: string[];
  statusFilter: Set<string>;
  onToggleStatus: (status: string) => void;
  availableLands: string[];
  landFilter: string;
  onLandChange: (land: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-3">
      <div>
        <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</h2>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {availableStatuses.map((status) => (
            <label className="flex items-center gap-1.5 text-xs" key={status}>
              <input
                checked={statusFilter.has(status)}
                className="size-3.5 accent-primary"
                onChange={() => onToggleStatus(status)}
                type="checkbox"
              />
              {statusLabels[status] ?? status}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Land</h2>
        <select
          className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/25"
          onChange={(event) => onLandChange(event.target.value)}
          value={landFilter}
        >
          <option value="">Alle landen</option>
          {availableLands.map((land) => (
            <option key={land} value={land}>
              {land}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function PhotographerDetail({
  photographer,
  clusters,
  onClose,
}: {
  photographer: PhotographerPoint;
  clusters: ShootCluster[];
  onClose: () => void;
}) {
  const sorted = useMemo(
    () =>
      clusters
        .map((c) => ({ cluster: c, km: haversineDistanceKm(photographer, { lat: c.lat, lon: c.lon }) }))
        .sort((a, b) => a.km - b.km),
    [clusters, photographer],
  );

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{photographer.name}</h2>
        <button className="text-xs text-muted-foreground hover:text-foreground" onClick={onClose} type="button">
          Sluiten
        </button>
      </div>
      <p className="text-xs text-muted-foreground">Shoots gesorteerd op hemelsbrede afstand.</p>
      <ul className="flex max-h-96 flex-col divide-y divide-border overflow-y-auto text-xs">
        {sorted.map(({ cluster, km }) => (
          <li className="flex items-center justify-between gap-2 py-1.5" key={cluster.key}>
            <span>
              <span className="font-mono font-semibold">
                {cluster.land}.{cluster.postcode}
              </span>{" "}
              <span className="text-muted-foreground">
                · {cluster.placeName} · {cluster.shoots.length} shoot(s)
              </span>
            </span>
            <span className="shrink-0 font-mono text-muted-foreground">{km.toFixed(0)} km</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClusterDetail({
  cluster,
  otherClusters,
  photographers,
  onClose,
  onSelectCluster,
  onSelectPhotographer,
}: {
  cluster: ShootCluster;
  otherClusters: ShootCluster[];
  photographers: PhotographerPoint[];
  onClose: () => void;
  onSelectCluster: (key: string) => void;
  onSelectPhotographer: (id: string) => void;
}) {
  const nearby = useMemo(
    () =>
      otherClusters
        .filter((c) => c.key !== cluster.key)
        .map((c) => ({ cluster: c, km: haversineDistanceKm(cluster, { lat: c.lat, lon: c.lon }) }))
        .filter((c) => c.km <= COMBINE_RADIUS_KM)
        .sort((a, b) => a.km - b.km),
    [otherClusters, cluster],
  );

  const closestPhotographer = useMemo(() => {
    if (photographers.length === 0) return null;
    return photographers
      .map((p) => ({ photographer: p, km: haversineDistanceKm(cluster, { lat: p.lat, lon: p.lon }) }))
      .sort((a, b) => a.km - b.km)[0];
  }, [photographers, cluster]);

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-sm font-semibold">
          {cluster.land}.{cluster.postcode}
        </h2>
        <button className="text-xs text-muted-foreground hover:text-foreground" onClick={onClose} type="button">
          Sluiten
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{cluster.placeName}</p>

      <ul className="flex flex-col gap-1 text-xs">
        {cluster.shoots.map((shoot) => (
          <li className="flex items-center justify-between gap-2" key={shoot.accoId}>
            <span className="font-mono">{shoot.accoId}</span>
            <Badge status="neutral">{statusLabels[shoot.status] ?? shoot.status}</Badge>
          </li>
        ))}
      </ul>

      {closestPhotographer ? (
        <button
          className="rounded-md border border-border px-2 py-1.5 text-left text-xs hover:bg-secondary"
          onClick={() => onSelectPhotographer(closestPhotographer.photographer.id)}
          type="button"
        >
          Dichtstbijzijnde fotograaf: <span className="font-medium">{closestPhotographer.photographer.name}</span> ·{" "}
          {closestPhotographer.km.toFixed(0)} km
        </button>
      ) : null}

      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Binnen {COMBINE_RADIUS_KM} km ({nearby.length})
        </h3>
        {nearby.length === 0 ? (
          <p className="text-xs text-muted-foreground">Geen andere locaties binnen combineerafstand.</p>
        ) : (
          <ul className="flex max-h-64 flex-col divide-y divide-border overflow-y-auto text-xs">
            {nearby.map(({ cluster: c, km }) => (
              <li key={c.key}>
                <button
                  className="flex w-full items-center justify-between gap-2 py-1.5 text-left hover:text-foreground"
                  onClick={() => onSelectCluster(c.key)}
                  type="button"
                >
                  <span>
                    <span className="font-mono font-semibold">
                      {c.land}.{c.postcode}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      · {c.placeName} · {c.shoots.length} shoot(s)
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-muted-foreground">{km.toFixed(0)} km</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function computeBoundingBox(points: { lat: number; lon: number }[]) {
  if (points.length === 0) return { minLat: 42, maxLat: 54, minLon: -2, maxLon: 15 };
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;
  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLon = Math.min(minLon, p.lon);
    maxLon = Math.max(maxLon, p.lon);
  }
  return { minLat, maxLat, minLon, maxLon };
}

function boundingBoxPolygon({
  minLat,
  maxLat,
  minLon,
  maxLon,
}: {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}): GeoJSON.Polygon {
  const padLat = (maxLat - minLat) * 0.12 || 1;
  const padLon = (maxLon - minLon) * 0.12 || 1;
  return {
    type: "Polygon",
    coordinates: [
      [
        [minLon - padLon, minLat - padLat],
        [maxLon + padLon, minLat - padLat],
        [maxLon + padLon, maxLat + padLat],
        [minLon - padLon, maxLat + padLat],
        [minLon - padLon, minLat - padLat],
      ],
    ],
  };
}

/** Zet een afstand in km om naar een pixelradius op de huidige projectie, gemeten vanaf de breedtegraad van het middelpunt (1° breedtegraad ≈ 111 km, ongeacht lengtegraad). */
function kmToPixelRadius(
  km: number,
  atLat: number,
  projection: ReturnType<typeof geoMercator>,
): number {
  const centerLon = 0;
  const p1 = projection([centerLon, atLat]);
  const p2 = projection([centerLon, atLat + km / 111]);
  if (!p1 || !p2) return 0;
  return Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
}
