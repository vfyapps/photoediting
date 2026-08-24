"use client";

import "leaflet/dist/leaflet.css";

import { useMemo, useState } from "react";
import L from "leaflet";
import { AlertTriangle, Camera, Diamond } from "lucide-react";
import { Marker, MapContainer, Polyline, TileLayer, Tooltip } from "react-leaflet";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { haversineDistanceKm } from "@/lib/geo";
import type { PhotographerPoint, ShootCluster } from "@/lib/shoot-map";

// V5 "Studio" (BUILDPLAN-V5 §WP8.1): pin-vorm i.p.v. cirkels, in dezelfde
// tokenkleuren als daarvoor (locatie chart-2, fotograaf chart-7). Leaflet
// heeft geen ingebouwde pin-marker; een inline SVG divIcon is de gangbare
// manier om er een te tekenen zonder een extra icon-library.
function pinIcon(color: string, size: number) {
  return L.divIcon({
    className: "",
    html: `<svg width="${size}" height="${size * 1.3}" viewBox="0 0 24 31" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 19 12 19s12-10 12-19c0-6.6-5.4-12-12-12z"
        fill="${color}" stroke="var(--card, #fff)" stroke-width="1.5" />
      <circle cx="12" cy="12" r="4.5" fill="var(--card, #fff)" />
    </svg>`,
    iconAnchor: [size / 2, size * 1.3],
    iconSize: [size, size * 1.3],
    tooltipAnchor: [0, -size],
  });
}

function diamondIcon(color: string, size: number) {
  return L.divIcon({
    className: "",
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="16" rx="3" fill="${color}" stroke="var(--card, #fff)"
        stroke-width="1.5" transform="rotate(45 12 12)" />
    </svg>`,
    iconAnchor: [size / 2, size / 2],
    iconSize: [size, size],
    tooltipAnchor: [0, -size / 2],
  });
}

const openStatuses = ["Assigned", "Readytoshoot", "Signedup", "Onhold"];
const statusLabels: Record<string, string> = {
  Assigned: "Toegewezen",
  Readytoshoot: "Klaar om te fotograferen",
  Signedup: "Aangemeld",
  Onhold: "On hold",
  Completed: "Afgerond",
  Rejected: "Afgewezen",
};

const COMBINE_RADIUS_KM = 50;
const DEFAULT_CENTER: [number, number] = [48, 8];
const DEFAULT_ZOOM = 5;

type Selection = { type: "photographer"; id: string } | { type: "cluster"; key: string } | null;

export function MapScreen({
  clusters,
  photographers,
  unresolvedCount,
}: {
  clusters: ShootCluster[];
  photographers: PhotographerPoint[];
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

  const nearestLines =
    selectedPhotographer &&
    filteredClusters
      .map((c) => ({
        cluster: c,
        km: haversineDistanceKm(selectedPhotographer, { lat: c.lat, lon: c.lon }),
      }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 5);

  const bounds = useMemo(() => {
    const points: [number, number][] = [
      ...filteredClusters.map((c): [number, number] => [c.lat, c.lon]),
      ...photographers.map((p): [number, number] => [p.lat, p.lon]),
    ];
    return points.length > 0 ? points : null;
  }, [filteredClusters, photographers]);

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
        <div className="relative h-[70vh] min-h-[480px] overflow-hidden rounded-md border border-border bg-secondary">
          <MapContainer
            bounds={bounds ?? undefined}
            boundsOptions={{ padding: [40, 40] }}
            center={bounds ? undefined : DEFAULT_CENTER}
            className="size-full"
            zoom={bounds ? undefined : DEFAULT_ZOOM}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-auteurs'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {selectedPhotographer && nearestLines
              ? nearestLines.map(({ cluster }) => (
                  <Polyline
                    key={cluster.key}
                    pathOptions={{ color: "var(--chart-7)", weight: 1.5, opacity: 0.6 }}
                    positions={[
                      [selectedPhotographer.lat, selectedPhotographer.lon],
                      [cluster.lat, cluster.lon],
                    ]}
                  />
                ))
              : null}

            {filteredClusters.map((cluster) => {
              const isSelected = selectedCluster?.key === cluster.key;
              const size = 24 + 3 * Math.sqrt(cluster.shoots.length);
              // Popover zonder foto (BUILDPLAN-V5 §WP8.1): plaats, aantal
              // shoots en de statusverdeling — dat is de info die een foto
              // hier zou moeten dragen, en dit is beter: direct te lezen.
              const statusCounts = new Map<string, number>();
              cluster.shoots.forEach((shoot) => {
                statusCounts.set(shoot.status, (statusCounts.get(shoot.status) ?? 0) + 1);
              });
              return (
                <Marker
                  eventHandlers={{ click: () => setSelection({ type: "cluster", key: cluster.key }) }}
                  icon={pinIcon("var(--chart-2)", isSelected ? size + 6 : size)}
                  key={cluster.key}
                  position={[cluster.lat, cluster.lon]}
                >
                  <Tooltip>
                    <span className="font-semibold">
                      {cluster.land}.{cluster.postcode} ({cluster.placeName})
                    </span>
                    <br />
                    {cluster.shoots.length} shoot(s):{" "}
                    {[...statusCounts.entries()].map(([status, count]) => `${count}× ${statusLabels[status] ?? status}`).join(", ")}
                  </Tooltip>
                </Marker>
              );
            })}

            {photographers.map((photographer) => {
              const isSelected = selectedPhotographer?.id === photographer.id;
              return (
                <Marker
                  eventHandlers={{ click: () => setSelection({ type: "photographer", id: photographer.id }) }}
                  icon={diamondIcon("var(--chart-7)", isSelected ? 22 : 16)}
                  key={photographer.id}
                  position={[photographer.lat, photographer.lon]}
                >
                  <Tooltip>{photographer.name}</Tooltip>
                </Marker>
              );
            })}
          </MapContainer>

          <div className="pointer-events-none absolute bottom-2 left-2 z-[1000] flex w-fit gap-3 rounded-md border border-border bg-card/90 px-2.5 py-1.5 text-[11px] text-muted-foreground shadow-sm">
            <span className="flex items-center gap-1">
              <Camera className="size-3 text-chart-2" /> Locatie
            </span>
            <span className="flex items-center gap-1">
              <Diamond className="size-3 text-chart-7" /> Fotograaf
            </span>
          </div>
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
              <Camera className="size-3.5 text-chart-2" /> {filteredClusters.length} locatie(s), {totalShoots} shoots
            </span>
            <span className="flex items-center gap-1">
              <Diamond className="size-3.5 text-chart-7" /> {photographers.length} fotografen
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
              Klik op een fotograaf (paarse stip) om zijn openstaande shoots op afstand gesorteerd te zien, of op een
              locatie (oranje stip) om te zien wat er in de buurt ligt.
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
