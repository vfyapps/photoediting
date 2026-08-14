"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { upsertPhotographer } from "@/app/(app)/beheer/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Photographer = {
  id: string;
  name: string;
  ares_alias: string | null;
  land: string | null;
  postcode: string | null;
  is_active: boolean;
};

export function PhotographersScreen({ photographers }: { photographers: Photographer[] }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Vestigingslocatie (land + postcode) plaatst een fotograaf op de shootplanner-kaart, in dezelfde vorm als een
        acco-id. De Ares-alias is de naam uit de kolom &quot;photographer&quot; in de export — daarmee koppelt de
        kaart open shoots aan wie ze al gepland heeft.
      </p>
      <PhotographersTable photographers={photographers} />
      <NewPhotographerForm />
    </div>
  );
}

function PhotographersTable({ photographers }: { photographers: Photographer[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleActive(photographer: Photographer) {
    startTransition(async () => {
      const result = await upsertPhotographer({
        id: photographer.id,
        name: photographer.name,
        aresAlias: photographer.ares_alias,
        land: photographer.land,
        postcode: photographer.postcode,
        isActive: !photographer.is_active,
      });
      if (result.ok) {
        toast.success(photographer.is_active ? "Fotograaf gedeactiveerd." : "Fotograaf geactiveerd.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  if (photographers.length === 0) return <p className="text-xs text-muted-foreground">Nog geen fotografen.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Naam</TableHead>
          <TableHead>Ares-alias</TableHead>
          <TableHead>Locatie</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {photographers.map((photographer) => (
          <TableRow key={photographer.id}>
            <TableCell className="font-medium">{photographer.name}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {photographer.ares_alias ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {photographer.land && photographer.postcode ? `${photographer.land}.${photographer.postcode}` : "—"}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Badge status={photographer.is_active ? "success" : "critical"}>
                  {photographer.is_active ? "Actief" : "Inactief"}
                </Badge>
                <Button disabled={isPending} onClick={() => toggleActive(photographer)} size="sm" variant="ghost">
                  {photographer.is_active ? "Deactiveren" : "Activeren"}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function NewPhotographerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [aresAlias, setAresAlias] = useState("");
  const [land, setLand] = useState("");
  const [postcode, setPostcode] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await upsertPhotographer({
        id: null,
        name,
        aresAlias: aresAlias || null,
        land: land || null,
        postcode: postcode || null,
        isActive: true,
      });
      if (result.ok) {
        toast.success("Fotograaf toegevoegd.");
        setName("");
        setAresAlias("");
        setLand("");
        setPostcode("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Input className="max-w-48" onChange={(event) => setName(event.target.value)} placeholder="Naam" value={name} />
      <Input
        className="max-w-40"
        onChange={(event) => setAresAlias(event.target.value)}
        placeholder="Ares-alias"
        value={aresAlias}
      />
      <Input className="max-w-20" onChange={(event) => setLand(event.target.value)} placeholder="Land (AT)" value={land} />
      <Input
        className="max-w-28"
        onChange={(event) => setPostcode(event.target.value)}
        placeholder="Postcode"
        value={postcode}
      />
      <Button disabled={isPending || !name.trim()} onClick={submit} size="sm" variant="secondary">
        <Plus className="size-3.5" />
        Toevoegen
      </Button>
    </div>
  );
}
