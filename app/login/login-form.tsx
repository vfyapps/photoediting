"use client";

import { useActionState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle, Mail } from "lucide-react";

import {
  initialLoginState,
  requestMagicLink,
} from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LoginForm({
  configured,
  callbackError,
}: {
  configured: boolean;
  callbackError?: string;
}) {
  const [state, action, isPending] = useActionState(
    requestMagicLink,
    initialLoginState,
  );

  if (state.status === "success") {
    return (
      <div
        aria-live="polite"
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"
      >
        <CheckCircle2 className="size-6 text-emerald-600" />
        <h2 className="mt-3 font-bold">Inloglink verstuurd</h2>
        <p className="mt-1 text-sm leading-6 text-emerald-800">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-5">
      <label className="grid gap-2 text-sm font-semibold" htmlFor="email">
        E-mailadres
        <span className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoComplete="email"
            autoFocus
            className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted"
            disabled={!configured || isPending}
            id="email"
            name="email"
            placeholder="naam@villaforyou.com"
            required
            type="email"
          />
        </span>
      </label>

      {!configured ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Supabase is nog niet ingesteld. Neem contact op met de beheerder.
        </p>
      ) : null}

      {callbackError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {callbackError}
        </p>
      ) : null}

      {state.status === "error" ? (
        <p
          aria-live="polite"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.message}
        </p>
      ) : null}

      <Button
        className={cn("w-full", isPending && "cursor-wait")}
        disabled={!configured || isPending}
        type="submit"
      >
        {isPending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" /> Versturen…
          </>
        ) : (
          <>
            Stuur inloglink <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}
