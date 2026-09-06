import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-100 min-h-screen relative overflow-x-hidden`}
      >
        {/* Full-Body Fixed Moving Storm Clouds Video Background */}
        <div className="fixed inset-0 -z-50 w-full h-full overflow-hidden pointer-events-none select-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="/storm-clouds-bg.png"
          >
            <source src="/storm-clouds-video.mp4" type="video/mp4" />
          </video>
          {/* Subtle dark tint overlay to preserve text readability and tactical contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/65 to-slate-950/85" />
        </div>

        {children}
      </body>
    </html>
  );
}
