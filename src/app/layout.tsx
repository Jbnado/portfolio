import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "João Bernardo | Desenvolvedor Full Stack & Tech Leader",
  description:
    "Portfolio profissional de João Bernardo, desenvolvedor full stack e tech leader especializado em React, TypeScript, Node.js e Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-gray-100`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] bg-cyan-600 text-white px-4 py-2 rounded-md"
        >
          Pular para o conteúdo
        </a>
        <ScrollProgressBar />
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
