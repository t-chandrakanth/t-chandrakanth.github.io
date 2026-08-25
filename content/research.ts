import type { PillarId } from "./pillars";

/**
 * The research program.
 *
 * STATUS DISCIPLINE — the label on a project is a claim about the record, and
 * on this site the record has to be precisely true as written. Use only:
 *
 *   exploratory   an open question being read into; no artifact yet
 *   in-progress   active work with a defined artifact and no external date
 *   framework     a stated framework, published here, not externally reviewed
 *   preprint      posted to a public preprint server, with a link
 *   under-review  submitted to a named venue, with a submission date
 *   published     accepted and available, with a DOI or venue link
 *
 * Never promote a status ahead of the evidence. An inflated label is the single
 * fastest way to make an otherwise honest record unusable.
 *
 * DISCLOSURE — projects flagged `patentSensitive` describe the problem only.
 * Mechanism, scoring detail and implementation stay unpublished until a
 * provisional application is on file. Public disclosure destroys novelty.
 */

export type ResearchStatus =
  | "exploratory"
  | "in-progress"
  | "framework"
  | "preprint"
  | "under-review"
  | "published";

export const statusMeta: Record<
  ResearchStatus,
  { label: string; tone: "pending" | "verified" | "neutral" }
> = {
  exploratory: { label: "Exploratory", tone: "neutral" },
  "in-progress": { label: "In progress", tone: "pending" },
  framework: { label: "Framework", tone: "neutral" },
  preprint: { label: "Preprint", tone: "pending" },
  "under-review": { label: "Under review", tone: "pending" },
  published: { label: "Published", tone: "verified" },
};

export const thesis = {
  statement:
    "The systems that most need machine learning are the ones least able to tolerate a plausible answer.",
  body: [
    "Financial reconciliation, regulatory reporting and control testing share a property that most machine-learning benchmarks quietly assume away: being approximately right is not a partial success, it is a failure with an audit trail. A model that matches 97% of payments has not solved 97% of the problem — it has produced a population of exceptions that a human now has to work, and it has done so without explaining itself.",
    "My work sits at the intersection three fields keep leaving empty. Graph learning has the right representation for correspondence but is rarely evaluated under accounting constraints. Neuro-symbolic methods have the right machinery for hard identities but are rarely tested at enterprise scale. AI governance has the right vocabulary for control but is almost always written as policy rather than as something you can measure and hand to a tester.",
    "The program below is an attempt to close those gaps in a single direction of travel: representations that fit the domain, constraints that hold by construction, confidentiality that is measured rather than asserted, and evidence that survives contact with an auditor.",
  ],
};

export type ResearchProject = {
  slug: string;
  code: string;
  title: string;
  /** Short label for compact listings. Not derived from `title` — deriving it
   *  produced lower-case fragments on the home page. */
  short: string;
  pillar: PillarId;
  status: ResearchStatus;
  /** One line. What question does this answer? */
  question: string;
  summary: string;
  /** Concrete, checkable outputs. Empty until they exist. */
  artifacts: { label: string; href?: string; note?: string }[];
  patentSensitive?: boolean;
  since: string;
};

