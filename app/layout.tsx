import type { Metadata } from "next";

import { ibmPlexMono, notoSans, sen } from "@/lib/fonts";
import { themeInitScript } from "@/lib/theme";

import "./globals.css";

export const metadata: Metadata = {
  title: "VfY Fotobewerking",
  description: "Interne applicatie voor AI-fotobewerking van Villa for You",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${sen.variable} ${notoSans.variable} ${ibmPlexMono.variable}`}
      lang="nl"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
