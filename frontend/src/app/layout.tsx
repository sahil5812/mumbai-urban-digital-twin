import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import OceanSkyBackground from "@/components/OceanSkyBackground";
import { ScrollRevealInit } from "@/components/ScrollRevealInit";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Mumbai Urban Infrastructure Digital Twin - PS010",
  description: "Real-time AI/ML urban infrastructure disaster management twin for Mumbai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-100 min-h-screen relative overflow-x-hidden`}
      >
        {/* Global Scroll Reveal Animation Observer */}
        <ScrollRevealInit />

        {/* Full-Body Fixed Interactive Procedural WebGL Ocean & Sky Shader Background */}
        <OceanSkyBackground />

        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
