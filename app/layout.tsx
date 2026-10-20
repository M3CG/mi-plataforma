import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/widgets/Header/Header';
import ScrollToTop from '@/app/providers/ScrollToTop';
import PageTransitionGate from '@/app/providers/PageTransitionGate';
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
  title: "Cinelito | Movies & Series in HD",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#000F20] text-white antialiased`}
      >
        <WebVitalsReporter />
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="preconnect" href={strapiOrigin} />
        <ScrollToTop />
        <PageTransitionGate />
        <Header />
        <main className="pt-16 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
