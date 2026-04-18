import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import "./portfolio.css";
import portfolio from "@/data/portfolio.json";

const fontSyne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const fontCormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "600", "700"],
  style: ["normal", "italic"],
});

const fontJetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: `${portfolio.name} – Critical Care Nurse`,
  description: portfolio.about.slice(0, 160),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${fontSyne.variable} ${fontCormorant.variable} ${fontJetbrains.variable}`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
