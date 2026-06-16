import type { Metadata, Viewport } from "next";
import { Lora, Lato } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Plancash — Familieøkonomi",
  description: "Oversikt over familiens økonomi, budsjett og utgifter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb" className={`${lora.variable} ${lato.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[var(--font-lato)]">{children}</body>
    </html>
  );
}
