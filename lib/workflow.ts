/**
 * De twee workflowregels uit AGENTS.md die volgens Definition of done
 * expliciet getest moeten worden, omdat ze makkelijk stilletjes teruggedraaid
 * worden: `denied` zonder bevinding, en `qc` met foto's die nog openstaan.
 *
 * Bewust pure functies zonder Supabase erin. De server actions roepen ze aan
 * vóór de write, de UI gebruikt dezelfde functie om de knop te blokkeren, en
 * de test hoeft geen database te starten. Foutmeldingen zijn Nederlands en
 * concreet (Rules, punt 9).
 */

export type GuardResult = { ok: true } | { ok: false; message: string };

const ok: GuardResult = { ok: true };

/**
 * Een opdracht mag pas naar `qc` als elke edit_items-rij op done staat.
 * De melding noemt hoeveel foto's er nog open staan, want "niet toegestaan"
 * zonder aantal laat de editor zoeken.
 */
export function canSubmitToQc({
  totalPhotos,
  donePhotos,
}: {
  totalPhotos: number;
  donePhotos: number;
}): GuardResult {
  if (totalPhotos === 0) {
    return {
      ok: false,
      message: "Deze opdracht heeft nog geen foto's. Voeg fotonummers toe voordat je hem naar QC zet.",
    };
  }

  const open = totalPhotos - donePhotos;

  if (open > 0) {
    return {
      ok: false,
      message:
        open === 1
          ? `Er staat nog 1 van de ${totalPhotos} foto's open. Vink hem af voordat je naar QC gaat.`
          : `Er staan nog ${open} van de ${totalPhotos} foto's open. Vink ze af voordat je naar QC gaat.`,
    };
  }

  return ok;
}

/**
 * Afkeuren zonder ten minste één QC-bevinding is niet toegestaan: dan weet de
 * editor niet wat er mis is en levert de QC-lus geen data voor de academy.
 */
export function canDeny({ findingCount }: { findingCount: number }): GuardResult {
  if (findingCount < 1) {
    return {
      ok: false,
      message: "Afkeuren kan alleen met minstens één bevinding. Voeg een bevinding toe.",
    };
  }

  return ok;
}
