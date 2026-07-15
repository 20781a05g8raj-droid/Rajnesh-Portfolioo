import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rajnesh Upadhyay — Web Developer · AI Video Creator · AI Graphic Designer",
  description:
    "Premium 3D interactive portfolio of Rajnesh Upadhyay — a multi-disciplinary creator crafting websites, AI-generated video content, and AI poster / graphic design. Scroll to play through the experience.",
  keywords: [
    "Rajnesh Upadhyay",
    "portfolio",
    "web developer",
    "AI video creator",
    "AI graphic designer",
    "3D portfolio",
    "Next.js",
    "Three.js",
  ],
  authors: [{ name: "Rajnesh Upadhyay" }],
  openGraph: {
    title: "Rajnesh Upadhyay — Interactive 3D Portfolio",
    description:
      "A scroll-driven 3D portfolio experience showcasing web development, AI video and AI graphic design.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rajnesh Upadhyay — Interactive 3D Portfolio",
    description:
      "A scroll-driven 3D portfolio experience showcasing web development, AI video and AI graphic design.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${display.variable} ${mono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
