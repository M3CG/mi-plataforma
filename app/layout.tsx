

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/widgets/Header/Header';
import ScrollToTop from '@/app/providers/ScrollToTop';
import { WebVitalsReporter } from './vitals';
import { SITE_URL } from '@/lib/config/site';
import { API_URL } from '@/lib/api/http/config';

const strapiOrigin = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return API_URL;
  }
})();

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "CineStream | Movies & Series in HD",
  description:
    "Watch the best movies and series in streaming. HD quality with multiple servers and subtitles.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
        <WebVitalsReporter />
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="preconnect" href={strapiOrigin} />
        <ScrollToTop />
        <Header />
        <main className="pt-16 min-h-screen">{children}</main>
      </body>
    </html>
  );
}