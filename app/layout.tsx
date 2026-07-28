import type { Metadata } from "next";

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
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
