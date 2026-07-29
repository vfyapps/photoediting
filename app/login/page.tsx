import type { Metadata } from "next";
import { Images } from "lucide-react";

import { LoginForm } from "@/app/login/login-form";

export const metadata: Metadata = {
  title: "Inloggen · VfY Fotobewerking",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ fout?: string }>;
}) {
  const params = await searchParams;
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_42%)]" />
        <div className="relative flex items-center gap-3 text-sm font-bold tracking-wide">
          <span className="grid size-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Images className="size-5" />
          </span>
          VILLA FOR YOU
        </div>
        <div className="relative max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
            AI Photo Editing
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight">
            Eén helder overzicht voor elke fotobewerking.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Beheer opdrachten, volg de voortgang en houd de kwaliteit van onze
            vakantiewoningen scherp in beeld.
          </p>
        </div>
        <p className="relative text-xs text-slate-400">
          Interne applicatie · Villa for You
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-white">
              <Images className="size-5" />
            </span>
            <span className="text-sm font-bold tracking-wide">VILLA FOR YOU</span>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            VfY Fotobewerking
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Welkom terug</h1>
          <p className="mb-8 mt-3 text-sm leading-6 text-muted-foreground">
            Log in met een beveiligde magic link of gebruik tijdelijk je
            beheerderswachtwoord.
          </p>
          <LoginForm
            callbackError={
              params.fout
                ? "Deze inloglink is ongeldig of verlopen. Vraag een nieuwe link aan."
                : undefined
            }
            configured={configured}
          />
          <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
            Gebruik alleen je eigen inloggegevens en deel ze niet met anderen.
          </p>
        </div>
      </section>
    </main>
  );
}
