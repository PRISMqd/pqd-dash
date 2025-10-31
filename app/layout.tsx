import type { Metadata } from "next";
import type React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PRISMqd",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ClerkProvider>
        <body className={`antialiased ${inter.className}`}>{children}</body>
      </ClerkProvider>
    </html>
  );
}
