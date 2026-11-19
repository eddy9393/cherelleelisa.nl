import type { Metadata } from "next";
import { Suspense } from "react";
import SiteAnalytics from "./components/SiteAnalytics";
import { Manrope } from "next/font/google";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cherelleelisa.nl"),
  title: "Cherelle Elisa — Coming Soon",
  description: "Cherelle Elisa — binnenkort meer.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={sans.variable}>
      <body>{children}<Suspense fallback={null}><SiteAnalytics /></Suspense></body>
    </html>
  );
}
