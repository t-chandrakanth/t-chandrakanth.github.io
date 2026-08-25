import type { PillarId } from "./pillars";

/**
 * Publications — the citable record.
 *
 * STATUS DISCIPLINE. `kind` is a claim about the record and must match reality:
 *
 *   peer-reviewed   accepted at a named venue, with a DOI or venue link
 *   preprint        posted to a public preprint server, with a live link
 *   in-preparation  written or being written, with no submission date
 *
 * Nothing is promoted a level without a link to point at. A single
 * unverifiable entry discredits everything listed next to it.
 *
 * The abstracts below are edited for legibility from the manuscript sources;
 * the claims, numbers and framing are the manuscripts'. Figures quoted are from
 * controlled synthetic benchmarks, never from production systems.
 */

export type PublicationKind = "peer-reviewed" | "preprint" | "in-preparation";

export type ResultsTable = {
  caption: string;
  /** Column headings. First column is the row label. */
  columns: string[];
  rows: { label: string; values: string[]; highlight?: boolean }[];
  note?: string;
};

export type Publication = {
  id: string;
  kind: PublicationKind;
  title: string;
  /** Short name used in listings and cross-references. */
  short: string;
  authors: string[];
  pillar?: PillarId;
  venue?: string;
  year?: number;
  /** ISO date. Ordering and `datePublished` in JSON-LD. */
  date?: string;
  doi?: string;
  url?: string;
  pdf?: string;
  code?: string;
  /** Manually refreshed. Never render a count without its `asOf` date. */
  citations?: { count: number; asOf: string };
  note?: string;

  // --- long-form detail; when present the entry gets its own page ----------
  abstract?: string;
  keywords?: string[];
  contributions?: string[];
  method?: string[];
  setup?: { label: string; value: string }[];
  results?: ResultsTable[];
  findings?: string[];
  limitations?: string[];
  /** Slugs of essays on this site that cover the same ground. */
  relatedWriting?: string[];
};

