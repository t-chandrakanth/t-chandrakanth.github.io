import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { currentEmployer, sameAs, site } from "@/lib/site";
// KaTeX first: globals.css overrides its display sizing.
import "katex/dist/katex.min.css";
import "./globals.css";

/**
 * San Francisco is the real face on every Apple device — the system
 * stack in globals.css resolves it first, and Apple does not license
 * it as a webfont. Inter is only the stand-in for everyone else, so
 * it sits behind SF in the stack and costs Apple users nothing.
 * Mono is fully system-resolved (SF Mono / Menlo / Consolas).
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.blogName,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${site.url}/feed.xml` },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

/**
 * Runs before first paint so a stored theme preference never flashes.
 * Kept deliberately tiny and dependency-free.
 */
const THEME_INIT = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}`;

function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    jobTitle: site.role,
    description: site.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bentonville",
      addressRegion: "AR",
      addressCountry: "US",
    },
    worksFor: {
      "@type": "Organization",
      name: currentEmployer.name,
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of Central Missouri",
    },
    knowsAbout: [
      "Enterprise AI agents and agent architecture",
      "Agent harness design and tool interfaces",
      "Evaluation of autonomous systems without ground truth",
      "AI governance and control evidence",
      "Enterprise AI privacy and disclosure risk",
      "Event-driven distributed systems",
      "Payment reconciliation at scale",
      "Retail and e-commerce platform engineering",
    ],
    sameAs: sameAs(),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <PersonJsonLd />
      </head>
      <body className="min-h-dvh antialiased">
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
