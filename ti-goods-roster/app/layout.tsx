import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "TI Goods Roster", description: "Duty roster for the TI Goods team" };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
