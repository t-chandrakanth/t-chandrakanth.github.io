/**
 * Content pillars. Every post belongs to exactly one. If a draft fits none of
 * these, it is not a post for this site.
 *
 * Order is meaningful: P1 sorts first everywhere, so the sequence below is the
 * site's stated centre of gravity. Agents lead; the payments and reconciliation
 * work is one strand of the programme, not its identity.
 */

export type PillarId = "P1" | "P2" | "P3" | "P4" | "P5" | "P6";

export type Pillar = {
  id: PillarId;
  slug: string;
  name: string;
  short: string;
  blurb: string;
};

export const pillars: Pillar[] = [
  {
    id: "P1",
    slug: "agent-engineering",
    name: "Agent engineering",
    short: "Agent engineering",
    blurb:
      "The harness around the model — tool surfaces, context assembly, control loops, and how you evaluate an agent when no gold label exists.",
  },
  {
    id: "P2",
    slug: "governed-agentic-ai",
    name: "Governed agentic AI",
    short: "AI governance",
    blurb:
      "Making agent behaviour auditable where it matters: least-privilege context, approval gates that are not theatre, and evidence a control tester will accept.",
  },
  {
    id: "P3",
    slug: "enterprise-ai-privacy",
    name: "Enterprise AI privacy",
    short: "AI privacy",
    blurb:
      "Confidentiality failures that survive masking: relationship leakage, rule leakage, and disclosure that accumulates across sessions rather than within one.",
  },
  {
    id: "P4",
    slug: "payments-and-reconciliation",
    name: "Payments & reconciliation",
    short: "Payments",
    blurb:
      "Transaction correspondence, settlement and lineage treated as problems over heterogeneous temporal graphs rather than pairwise string matching.",
  },
  {
    id: "P5",
    slug: "constrained-ml",
    name: "Constrained & neuro-symbolic ML",
    short: "Constrained ML",
    blurb:
      "Models that must satisfy hard identities — conservation, balance, double entry — and the four places a constraint can actually be enforced.",
  },
  {
    id: "P6",
    slug: "retail-and-commerce",
    name: "Retail & commerce systems",
    short: "Commerce",
    blurb:
      "Applied write-ups from production-scale commerce platforms: search architecture, catalogue retrieval, and the parts of a retail stack that carry load.",
  },
];

export const pillarById = (id: string) => pillars.find((p) => p.id === id);
export const pillarBySlug = (slug: string) => pillars.find((p) => p.slug === slug);
