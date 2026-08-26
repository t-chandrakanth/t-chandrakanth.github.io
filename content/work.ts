/**
 * Systems built, organised by domain rather than by employer.
 *
 * Same discipline as the rest of the site: scope and scale only. No internal
 * system names, vendors, contract terms, volumes, thresholds or business rules.
 * Everything here is defensible from the employment record in content/cv.ts.
 */

export type Domain = {
  slug: string;
  name: string;
  /** One line: what class of problem this domain actually poses. */
  problem: string;
  /** Where the work happened. Orgs must exist in content/cv.ts. */
  orgs: string[];
  period: string;
  summary: string;
  built: string[];
  stack: string[];
};

/** The two domains the site actively showcases. */
export const domains: Domain[] = [
  {
    slug: "retail-commerce",
    name: "Retail & e-commerce",
    problem:
      "A catalogue nobody can fully search, a platform too coupled to change safely, and a release cadence that decides how fast the business can move.",
    orgs: ["Walmart Global Tech", "Nebraska Furniture Mart"],
    period: "2020 — present",
    summary:
      "Five years on a commerce platform and now at retail scale. The recurring work is decomposition — taking a system that was one thing and making it several, without losing the guarantees the business had come to rely on — and then building the delivery practice that keeps the pieces shippable.",
    built: [
      "Decomposition of a monolithic commerce platform into a service-oriented architecture, with the migration sequenced so the business kept trading throughout.",
      "Continuous delivery pipelines for Kubernetes-based infrastructure, taking deployment from an event to a routine.",
      "Centralised configuration and secret management across environments, removing the drift that makes staging a poor predictor of production.",
      "Retail correction systems — the machinery that fixes what the happy path got wrong.",
      "Search architecture: the four-stage retrieval, rewriting, ranking and reranking pipeline and its latency budget.",
    ],
    stack: ["Java", "Spring Boot", ".NET Core", "Kafka", "Azure", "Kubernetes", "React"],
  },
  {
    slug: "payments-financial-ops",
    name: "Payments & financial operations",
    problem:
      "Two systems disagree about the same economic event, and the disagreement has to be resolved exactly, explainably, and in a way an auditor will accept.",
    orgs: ["Walmart Global Tech"],
    period: "2025 — present",
    summary:
      "Payment reconciliation at a scale where the exception queue is a staffing decision rather than a bug list. The engineering is event-driven services on one side and data pipelines on the other, joined by an analytics surface that lets finance see that transactions are accurate instead of being told they are.",
    built: [
      "Event-driven services for large-scale payment reconciliation, built on Kafka with Java and Spring Boot.",
      "Financial data pipelines spanning Google BigQuery and SQL Server.",
      "Backend services in .NET along the reconciliation path.",
      "Analytics through Power BI so transaction accuracy and compliance are observable rather than asserted.",
    ],
    stack: ["Kafka", "Java", "Spring Boot", "BigQuery", "SQL Server", ".NET", "Power BI"],
  },
];

/** Earlier domains — real experience, not the current focus. */
export const earlier: { name: string; org: string; period: string; note: string }[] = [
  {
    name: "Healthcare staffing",
    org: "AMN Healthcare",
    period: "2018 — 2020",
    note: "Vendor management workflows rebuilt on .NET Core with a React and Redux front end, and access management consolidated onto OAuth 2.0 and OpenID Connect.",
  },
  {
    name: "HCM & payroll",
    org: "Ultimate Software",
    period: "2018",
    note: "Microservices inside a multi-tenant human capital management product spanning HR, compensation, talent, payroll and time-and-labour management.",
  },
  {
    name: "Telecom provisioning",
    org: "Level 3 Communications",
    period: "2017 — 2018",
    note: "A customer-facing product wizard matching broadband plans and quotes to stated preferences, on Angular and .NET Core Web API.",
  },
];

/** The through-line, stated once so it does not have to be inferred. */
export const throughLine =
  "A commerce catalogue, a staffing platform, a payroll run and a settlement file are the same problem wearing different clothes: two systems hold different beliefs about one event, and something has to decide which is right, exactly and explainably. Having built all four is what makes the pattern visible — and it is why the agent work is the natural next step rather than a change of subject.";
