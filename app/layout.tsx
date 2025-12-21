import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/nav/app-header";
import { Toaster } from "@/components/ui/sonner";
import { LoaderProvider } from "@/components/providers/loader-provider";
import { Loader } from "@/components/ui/loader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dnaara Platform",
  description: "Dnaara - Import Management Platform",
};

import { PageLoaderListener } from "@/components/providers/page-loader-listener";

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoaderProvider>
          <PageLoaderListener />
          <Loader />
          <AppHeader />
          <main className="min-h-screen">{children}</main>
          <Toaster />
        </LoaderProvider>
      </body>
    </html>
  );
}