export const publications: Publication[] = [
  // --- peer-reviewed -------------------------------------------------------
  // (none yet)

  // --- preprints -----------------------------------------------------------
  // (none yet)

  // --- in preparation ------------------------------------------------------
  {
    id: "recongraph",
    kind: "in-preparation",
    title:
      "ReconGraph: Probabilistic Consistency Inference over Heterogeneous Temporal Graphs for Enterprise Financial Reconciliation",
    short: "ReconGraph",
    authors: ["Chandrakanth Thadkapally"],
    pillar: "P1",
    note: "Manuscript complete. Not submitted; no venue or submission date set.",
    abstract:
      "Enterprise reconciliation is not a record-pair problem. A single economic event can produce an order, an invoice, a shipment, a receipt, a payment, a settlement, a commission, an adjustment and a ledger posting, written by different systems on different clocks. ReconGraph represents these artefacts as a heterogeneous temporal graph and infers a globally consistent reconciliation subgraph over it, rather than accepting or rejecting candidate pairs independently. Relation- and time-specific message passing combines attribute, amount, temporal, neighbourhood and business-rule evidence; a factorised consistency layer penalises violations of quantity conservation, temporal ordering, debit–credit balance and link cardinality. On RECONBENCH — a synthetic benchmark constructed from the public IBM AMLSim / AML-Data ecosystem — ReconGraph reaches 0.949 link F1, 0.944 graph-consistency accuracy and 0.892 anomaly recall, while reducing the false-reconciliation rate to 0.033, a 32.7% reduction against the strongest graph-matching baseline. Ablation, calibration, robustness and scaling studies isolate the contribution of the accounting constraints. The result is a reconciliation decision that is auditable as a subgraph with residuals attached, rather than an isolated similarity score.",
    keywords: [
      "enterprise reconciliation",
      "heterogeneous temporal graph",
      "probabilistic inference",
      "accounting constraints",
      "entity matching",
      "anomaly detection",
      "calibration",
    ],
    contributions: [
      "Poses reconciliation as inference of a globally consistent subgraph over a heterogeneous temporal graph, so that one-to-many, many-to-one and partial allocations are ordinary cases rather than exceptions to a bijection.",
      "Combines relation-aware and time-aware message passing over typed financial records with a learned local edge probability, so neighbourhood evidence can override a locally attractive but globally impossible link.",
      "Adds a factorised consistency layer that scores quantity-conservation, temporal-order, debit–credit balance and cardinality residuals, making the reason a subgraph was rejected inspectable per constraint family.",
      "Releases RECONBENCH, a synthetic order-to-cash and procure-to-pay benchmark derived from public AML simulation data, with ground-truth allocation edges and controlled corruption applied only after ground truth is frozen.",
      "Evaluates on link quality, false reconciliation, graph consistency, anomaly recall, calibration, runtime and review workload, rather than on pairwise accuracy alone.",
    ],
    method: [
      "Financial artefacts become typed nodes — invoices, shipments, receipts, payments, settlements, adjustments, ledger postings — and candidate correspondences become typed edges (fulfils, settles, allocates, reverses, posts-to), each carrying event time and ingestion time.",
      "Candidate generation runs three cascaded lanes: exact normalised identifiers for precision, phonetic and edit-distance keys for recovery, and amount–time windows for the identifier-free case. Every retained edge records why it was blocked in, so candidate-generation misses can be audited separately from classifier errors.",
      "A logistic local model scores each candidate edge from attribute similarity, normalised amount agreement, temporal evidence, graph context and business-rule features, with missing fields masked so absence is not read as agreement.",
      "Two layers of relation- and time-specific attention propagate neighbourhood evidence without smoothing local reconciliation chains away.",
      "A factorised consistency layer converts accounting structure into residuals over candidate subgraphs; posterior edge beliefs are temperature-calibrated so that a confidence threshold means something operationally.",
    ],
    setup: [
      { label: "Benchmark", value: "RECONBENCH, built on the public IBM AMLSim / AML-Data synthetic ecosystem" },
      { label: "Scale", value: "500,000 base economic events over five seeds, expanded to 1.84M record nodes and 2.97M typed candidate edges" },
      { label: "Ground truth", value: "618,420 reconciliation links, frozen before any corruption is applied" },
      { label: "Split", value: "Temporal 60 / 20 / 20, so future events cannot inform predictions" },
      { label: "Baselines", value: "Exact rules, Fellegi–Sunter-style fuzzy probabilistic matching, transformer pairwise matcher, relational temporal graph matcher without global constraints" },
      { label: "Runs", value: "Mean of five seeded simulations; F1 SD < 0.008, anomaly-recall SD < 0.011" },
      { label: "Environment", value: "PyTorch 2.4, PyTorch Geometric 2.6, CUDA 12.4, NVIDIA A100 40 GB" },
    ],
    results: [
      {
        caption: "Reconciliation, consistency, anomaly and calibration performance",
        columns: ["Method", "Prec.", "Recall", "F1", "FRR", "GCA", "Anom.", "ECE"],
        rows: [
          { label: "Exact rules", values: [".962", ".681", ".798", ".038", ".742", ".611", ".118"] },
          { label: "Fuzzy probabilistic", values: [".931", ".814", ".869", ".069", ".801", ".702", ".083"] },
          { label: "Neural pairwise", values: [".944", ".873", ".907", ".056", ".834", ".748", ".061"] },
          { label: "Graph matching", values: [".951", ".895", ".922", ".049", ".897", ".821", ".048"] },
          { label: "ReconGraph", values: [".967", ".931", ".949", ".033", ".944", ".892", ".026"], highlight: true },
        ],
        note: "FRR — false-reconciliation rate; GCA — graph-consistency accuracy; ECE — expected calibration error. Lower is better for FRR and ECE.",
      },
      {
        caption: "Performance by relationship topology, against the strongest baseline",
        columns: ["Topology", "Method", "Prec.", "Recall", "F1", "GCA"],
        rows: [
          { label: "One-to-one", values: ["Graph matching", ".962", ".929", ".945", ".928"] },
          { label: "One-to-one", values: ["ReconGraph", ".973", ".951", ".962", ".966"], highlight: true },
          { label: "One-to-many", values: ["Graph matching", ".941", ".872", ".905", ".881"] },
          { label: "One-to-many", values: ["ReconGraph", ".963", ".929", ".946", ".936"], highlight: true },
          { label: "Many-to-one", values: ["Graph matching", ".927", ".841", ".882", ".854"] },
          { label: "Many-to-one", values: ["ReconGraph", ".951", ".887", ".918", ".910"], highlight: true },
          { label: "Partial payment", values: ["Graph matching", ".938", ".858", ".896", ".867"] },
          { label: "Partial payment", values: ["ReconGraph", ".958", ".914", ".936", ".925"], highlight: true },
        ],
        note: "The gap widens as the topology moves away from one-to-one — which is the population pairwise matching handles worst.",
      },
    ],
    findings: [
      "Pairwise systems improve F1 from rules to neural matching, but their graph-consistency accuracy stays below their F1 throughout: they get more links right without getting the explanation right. Global inference closes that gap.",
      "Under 50% joint corruption of identifiers, fields, timestamps and amounts, F1 holds at 0.864, because weight moves off damaged identifiers and onto amount conservation, event ordering and neighbourhood structure.",
      "Ablation separates the two mechanisms: removing graph context costs the most F1 (0.949 → 0.918), while removing accounting constraints costs the most consistency (GCA 0.944 → 0.872). They are not redundant.",
      "Temperature calibration cuts ECE by 63.4%. At an auto-accept threshold of 0.92 the simulated auto-reconciliation rate is 71.6%, which is the number an operations team actually plans against.",
      "Scaling from 0.1M to 5M records is near-linear: peak GPU memory 1.1 → 16.8 GB, inference 8 → 226 seconds, because blocking keeps connected components independent and average degree near-constant.",
    ],
    limitations: [
      "RECONBENCH is synthetic. It is built to be reproducible and ethically shareable, not to be a substitute for a live enterprise trial, and no claim here transfers to production without one.",
      "Candidate blocking bounds recall. A true allocation that never became a candidate cannot be recovered by any downstream stage, and the blocking-reason audit exists precisely because that failure is otherwise invisible.",
      "The constraint set is the one this work formalised. Foreign exchange, tax treatment and late adjustment practice vary by jurisdiction and organisation, and an over-weighted constraint suppresses genuine exceptions rather than surfacing them.",
    ],
    relatedWriting: [
      "reconciliation-is-a-graph-problem",
      "seven-ways-record-matching-breaks",
    ],
  },
  {
    id: "neurorecon",
    kind: "in-preparation",
    title:
      "NeuroRecon: Constraint-Aware Neuro-Symbolic Learning for Enterprise Financial Reconciliation",
    short: "NeuroRecon",
    authors: ["Chandrakanth Thadkapally"],
    pillar: "P2",
    note: "Manuscript complete. Not submitted; no venue or submission date set.",
    abstract:
      "Enterprise reconciliation requires more than recognising that two records look alike: an accepted match must also satisfy monetary conservation, event ordering, double-entry balance, link cardinality and organisation-specific rules. NeuroRecon is a constraint-aware neuro-symbolic framework that learns transaction similarity and financial validity together rather than sequentially. Heterogeneous ledger, bank, invoice, fee and adjustment records are represented as a typed transaction graph; a graph encoder proposes candidate groups while differentiable penalties turn accounting and business rules into training signal; constrained decoding emits one-to-one, one-to-many, many-to-one and many-to-many reconciliations with per-constraint evidence trails for analyst review. On a controlled benchmark following the public BenchRec schema, and against five matching strategies under identifier corruption, missing records, amount noise, aggregation and reversals, NeuroRecon reaches 94.6% F1 with a 0.6% constraint-violation rate and the best calibration in the comparison. At 75% identifier corruption it retains 80.6% F1, 25.9 points above the pairwise neural model. Ablation shows the amount, balance, cardinality, temporal and business constraints contribute complementary rather than redundant gains. The finding is that financial structure belongs in training, not in an inference-time rule filter.",
    keywords: [
      "financial reconciliation",
      "neuro-symbolic learning",
      "graph neural networks",
      "accounting constraints",
      "transaction matching",
      "explainable AI",
    ],
    contributions: [
      "Learns similarity and financial validity jointly, so constraints shape representation learning and candidate ranking instead of only rejecting outputs after probability mass has already been allocated.",
      "Formalises five constraint families — amount conservation, temporal ordering, double-entry balance, cardinality and organisation-specific business rules — as differentiable penalties with individually adjustable weights.",
      "Uses constrained decoding to emit 1:1, 1:N, N:1 and N:M groups with a per-constraint evidence trail, so an analyst sees which family was violated rather than an undifferentiated rejection.",
      "Isolates the effect of the constraints with a robustness protocol that corrupts 0–75% of reference identifiers, testing whether a model learned keys or learned financial structure.",
    ],
    method: [
      "Ledger, bank, invoice, fee and adjustment records become typed nodes in a transaction graph; a graph encoder proposes candidate groups rather than candidate pairs.",
      "Each constraint family is expressed as a differentiable penalty on the group, so violation is a gradient during training rather than a filter at inference.",
      "A joint objective balances match quality against constraint residual; hyperparameters were selected on validation F1 subject to a 1% constraint-violation ceiling.",
      "Constrained decoding turns scored candidates into a consistent set of groups, with an abstention path that routes low-evidence groups to analysts instead of forcing a match.",
    ],
    setup: [
      { label: "Benchmark", value: "Controlled snapshot following the public BenchRec obfuscated GL / bank matching schema" },
      { label: "Scale", value: "60,000 ledger records, 57,400 bank records, 312,000 blocked candidate pairs" },
      { label: "Split", value: "Chronological 70 / 15 / 15, limiting temporal leakage across accounting periods" },
      { label: "Relationship mix", value: "1:1, 1:N, N:1 and N:M groups, so partial payments and aggregate settlements are represented" },
      { label: "Perturbations", value: "Missing and duplicate records, identifier corruption at 0–75%, time shifts, amount noise, reversals, schema change" },
      { label: "Baselines", value: "Deterministic rules, pairwise neural matcher, graph neural matcher without penalties, and the same matcher with hard post-processing filters" },
      { label: "Runs", value: "Mean of five seeded runs; identical blocking, splits, embedding dimensions and early-stopping budget across neural models" },
      { label: "Environment", value: "PyTorch 2.3, PyTorch Geometric 2.5, OR-Tools 9.10, NVIDIA RTX 4090 24 GB" },
    ],
    results: [
      {
        caption: "Controlled BenchRec-compatible test split",
        columns: ["Model", "Prec. %", "Recall %", "F1 %", "False recon. %", "CVR %", "ECE"],
        rows: [
          { label: "Rule-based", values: ["93.8", "68.4", "79.1", "2.1", "3.9", "0.091"] },
          { label: "Pairwise neural", values: ["87.5", "85.1", "86.3", "6.8", "8.7", "0.074"] },
          { label: "Graph neural", values: ["90.1", "88.3", "89.2", "4.9", "5.6", "0.058"] },
          { label: "Neural + post-filter", values: ["95.0", "85.7", "90.1", "1.4", "0.8", "0.046"] },
          { label: "NeuroRecon", values: ["95.4", "93.8", "94.6", "1.1", "0.6", "0.021"], highlight: true },
        ],
        note: "CVR — constraint-violation rate, the share of accepted groups breaking at least one active rule. Lower is better for false reconciliation, CVR and ECE.",
      },
      {
        caption: "Single-constraint ablation, F1 %",
        columns: ["Configuration", "F1 %", "Δ vs. full"],
        rows: [
          { label: "NeuroRecon (all constraints)", values: ["94.6", "—"], highlight: true },
          { label: "− amount conservation", values: ["91.7", "−2.9"] },
          { label: "− cardinality", values: ["92.1", "−2.5"] },
          { label: "− double-entry balance", values: ["92.6", "−2.0"] },
        ],
        note: "Temporal and business-rule removals cost less individually but consistently. No single constraint accounts for the gain.",
      },
    ],
    findings: [
      "Post-filtering and joint training are not equivalent. A filter can reject a known-bad group but cannot rescue a valid group the neural model ranked low; joint training moves the ranking itself, which is why F1 rises rather than only precision.",
      "Identifier corruption is the diagnostic. As reliable keys disappear the pairwise model falls from 86.3% to 54.7% F1, while NeuroRecon holds 80.6% — evidence it learned financial structure rather than key matching.",
      "Residual violations per 1,000 accepted groups fall from 3.8 to 0.9 for amount and 2.7 to 0.7 for balance, and what remains sits at rounding boundaries or ambiguous reversals — the cases that genuinely warrant a human.",
      "Calibration improves alongside validity: ECE 0.021 against 0.074 for the pairwise model, which matters because reconciliation teams auto-accept above a confidence threshold and that threshold has to mean something.",
      "The ablation shows complementary contributions across all five families, which argues for tunable per-constraint weights rather than a single combined rule score.",
    ],
    limitations: [
      "The quantitative results come from a controlled BenchRec-compatible snapshot. They are not a rerun of the official dataset and not a live enterprise trial, and should not be read as either.",
      "An incomplete constraint formulation, or one weighted too heavily, suppresses genuine exceptions — the failure mode is silent, because a suppressed exception looks like a clean match.",
      "Foreign currency, tax and late adjustment handling require jurisdiction- and organisation-specific allowances that this formulation does not attempt to generalise.",
      "Candidate blocking bounds achievable recall, so a true group that was never blocked in cannot be recovered downstream.",
    ],
    relatedWriting: [
      "neural-models-and-accounting-identities",
      "reconciliation-is-a-graph-problem",
    ],
  },
];

