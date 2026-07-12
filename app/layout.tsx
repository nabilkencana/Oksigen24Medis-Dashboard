import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DataProvider } from "../context/DataContext";
import DashboardShell from "../components/DashboardShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oksigen Medis 24 Jam | ERP Dashboard",
  description: "ERP-style Oxygen Rental and Cylinder Inventory Management System Dashboard",
  icons: {
    icon: "/logo-removebg-preview.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <DataProvider>
          <DashboardShell>{children}</DashboardShell>
        </DataProvider>
      </body>
    </html>
  );
}
