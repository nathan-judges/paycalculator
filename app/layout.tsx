import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SentryInit } from "@/components/SentryInit";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const geistSans = localFont({
  src: "../public/fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "../public/fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Australian Salary Calculator — Take-Home Pay Comparison",
  description:
    "Calculate your Australian take-home pay after tax, Medicare, HECS-HELP, and super. Compare salary offers across financial years.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SentryInit />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
