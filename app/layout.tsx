import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://bomoi.cd"),
  title: "Bomoi — L’ERP moderne et multisite",
  description: "Bomoi centralise vos stocks, ventes, achats, finances et opérations multisites dans une plateforme claire, rapide et sécurisée.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_CD",
    url: "https://bomoi.cd",
    siteName: "Bomoi",
    title: "Bomoi — L’ERP moderne et multisite",
    description: "Stocks, ventes, achats, finances et opérations multisites réunis dans une plateforme claire, rapide et sécurisée.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Bomoi — L’ERP moderne qui relie toute votre entreprise" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bomoi — L’ERP moderne et multisite",
    description: "Stocks, ventes, achats, finances et opérations multisites réunis dans une seule plateforme.",
    images: ["/og.png"],
  },
  icons: { icon: "/bomoi-logo.png", shortcut: "/bomoi-logo.png", apple: "/bomoi-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" data-theme="dark" suppressHydrationWarning><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
