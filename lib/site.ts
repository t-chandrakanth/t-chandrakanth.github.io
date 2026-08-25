/**
 * Single source of truth for identity, navigation and outbound links.
 *
 * Anything in `profiles` with an empty `href` is treated as "not created yet"
 * and is omitted from rendering and from the JSON-LD `sameAs` array. Fill them
 * in as the accounts exist — never before.
 */

export const site = {
  name: "Chandrakanth Thadkapally",
  shortName: "C. Thadkapally",
  blogName: "The Reconciliation Layer",
  tagline: "Trustworthy AI for systems that have to be right.",
  role: "Senior Technical Lead",
  location: "Joplin, Missouri",
  email: "chandrakanth.appdev@gmail.com",
  description:
    "Research and writing on trustworthy AI for regulated finance — graph-based reconciliation, constrained machine learning, enterprise AI privacy, and governed agentic systems.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://chandrakanth.dev",
  repo: "https://github.com/t-chandrakanth/t-chandrakanth.github.io",
  locale: "en_US",
} as const;

export type Profile = {
  label: string;
  href: string;
  handle?: string;
  /** Included in schema.org `sameAs` when the href is present. */
  sameAs?: boolean;
};

export const profiles: Profile[] = [
  {
    label: "GitHub",
    href: "https://github.com/t-chandrakanth",
    handle: "t-chandrakanth",
    sameAs: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/chandrakanth-ck-b94724136",
    handle: "chandrakanth-ck",
    sameAs: true,
  },
  // TODO: create these, then paste the URLs in. Leave empty until they exist.
  { label: "ORCID", href: "", sameAs: true },
  { label: "Google Scholar", href: "", sameAs: true },
  { label: "Semantic Scholar", href: "", sameAs: true },
  { label: "arXiv", href: "", sameAs: true },
];

export const liveProfiles = () => profiles.filter((p) => p.href.length > 0);

export const sameAs = () =>
  profiles.filter((p) => p.sameAs && p.href.length > 0).map((p) => p.href);

/** Top navigation. Hard cap of six — everything else lives in the footer. */
export const primaryNav = [
  { label: "Writing", href: "/writing" },
  { label: "Research", href: "/research" },
  { label: "Publications", href: "/publications" },
  { label: "CV", href: "/cv" },
  { label: "About", href: "/about" },
] as const;

export const footerNav = [
  {
    heading: "Work",
    links: [
      { label: "Writing", href: "/writing" },
      { label: "Research program", href: "/research" },
      { label: "Publications", href: "/publications" },
    ],
  },
  {
    heading: "Record",
    links: [
      { label: "CV", href: "/cv" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Machine-readable",
    links: [
      { label: "RSS feed", href: "/feed.xml" },
      { label: "Sitemap", href: "/sitemap.xml" },
      { label: "Source", href: "https://github.com/t-chandrakanth/t-chandrakanth.github.io" },
    ],
  },
] as const;

export const disclaimer =
  "Views are my own and do not represent my employer. All examples use synthetic data.";
