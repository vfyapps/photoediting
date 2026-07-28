import { Images, LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-slate-950 text-white shadow-sm">
          <Images className="size-6" />
        </span>
        <div>
          <p className="font-bold">VfY Fotobewerking</p>
          <p className="mt-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" /> Laden…
          </p>
        </div>
      </div>
    </main>
  );
}
