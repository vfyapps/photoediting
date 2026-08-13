import { redirect } from "next/navigation";
import { Toaster } from "sonner";

import { AppShell } from "@/components/shell/app-shell";
import { getCurrentUser } from "@/lib/session";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // proxy.ts stuurt een sessieloze bezoeker al naar /login; dit is de
  // opvang voor het randgeval waarin de sessie wel bestaat maar de
  // app_users-rij (nog) niet — een half aangemaakt account krijgt geen
  // lege shell te zien.
  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell user={user}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              "bg-card! text-card-foreground! border-border! shadow-md! font-body!",
            title: "text-foreground!",
            description: "text-muted-foreground!",
          },
        }}
      />
    </AppShell>
  );
}
