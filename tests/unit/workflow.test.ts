import { describe, expect, it } from "vitest";

import { canDeny, canSubmitToQc } from "@/lib/workflow";

describe("canSubmitToQc", () => {
  it("staat inleveren toe zodra elke foto is afgevinkt", () => {
    expect(canSubmitToQc({ totalPhotos: 11, donePhotos: 11 })).toEqual({ ok: true });
  });

  it("blokkeert inleveren zolang er foto's openstaan", () => {
    const result = canSubmitToQc({ totalPhotos: 11, donePhotos: 7 });

    expect(result.ok).toBe(false);
  });

  it("noemt hoeveel foto's er nog open staan", () => {
    const result = canSubmitToQc({ totalPhotos: 11, donePhotos: 7 });

    // AGENTS.md eist een concrete melding, niet "niet toegestaan".
    expect(result.ok === false && result.message).toContain("4");
    expect(result.ok === false && result.message).toContain("11");
  });

  it("gebruikt enkelvoud bij precies één openstaande foto", () => {
    const result = canSubmitToQc({ totalPhotos: 3, donePhotos: 2 });

    expect(result.ok === false && result.message).toContain("nog 1 van de 3");
  });

  it("blokkeert een opdracht zonder foto's", () => {
    const result = canSubmitToQc({ totalPhotos: 0, donePhotos: 0 });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toContain("fotonummers");
  });
});

describe("canDeny", () => {
  it("staat afkeuren toe met minstens één bevinding", () => {
    expect(canDeny({ findingCount: 1 })).toEqual({ ok: true });
  });

  it("blokkeert afkeuren zonder bevinding", () => {
    const result = canDeny({ findingCount: 0 });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toContain("bevinding");
  });
});