export const projects: ResearchProject[] = [
  {
    slug: "recongraph",
    code: "RG",
    title: "ReconGraph — reconciliation as a graph problem",
    short: "Reconciliation as a graph problem",
    pillar: "P1",
    status: "in-progress",
    question:
      "What does reconciliation accuracy mean once you stop assuming records pair off one-to-one?",
    summary:
      "A representation and evaluation programme for financial reconciliation built on heterogeneous temporal graphs. The working hypothesis is that the cases enterprise reconciliation actually fails on — splits, partials, aggregations, out-of-order settlement — are not edge cases of a matching problem but the ordinary case of a correspondence problem over a graph. The deliverable is an open benchmark with deliberately injected error classes, so that the hard cases stop being invisible in aggregate accuracy.",
    artifacts: [
      { label: "Synthetic benchmark generator", note: "In development — to be released under an OSI licence with a CITATION.cff" },
      { label: "Method write-up", note: "Drafting" },
    ],
    since: "2026",
  },
  {
    slug: "constrained-reconciliation",
    code: "CR",
    title: "Constraint-aware learning under accounting identities",
    short: "Learning under accounting identities",
    pillar: "P2",
    status: "exploratory",
    question:
      "Where should a hard constraint be enforced when the model's output must balance exactly?",
    summary:
      "Neural estimators do not respect conservation. In a domain where the sum of the parts is not approximately the whole but definitionally the whole, that is disqualifying. This strand compares the four available injection points — training objective, inference-time projection, post-processing repair, and architectural guarantee — on the axis that matters in practice: what happens to the violations you did not eliminate.",
    artifacts: [{ label: "Comparative study", note: "Design stage" }],
    since: "2026",
  },
  {
    slug: "drrc",
    code: "DRRC",
    title: "DRRC — disclosure risk beyond data masking",
    short: "Disclosure risk beyond masking",
    pillar: "P3",
    status: "framework",
    question:
      "What does an enterprise actually leak to an AI system once the obvious identifiers are already gone?",
    summary:
      "A framework naming the confidentiality failures that masking does not touch: relationship disclosure, where an anonymised graph still reveals who trades with whom; rule disclosure, where the assistant recites the business logic that is the actual asset; and cumulative disclosure, where a sequence of individually harmless answers reconstructs something none of them contained. Published here as a framework, with the threat model stated explicitly enough to argue with.",
    artifacts: [
      { label: "Framework write-up", href: "/writing/why-data-masking-is-not-enough", note: "Published essay" },
    ],
    since: "2026",
  },
  {
    slug: "context-firewall",
    code: "CF",
    title: "Context Firewall — least-privilege context for agents",
    short: "Least-privilege context for agents",
    pillar: "P4",
    status: "in-progress",
    question:
      "Why does an agent see the whole context window when a human in the same role would need an access request?",
    summary:
      "Access control has a settled answer for what a principal may read. Retrieval pipelines mostly do not use it: the agent is handed whatever the retriever returned. This project treats the context window as a protected resource with its own policy surface, and asks what a least-privilege equivalent looks like when the consumer is a model rather than a process. Problem statement only while a provisional application is prepared.",
    artifacts: [{ label: "Design note", note: "Withheld pending provisional filing" }],
    patentSensitive: true,
    since: "2026",
  },
  {
    slug: "bcls",
    code: "BCLS",
    title: "BCLS — making context leakage a measurable quantity",
    short: "Context leakage as a measurable quantity",
    pillar: "P4",
    status: "in-progress",
    question:
      "If you cannot put a number on what an agent leaked, on what basis did you approve it?",
    summary:
      "Confidentiality decisions about AI systems are currently made in prose. This strand asks what it would take to express business-confidentiality leakage as a score that can be tracked over time and traded off against task utility — turning 'is this agent safe to deploy' into a frontier you can choose a point on. Problem statement only while a provisional application is prepared.",
    artifacts: [{ label: "Scoring definition", note: "Withheld pending provisional filing" }],
    patentSensitive: true,
    since: "2026",
  },
  {
    slug: "aicep",
    code: "AICEP",
    title: "AICEP — an evidence package for AI controls",
    short: "An evidence package for AI controls",
    pillar: "P4",
    status: "in-progress",
    question:
      "What would you hand a control tester who has never accepted 'the model decided' as a control?",
    summary:
      "Most AI governance output is policy: statements of intent that a tester cannot test. This strand works the other direction, starting from what a SOX control tester already accepts as evidence and asking what an AI-mediated control has to emit to meet the same bar. Problem statement only while a provisional application is prepared.",
    artifacts: [{ label: "Evidence schema", note: "Withheld pending provisional filing" }],
    patentSensitive: true,
    since: "2026",
  },
];

export const projectsByPillar = (pillar: PillarId) =>
  projects.filter((p) => p.pillar === pillar);
