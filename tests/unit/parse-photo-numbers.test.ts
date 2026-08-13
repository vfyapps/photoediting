import { describe, expect, it } from "vitest";

import { parsePhotoNumbers } from "@/lib/assignments";

describe("parsePhotoNumbers", () => {
  it("parseert een komma-gescheiden lijst", () => {
    expect(parsePhotoNumbers("12, 15, 18")).toEqual([12, 15, 18]);
  });

  it("accepteert spaties en puntkomma's als scheidingsteken", () => {
    expect(parsePhotoNumbers("12 15;18")).toEqual([12, 15, 18]);
  });

  it("verwijdert duplicaten, op volgorde van eerste voorkomen", () => {
    expect(parsePhotoNumbers("12, 15, 12, 18, 15")).toEqual([12, 15, 18]);
  });

  it("negeert niet-numerieke en niet-positieve tokens", () => {
    expect(parsePhotoNumbers("12, abc, -3, 0, 18")).toEqual([12, 18]);
  });

  it("geeft een lege lijst terug voor lege of blanco invoer", () => {
    expect(parsePhotoNumbers("")).toEqual([]);
    expect(parsePhotoNumbers("   ")).toEqual([]);
  });
});
