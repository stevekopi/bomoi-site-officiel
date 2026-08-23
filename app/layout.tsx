import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bomoi — L’ERP moderne et multisite",
  description: "Bomoi centralise vos stocks, ventes, achats, finances et opérations multisites dans une plateforme claire, rapide et sécurisée.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" data-theme="dark" suppressHydrationWarning><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
