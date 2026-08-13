"use client";

import { useActionState, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Mail,
} from "lucide-react";

import {
  loginWithPassword,
  requestMagicLink,
} from "@/app/login/actions";
import { initialLoginState } from "@/app/login/state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LoginForm({
  configured,
  callbackError,
}: {
  configured: boolean;
  callbackError?: string;
}) {
  const [method, setMethod] = useState<"magic" | "password">("magic");
  const [magicState, magicAction, isMagicPending] = useActionState(
    requestMagicLink,
    initialLoginState,
  );
  const [passwordState, passwordAction, isPasswordPending] = useActionState(
    loginWithPassword,
    initialLoginState,
  );

  if (magicState.status === "success") {
    return (
      <div
        aria-live="polite"
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"
      >
        <CheckCircle2 className="size-6 text-emerald-600" />
        <h2 className="mt-3 font-bold">Inloglink verstuurd</h2>
        <p className="mt-1 text-sm leading-6 text-emerald-800">
          {magicState.message}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div
        aria-label="Inlogmethode"
        className="grid grid-cols-2 rounded-xl bg-muted p-1"
        role="group"
      >
        <MethodButton
          active={method === "magic"}
          label="Magic link"
          onClick={() => setMethod("magic")}
        />
        <MethodButton
          active={method === "password"}
          label="Wachtwoord"
          onClick={() => setMethod("password")}
        />
      </div>

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

      {method === "magic" ? (
        <form action={magicAction} className="grid gap-5">
          <EmailField disabled={!configured || isMagicPending} id="magic-email" />
          {magicState.status === "error" ? (
            <ErrorMessage message={magicState.message} />
          ) : null}
          <Button
            className={cn("w-full", isMagicPending && "cursor-wait")}
            disabled={!configured || isMagicPending}
            type="submit"
          >
            {isMagicPending ? (
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
      ) : (
        <form action={passwordAction} className="grid gap-5">
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
            Tijdelijke login voor beheerders en testdoeleinden.
          </p>
          <EmailField
            disabled={!configured || isPasswordPending}
            id="password-email"
          />
          <label
            className="grid gap-2 text-sm font-semibold"
            htmlFor="password"
          >
            Wachtwoord
            <span className="relative">
              <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoComplete="current-password"
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted"
                disabled={!configured || isPasswordPending}
                id="password"
                name="password"
                required
                type="password"
              />
            </span>
          </label>
          {passwordState.status === "error" ? (
            <ErrorMessage message={passwordState.message} />
          ) : null}
          <Button
            className={cn("w-full", isPasswordPending && "cursor-wait")}
            disabled={!configured || isPasswordPending}
            type="submit"
          >
            {isPasswordPending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" /> Inloggen…
              </>
            ) : (
              <>
                Inloggen <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

function MethodButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function EmailField({ disabled, id }: { disabled: boolean; id: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold" htmlFor={id}>
      E-mailadres
      <span className="relative">
        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          autoComplete="email"
          autoFocus
          className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted"
          disabled={disabled}
          id={id}
          name="email"
          placeholder="naam@villaforyou.com"
          required
          type="email"
        />
      </span>
    </label>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p
      aria-live="polite"
      className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {message}
    </p>
  );
}
