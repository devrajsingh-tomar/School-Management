import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Optimized font
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "School Management SaaS",
  description: "A comprehensive school management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={cn("h-full bg-gray-50 antialiased", inter.variable)}>
        {children}
      </body>
    </html>
  );
}