export const byKind = (kind: PublicationKind) =>
  publications
    .filter((p) => p.kind === kind)
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

export const hasAny = (kind: PublicationKind) =>
  publications.some((p) => p.kind === kind);

export const getPublication = (id: string) => publications.find((p) => p.id === id);

/** Entries rich enough to warrant their own page. */
export const detailedPublications = () =>
  publications.filter((p) => p.abstract !== undefined);

/** Chicago-ish single line, used for the copy-citation control. */
export function formatCitation(p: Publication): string {
  const authors = p.authors.join(", ");
  const bits = [`${authors}. "${p.title}."`];
  if (p.venue) bits.push(`${p.venue}${p.year ? `, ${p.year}` : ""}.`);
  else if (p.kind === "in-preparation") bits.push("Manuscript in preparation, 2026.");
  else if (p.year) bits.push(`${p.year}.`);
  if (p.doi) bits.push(`https://doi.org/${p.doi}`);
  else if (p.url) bits.push(p.url);
  return bits.join(" ");
}

/** BibTeX. `@unpublished` for manuscripts — never `@article` for something unpublished. */
export function formatBibtex(p: Publication): string {
  const key = `thadkapally2026${p.short.toLowerCase()}`;
  const lines = [
    `  author  = {${p.authors.join(" and ")}},`,
    `  title   = {${p.title}},`,
    `  year    = {${p.year ?? 2026}},`,
  ];
  if (p.kind === "in-preparation") {
    lines.push(`  note    = {Manuscript in preparation},`);
    return `@unpublished{${key},\n${lines.join("\n")}\n}`;
  }
  if (p.venue) lines.push(`  journal = {${p.venue}},`);
  if (p.doi) lines.push(`  doi     = {${p.doi}},`);
  if (p.url) lines.push(`  url     = {${p.url}},`);
  return `@article{${key},\n${lines.join("\n")}\n}`;
}
