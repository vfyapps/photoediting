import { Sen, Noto_Sans, IBM_Plex_Mono } from "next/font/google";

// Display — the brand's most recognizable element. Use uppercase + tight
// tracking only for marketing/hero moments; normal case for in-app headers.
export const sen = Sen({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-sen",
  display: "swap",
});

// Body — carries reading content. Full NL/DE/FR/AT diacritic coverage.
export const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

// System voice — labels, nav, table headers, badges, acco-id's. Never body copy.
export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

// In app/layout.tsx:
//   import { sen, notoSans, ibmPlexMono } from "@/lib/fonts";
//   <html lang="nl" className={`${sen.variable} ${notoSans.variable} ${ibmPlexMono.variable}`}>
