// app/layout.tsx
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Jura } from "next/font/google";

const jura = Jura({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jura",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${jura.variable} min-h-screen w-full`}>
      <body className="min-h-screen w-full font-sans">
        {children}
      </body>
    </html>
  );
}
