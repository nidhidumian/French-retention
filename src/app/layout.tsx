import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Jost } from "next/font/google";
import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "French retention",
  description:
    "Personal French retention app — dump notes, extract vocab/verbs/grammar, quiz by spaced repetition.",
};

export const viewport: Viewport = {
  themeColor: "#270911",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jost.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
