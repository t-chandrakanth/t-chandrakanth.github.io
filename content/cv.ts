/**
 * Curriculum vitae — the factual record.
 *
 * Source of truth: the LinkedIn profile. Orgs, titles, dates and locations here
 * match it line for line, so anyone checking one against the other finds the
 * same record. Roles are described by scope and scale, never by employer
 * internals — no system names, vendors, thresholds, volumes or business rules.
 */

export type Position = {
  title: string;
  start: string;
  end: string | "Present";
  location?: string;
};

export type Role = {
  org: string;
  /** Newest first. More than one entry renders as a title history under one org. */
  positions: Position[];
  summary: string;
  highlights: string[];
};

export const roles: Role[] = [
  {
    org: "Walmart Global Tech",
    positions: [
      {
        title: "Senior Software Engineer",
        start: "2025-11",
        end: "Present",
        location: "Bentonville, Arkansas",
      },
    ],
    summary:
      "Payment reconciliation and retail correction systems at retail scale — event-driven services, financial data pipelines, and the analytics surface finance uses to confirm that transactions are accurate.",
    highlights: [
      "Design event-driven services on Kafka, Java and Spring Boot supporting large-scale payment reconciliation and retail correction.",
      "Build financial data pipelines across Google BigQuery and SQL Server.",
      "Develop backend services in .NET along the reconciliation path.",
      "Deliver analytics through Power BI so transaction accuracy and compliance are observable rather than asserted.",
    ],
  },
  {
    org: "Nebraska Furniture Mart",
    positions: [
      {
        title: "Senior Technical Lead",
        start: "2024-03",
        end: "2025-11",
        location: "Missouri",
      },
      {
        title: "Senior Programmer Analyst",
        start: "2021-09",
        end: "2024-03",
        location: "Omaha, Nebraska",
      },
      {
        title: "Application Developer",
        start: "2020-09",
        end: "2021-09",
        location: "Omaha, Nebraska",
      },
    ],
    summary:
      "Five years across the commerce platform, from application development through technical leadership — architecture, cloud migration, and the delivery practice around a multi-team engineering organisation.",
    highlights: [
      "Led the decomposition of a monolithic commerce platform into a service-oriented architecture on .NET Core and Azure.",
      "Centralised configuration and secret management across cloud environments, tightening access control and removing drift between environments.",
      "Designed continuous delivery pipelines for Kubernetes-based infrastructure, materially shortening deployment lead time.",
      "Set the code review and mentoring practice as technical lead; responsible for technical direction, design review and engineer development.",
    ],
  },
  {
    org: "AMN Healthcare",
    positions: [
      {
        title: "Application Developer",
        start: "2018-10",
        end: "2020-09",
        location: "Omaha, Nebraska",
      },
    ],
    summary:
      "Application development for healthcare staffing and vendor management workflows.",
    highlights: [
      "Rebuilt core vendor-management workflows on .NET Core with a React and Redux front end.",
      "Implemented OAuth 2.0 and OpenID Connect authentication, consolidating access management across the platform.",
      "Introduced automated build and release pipelines, removing manual steps from the deployment path.",
    ],
  },
  {
    org: "Ultimate Software",
    positions: [
      {
        title: "Software Developer",
        start: "2018-02",
        end: "2018-09",
        location: "Weston, Florida",
      },
    ],
    summary:
      "Microservice development within a cloud human capital management product spanning HR, compensation, talent, payroll and time-and-labour management.",
    highlights: [
      "Developed microservices in .NET for a large multi-tenant HCM platform.",
      "Worked across the HR, payroll and time-and-labour product surfaces.",
    ],
  },
  {
    org: "Level 3 Communications",
    positions: [
      {
        title: "Software Developer",
        start: "2017-11",
        end: "2018-02",
        location: "Denver, Colorado",
      },
    ],
    summary:
      "Customer-facing provisioning tools for high-speed broadband networking plans.",
    highlights: [
      "Built a product wizard surfacing plans and quotes matched to customer preferences.",
      "Developed the web application and supporting services on Angular and .NET Core Web API.",
    ],
  },
];

/** Earliest and latest dates across an org's positions. */
export const roleSpan = (r: Role) => {
  const starts = r.positions.map((p) => p.start).sort();
  const ends = r.positions.map((p) => p.end);
  return {
    start: starts[0],
    end: ends.includes("Present") ? ("Present" as const) : ends.sort().reverse()[0],
  };
};

export const currentPosition = () => ({
  org: roles[0].org,
  ...roles[0].positions[0],
});

export type Education = {
  institution: string;
  credential: string;
  start: string;
  end: string;
  note?: string;
};

export const education: Education[] = [
  {
    institution: "University of Central Missouri",
    credential: "M.S., Computer Science",
    start: "2015",
    end: "2017",
  },
];

export const expertise = [
  {
    heading: "Agentic AI & LLM systems",
    items: [
      "Agent harness design — tool surfaces, context assembly, control loops",
      "Autonomous coding systems and multi-step agent orchestration (LangGraph)",
      "Evaluation where ground truth is contested or absent",
    ],
  },
  {
    heading: "Distributed & event-driven systems",
    items: [
      "Service decomposition and platform migration",
      "Event-driven architecture on Kafka; Spring Boot and .NET services",
      "Kubernetes-based delivery, CI/CD, environment parity",
    ],
  },
  {
    heading: "Data & analytics platforms",
    items: [
      "Financial data pipelines across BigQuery and SQL Server",
      "Reconciliation and correction systems at retail scale",
      "Analytics surfaces that make correctness observable (Power BI)",
    ],
  },
  {
    heading: "Languages & platforms",
    items: [
      "Java, C#/.NET, TypeScript, Python, SQL",
      "Spring Boot, React, Angular, Entity Framework",
      "Azure, Google Cloud, AWS, Docker, Kubernetes",
    ],
  },
];

/**
 * Sections that exist structurally but are empty until there is something
 * true to put in them. Rendering an empty section with an honest note reads
 * better than pretending the section does not exist.
 */
export const speaking: { title: string; venue: string; date: string; href?: string }[] = [];
export const service: { role: string; venue: string; period: string; note?: string }[] = [];
export const awards: { title: string; issuer: string; date: string; note?: string }[] = [];
