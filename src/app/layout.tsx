// app/layout.tsx
import type { Metadata } from 'next';
import { Jura } from "next/font/google";
import localFont from "next/font/local";
import RegisterSW from '@/components/helpers/RegisterSW';
import ClientLayout from "./ClientLayout";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import InstallPWA from '@/components/helpers/InstallButton';
import { EventCalendar } from '@/components/calendar/components';

const concielian = localFont({
  src: "./fonts/concieliancondital.woff2",
  variable: "--font-concielian",
  display: "swap",
});

const jura = Jura({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jura",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LSL Mission",
  description: "Drones control interface",
  icons: {
    shortcut: '/favicon.ico',
  },
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jura.variable} ${concielian.variable} min-h-screen w-full `}>
      <body className="min-h-screen w-full font-sans bg-[#041c1e]">
        
        <ClientLayout>
          <InstallPWA/>
          <RegisterSW/>
            {children}
        </ClientLayout>
      </body>
    </html>
  );
}