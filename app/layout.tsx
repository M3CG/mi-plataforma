

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/widgets/Header/Header';
import ScrollToTop from '@/app/providers/ScrollToTop';
import { SITE_URL } from '@/lib/config/site';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "CineStream | Películas y Series en HD",
  description:
    "Disfruta de las mejores películas y series en streaming. Latino, Castellano y Subtitulado en alta calidad.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      {/*
        Se eliminó suppressHydrationWarning del body.

        En este proyecto no hay una causa legítima para silenciar
        warnings de hidratación:

        - No hay theme switching.
        - No hay scripts inline que muten el HTML antes de hidratar.
        - sessionStorage se usa dentro de useEffect.
        - los componentes client tienen estado inicial estable.

        Si aparece un warning de hidratación, hay que encontrar la
        causa real, no silenciarla con suppressHydrationWarning.
      */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-900 text-white antialiased`}
      >
        <ScrollToTop />
        <Header />
        <main className="pt-16 min-h-screen">{children}</main>
      </body>
    </html>
  );
}