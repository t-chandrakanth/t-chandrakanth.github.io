/**
 * Publications.
 *
 * This file is the citable record. It is deliberately empty of peer-reviewed
 * entries because there are none yet — an inflated publication list is worse
 * than a short one, and on a site whose whole purpose is corroboration, a
 * single unverifiable entry discredits everything next to it.
 *
 * Add an entry only when it exists and is linkable. `venue` must be the real
 * venue; `status` must match the section it renders under. Citation counts are
 * refreshed manually, quarterly, and stamped with the date they were read.
 */

export type PublicationKind = "peer-reviewed" | "preprint" | "in-preparation";

export type Publication = {
  id: string;
  kind: PublicationKind;
  title: string;
  authors: string[];
  venue?: string;
  year?: number;
  /** ISO date. Used for ordering and for the `datePublished` in JSON-LD. */
  date?: string;
  doi?: string;
  url?: string;
  pdf?: string;
  code?: string;
  abstract?: string;
  /** Manually refreshed. `{ count, asOf }` — never render a count without its date. */
  citations?: { count: number; asOf: string };
  note?: string;
};

export const publications: Publication[] = [
  // --- peer-reviewed -------------------------------------------------------
  // (none yet)

  // --- preprints -----------------------------------------------------------
  // (none yet)

  // --- in preparation ------------------------------------------------------
  {
    id: "recongraph-benchmark",
    kind: "in-preparation",
    title:
      "ReconGraph: a synthetic benchmark for graph-based financial reconciliation under injected error classes",
    authors: ["Chandrakanth Thadkapally"],
    note: "Drafting. Benchmark generator and error taxonomy in development; no submission date set.",
  },
  {
    id: "drrc-framework",
    kind: "in-preparation",
    title:
      "Disclosure risk beyond masking: relationship, rule and cumulative leakage in enterprise AI",
    authors: ["Chandrakanth Thadkapally"],
    note: "Framework stated in essay form; formal write-up drafting.",
  },
];

export const byKind = (kind: PublicationKind) =>
  publications
    .filter((p) => p.kind === kind)
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

export const hasAny = (kind: PublicationKind) =>
  publications.some((p) => p.kind === kind);

/** Chicago-ish single line, used for the copy-citation control. */
export function formatCitation(p: Publication): string {
  const authors = p.authors.join(", ");
  const bits = [`${authors}. "${p.title}."`];
  if (p.venue) bits.push(`${p.venue}${p.year ? `, ${p.year}` : ""}.`);
  else if (p.year) bits.push(`${p.year}.`);
  if (p.doi) bits.push(`https://doi.org/${p.doi}`);
  else if (p.url) bits.push(p.url);
  return bits.join(" ");
}
