/**
 * Content pillars. Every post belongs to exactly one. If a draft fits none of
 * these, it is not a post for this site.
 */

export type PillarId = "P1" | "P2" | "P3" | "P4" | "P5" | "P6";

export type Pillar = {
  id: PillarId;
  slug: string;
  name: string;
  short: string;
  blurb: string;
  /** Whether this pillar is one of the five research pillars (P6 is applied breadth). */
  research: boolean;
};

export const pillars: Pillar[] = [
  {
    id: "P1",
    slug: "financial-graph-intelligence",
    name: "Financial graph intelligence",
    short: "Graph intelligence",
    blurb:
      "Treating reconciliation, lineage and transaction correspondence as problems over heterogeneous temporal graphs rather than pairwise string matching.",
    research: true,
  },
  {
    id: "P2",
    slug: "neuro-symbolic",
    name: "Neuro-symbolic & constrained ML",
    short: "Constrained ML",
    blurb:
      "Models that must satisfy hard identities — conservation, balance, double entry — and the four places a constraint can actually be enforced.",
    research: true,
  },
  {
    id: "P3",
    slug: "enterprise-ai-privacy",
    name: "Enterprise AI privacy",
    short: "AI privacy",
    blurb:
      "Confidentiality failures that survive masking: relationship leakage, rule leakage, and disclosure that accumulates across sessions rather than within one.",
    research: true,
  },
  {
    id: "P4",
    slug: "governed-agentic-ai",
    name: "Governed agentic AI",
    short: "AI governance",
    blurb:
      "Making agent behaviour auditable in controlled environments: least-privilege context, measurable leakage, and evidence a control tester can actually accept.",
    research: true,
  },
  {
    id: "P5",
    slug: "agent-engineering",
    name: "Agent engineering",
    short: "Agent engineering",
    blurb:
      "The harness around the model — composition, evaluation without ground truth, rollback, and the tool surface agents actually have to live with.",
    research: true,
  },
  {
    id: "P6",
    slug: "applied-systems",
    name: "Retail & fintech AI systems",
    short: "Applied systems",
    blurb:
      "Applied write-ups from production-scale retail and financial systems: search architecture, risk scoring, and vendor exposure.",
    research: false,
  },
];

export const pillarById = (id: string) => pillars.find((p) => p.id === id);
export const pillarBySlug = (slug: string) => pillars.find((p) => p.slug === slug);
