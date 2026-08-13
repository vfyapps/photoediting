// Vaste toewijzing van naam naar een van de 8 gevalideerde chart-tinten
// (BUILDPLAN.md §3), zodat een editor op het bord altijd dezelfde kleur
// draagt. Puur decoratief — nooit de enige drager van betekenis, altijd
// naast de initialen/naam (zie color-formula.md, chroma/contrast-checks).
export function avatarColorVar(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const slot = (hash % 8) + 1;
  return `var(--chart-${slot})`;
}
