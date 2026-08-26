/**
 * Copy-ready biographies for conference organisers, editors and programme
 * committees. Keep all three in sync when the record changes, and keep every
 * sentence defensible — these get pasted into other people's programmes
 * without anyone checking them again.
 */

export const bios = {
  fifty: `Chandrakanth Thadkapally is a senior technical lead building enterprise AI agents and the architecture around them. His work covers agent harness design, evaluating autonomous systems when no ground truth exists, and the control evidence an AI-mediated process has to emit in an audited environment.`,

  hundred: `Chandrakanth Thadkapally is a senior technical lead with over twelve years of experience building large-scale transaction and commerce systems across retail, payments, healthcare staffing, HCM and telecom. He now works on enterprise AI agents: harness design, tool interfaces, evaluation without a gold label, and the governance evidence autonomous systems need before anyone can rely on them. He writes at The Control Loop, holds an M.S. in Computer Science from the University of Central Missouri, and has two manuscripts in preparation on graph-based and constraint-aware approaches to financial reconciliation.`,

  twoFifty: `Chandrakanth Thadkapally is a senior technical lead who works on the parts of enterprise systems where a plausible answer is not good enough. Over twelve years he has built and led transaction-processing and commerce platforms across retail and e-commerce, payments and financial operations, healthcare staffing, human capital management, and telecom provisioning — including the decomposition of a monolithic commerce platform into a service-oriented architecture, and the delivery practice around it.

His current work is enterprise AI agents and the architecture that makes them safe to run. Most attention in the field goes to the model; he argues that the ring of code around it — the tool surface, what enters the context window, the control loop, what happens when a call fails — explains more of the variance between two teams' results than the choice of model does, and is the part nobody designs deliberately. Alongside it he works on two problems the field has not settled: how to evaluate an autonomous system when experienced reviewers disagree and no gold label exists, and what evidence an AI-mediated process has to produce before a control tester will accept it.

He works these questions out in payments and reconciliation, the domain least willing to accept a confident guess, which has produced two manuscripts in preparation on graph-based and constraint-aware approaches. He publishes essays at The Control Loop, where every piece uses synthetic data, ships with an original diagram, and states its own limits. He holds an M.S. in Computer Science from the University of Central Missouri.`,
} as const;

export const bioLengths = [
  { key: "fifty", label: "50 words" },
  { key: "hundred", label: "100 words" },
  { key: "twoFifty", label: "250 words" },
] as const;
