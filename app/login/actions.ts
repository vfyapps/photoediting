"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { LoginState } from "@/app/login/state";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vul je e-mailadres in")
    .email("Vul een geldig e-mailadres in")
    .max(254, "E-mailadres is te lang"),
});

const passwordLoginSchema = loginSchema.extend({
  password: z
    .string()
    .min(1, "Vul je wachtwoord in")
    .max(1024, "Wachtwoord is te lang"),
});

export async function requestMagicLink(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer het e-mailadres",
    };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      status: "error",
      message: "Supabase is nog niet ingesteld. Neem contact op met de beheerder.",
    };
  }

  const origin = (await headers()).get("origin");
  if (!origin) {
    return {
      status: "error",
      message: "De inloglink kon niet worden voorbereid. Probeer opnieuw.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      shouldCreateUser: false,
    },
  });

  if (error?.code === "over_email_send_rate_limit") {
    return {
      status: "error",
      message: "Er is net al een inloglink verstuurd. Wacht even en probeer opnieuw.",
    };
  }

  if (error?.code === "email_address_invalid") {
    return {
      status: "error",
      message: "Dit e-mailadres kan niet worden gebruikt voor een inloglink.",
    };
  }

  if (error) {
    return {
      status: "error",
      message: "De inloglink kon niet worden verstuurd. Probeer het later opnieuw.",
    };
  }

  return {
    status: "success",
    message:
      "Controleer je inbox. Als het e-mailadres bekend is, ontvang je binnen enkele minuten een inloglink.",
  };
}

export async function loginWithPassword(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = passwordLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer de inloggegevens",
    };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      status: "error",
      message: "Supabase is nog niet ingesteld. Neem contact op met de beheerder.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: "error",
      message: "E-mailadres of wachtwoord is onjuist.",
    };
  }

  redirect("/");
}
