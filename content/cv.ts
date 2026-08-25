/**
 * Curriculum vitae — the factual record.
 *
 * Rule for this file: everything here must be defensible from a document
 * someone else issued. Roles are described by scope and scale, never by
 * employer internals — no system names, vendors, thresholds, volumes or
 * business rules.
 */

export type Role = {
  org: string;
  title: string;
  start: string;
  end: string | "Present";
  location?: string;
  summary: string;
  highlights: string[];
};

export const roles: Role[] = [
  {
    org: "Nebraska Furniture Mart",
    title: "Senior Technical Lead",
    start: "2020-09",
    end: "Present",
    summary:
      "Technical leadership for commerce platform engineering — architecture, cloud migration and delivery practice across a multi-team engineering organisation.",
    highlights: [
      "Led the decomposition of a monolithic commerce platform into a service-oriented architecture on .NET Core and Azure, with measurable improvement in platform stability and application responsiveness.",
      "Centralised configuration and secret management across cloud environments, tightening access control and removing configuration drift between environments.",
      "Designed continuous delivery pipelines for Kubernetes-based infrastructure, roughly halving deployment lead time.",
      "Set the code review and mentoring practice for the team; responsible for technical direction, design review and engineer development.",
    ],
  },
  {
    org: "Medefis (AMN Healthcare)",
    title: ".NET Developer",
    start: "2019-01",
    end: "2020-09",
    summary:
      "Modernisation of a vendor management platform serving healthcare staffing workflows.",
    highlights: [
      "Rebuilt core workflows on .NET Core with a React and Redux front end, replacing a legacy interface with a scalable component architecture.",
      "Implemented OAuth 2.0 and OpenID Connect authentication, consolidating access management across the platform.",
      "Introduced automated build and release pipelines, removing manual steps from the deployment path.",
    ],
  },
  {
    org: "CareSource",
    title: ".NET Developer",
    start: "2018-07",
    end: "2019-01",
    summary: "Service architecture and data performance for healthcare claims applications.",
    highlights: [
      "Designed and implemented a microservice architecture for healthcare applications, streamlining data transactions between systems.",
      "Applied query and indexing optimisation to materially improve database read performance.",
      "Established a unit testing framework and raised coverage on the critical transaction paths.",
    ],
  },
  {
    org: "Ultimate Software",
    title: ".NET Developer",
    start: "2017-01",
    end: "2018-06",
    summary: "API and front-end engineering within a large HCM product organisation.",
    highlights: [
      "Built REST services integrated over a message broker to support asynchronous communication between services.",
      "Rebuilt front-end components in Angular, improving page performance and interaction quality.",
      "Automated deployment workflows, reducing downtime during releases.",
    ],
  },
  {
    org: "Tessitura Network",
    title: ".NET Developer",
    start: "2016-11",
    end: "2017-12",
    summary: "Online ticketing and event commerce for arts and cultural organisations.",
    highlights: [
      "Engineered an online ticketing solution on .NET Core and Angular, optimising the transaction path through checkout.",
      "Implemented serverless request processing on AWS API Gateway and Lambda, reducing standing infrastructure.",
      "Built an event-driven order processing pipeline on managed queues.",
    ],
  },
  {
    org: "KBS Technologies",
    title: ".NET Developer",
    start: "2014-06",
    end: "2015-08",
    summary: "Healthcare record systems and integration services.",
    highlights: [
      "Developed a patient management system on ASP.NET and SQL Server.",
      "Designed and deployed SOAP and REST integration services between healthcare providers.",
      "Improved interaction responsiveness through asynchronous UI patterns.",
    ],
  },
];

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
    end: "2016",
  },
  {
    institution: "Jawaharlal Nehru Technological University",
    credential: "B.Tech., Computer Science",
    start: "2010",
    end: "2014",
  },
];

export const expertise = [
  {
    heading: "Distributed systems",
    items: [
      "Service decomposition and platform migration",
      "Event-driven architecture and asynchronous processing",
      "Kubernetes-based delivery, CI/CD, environment parity",
    ],
  },
  {
    heading: "Machine learning for regulated domains",
    items: [
      "Graph representation for correspondence and lineage",
      "Constrained and neuro-symbolic modelling under hard identities",
      "Evaluation design where ground truth is contested or absent",
    ],
  },
  {
    heading: "AI governance and privacy",
    items: [
      "Threat modelling for enterprise AI assistants and agents",
      "Least-privilege context design and disclosure risk analysis",
      "Control evidence for AI-mediated processes in audited environments",
    ],
  },
  {
    heading: "Languages and platforms",
    items: [
      "C#, TypeScript, Python, SQL",
      ".NET Core, React, Angular, Entity Framework",
      "Azure, AWS, Docker, Kubernetes, Azure DevOps",
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
