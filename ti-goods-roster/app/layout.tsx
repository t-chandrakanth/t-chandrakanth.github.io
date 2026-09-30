import type { Metadata, Viewport } from "next";
import { DM_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { APP_TITLE, TEAM } from "@/lib/config";

const sans = DM_Sans({ subsets: ["latin"], variable: "--sans" });
const mono = DM_Mono({ subsets: ["latin"], weight: "500", variable: "--mono" });

export const metadata: Metadata = {
  title: APP_TITLE,
  description: `Duty muster for ${APP_TITLE}`,
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: TEAM.short, statusBarStyle: "default" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#2447d8" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <head>
        {/* Catch the browser's install prompt before React loads, so "Tap to install" can open it straight away. */}
        <script dangerouslySetInnerHTML={{ __html: "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__bip=e;});" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
