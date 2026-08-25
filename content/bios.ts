/**
 * Copy-ready biographies for conference organisers, editors and programme
 * committees. Keep all three in sync when the record changes, and keep every
 * sentence defensible — these get pasted into other people's programmes
 * without anyone checking them again.
 */

export const bios = {
  fifty: `Chandrakanth Thadkapally is a senior technical lead working on trustworthy AI for regulated finance. His research covers graph-based financial reconciliation, machine learning under hard accounting constraints, and what an AI agent should be allowed to know inside an audited business.`,

  hundred: `Chandrakanth Thadkapally is a senior technical lead with more than a decade of experience building transaction systems in commerce, healthcare and financial operations. His research programme, published at The Reconciliation Layer, covers graph-based financial reconciliation, constraint-aware and neuro-symbolic modelling under accounting identities, enterprise AI privacy beyond data masking, and the governance evidence an AI-mediated control has to emit to survive audit. He holds an M.S. in Computer Science from the University of Central Missouri and writes about the intersection of applied machine learning and regulated finance.`,

  twoFifty: `Chandrakanth Thadkapally is a senior technical lead who works on the parts of enterprise systems where a plausible answer is not good enough. Over more than a decade he has built and led transaction-processing platforms across retail commerce, healthcare claims and vendor management, including the decomposition of a monolithic commerce platform into a service-oriented architecture and the delivery practice around it.

His research programme sits at an intersection three fields keep leaving empty. Graph learning has the right representation for transaction correspondence but is rarely evaluated under accounting constraints. Neuro-symbolic methods have the right machinery for hard identities but are rarely tested at enterprise scale. AI governance has the right vocabulary for control but is almost always written as policy rather than as something a control tester can test. His work covers all three: heterogeneous temporal graphs for reconciliation, the four places a hard constraint can actually be enforced in a learned model, disclosure risk that survives data masking, and least-privilege context design for agents operating inside audited processes.

He publishes essays at The Reconciliation Layer, where every piece uses synthetic data, ships with an original diagram, and states its own limits. He holds an M.S. in Computer Science from the University of Central Missouri and a B.Tech. in Computer Science from Jawaharlal Nehru Technological University.`,
} as const;

export const bioLengths = [
  { key: "fifty", label: "50 words" },
  { key: "hundred", label: "100 words" },
  { key: "twoFifty", label: "250 words" },
] as const;
