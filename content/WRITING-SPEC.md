# House style — The Control Loop

This file is the contract every post on this site is written against. It exists
so that a piece written six months from now still sounds like the one written
today.

## Anatomy of a post

Seven movements, in this order, with these budgets:

| # | Movement | Words | What it does |
|---|---|---|---|
| 1 | The failure | 150–250 | A concrete scene where the obvious approach produced a wrong answer. No preamble, no "in today's world". |
| 2 | Why the obvious fix fails | 200–350 | The reader's first instinct, taken seriously, and the structural reason it does not work. |
| 3 | The reframe | 150–250 | The change of frame the rest of the piece depends on. Contains the quotable sentence. |
| 4 | The mechanism | 600–1200 | The actual content. Sub-headed. Formal where formality earns its place. |
| 5 | A worked example | 300–600 | Synthetic data, explicitly labelled, with the numbers that make the mechanism concrete. |
| 6 | Limits | 120–200 | Three honest ones. What this does not solve, what is not novel, what is unproven. |
| 7 | Where this goes | 80–150 | The next piece in the pillar, and the question to hold onto. |

Total 1,700–2,600 words. Under 1,500 means it was not worth publishing.

## Voice

- **Declarative.** State the thing. Do not warm up to it.
- **Second person sparingly**, first person when the claim is personal ("I have
  been calling this…", "I am not claiming to have solved it").
- **British-leaning spelling** (`modelling`, `behaviour`, `organisation`,
  `analyse`, `tokenised`) — consistent with the rest of the site.
- **No hedging stacks.** "may potentially be able to" is three hedges; pick one.
- **No LLM tics.** Never: "delve", "landscape", "realm", "leverage" as a verb,
  "it's important to note", "in today's fast-paced", "game-changer",
  "unlock", "harness the power", "robust and scalable" as a pair, "moreover",
  "furthermore", em-dash-comma pileups, or a closing paragraph that begins
  "In conclusion".
- **No rhetorical question openings.** No "Have you ever wondered".
- **Concrete nouns beat abstract ones.** "the exception queue" beats "the
  process". "fourteen-day settlement cycle" beats "certain temporal patterns".
- Sentences vary in length. A short one lands a point. A longer one carries the
  argument through its qualifications and out the other side without losing the
  reader.

## Hard rules

1. **Nothing employer-confidential.** No internal system names, vendor names,
   architecture, contract terms, volumes, revenue, thresholds, business rules,
   incident details, internal metrics or screenshots — not paraphrased, not
   anonymised. Write about the *class* of problem, never the instance.
2. **All data synthetic and labelled.** Every post with numbers includes the
   `<Synthetic />` component before the first figure.
3. **No status inflation.** Do not describe unpublished work as published, or a
   framework as a result. If it is a hypothesis, say hypothesis.
4. **Patent-sensitive material stays out.** Problem statements are fine.
   Mechanisms, scoring formulations and implementation detail for BCLS, the
   Context Firewall, cumulative-disclosure *detection*, and AICEP are withheld
   until a provisional application is on file. Describing that cumulative
   disclosure *exists* is fine — it is textbook composition. Describing *how to
   detect it cheaply* is not.
5. **Every claim about the record is precisely true as written.**
6. **Cite honestly.** If an idea has a literature, say so and name it. Claiming
   framing, not results, is the safe and accurate posture.

## Every post ships with

- One original diagram, as inline SVG inside `<Figure>`, that shows a mechanism
  rather than decorating the page.
- One quotable sentence, in the `quotable` frontmatter field and in the body.
- Correct maths where maths is used (`$inline$`, `$$display$$`, KaTeX).
- Two to four internal links to other posts or to `/research`.
- A limits section that a hostile reviewer would accept.

## Frontmatter

```yaml
---
title: "Sentence case, no trailing period"
description: "One or two sentences. This is the standfirst and the meta description. 120–200 characters."
date: "2026-08-25"
pillar: "P3"          # exactly one of P1..P6
order: 3              # tiebreak within a date; lower sorts first
quotable: "The one sentence worth lifting out."
tags:
  - lower case topic terms
  - three to five of them
---
```

## MDX syntax notes

The body is JSX, not HTML. This trips people up:

- `className`, not `class`. `strokeWidth`, not `stroke-width`. `fontFamily`,
  not `font-family`.
- No `<!-- HTML comments -->`. Use `{/* JSX comments */}` or none.
- A bare `<` or `{` in prose must be written as `&lt;` or `` `{` `` in code.
- Self-close void elements: `<br />`, `<hr />`.
- Component props that take markup use braces:
  `<Ledger left={<ul><li>…</li></ul>} right={…} />`.
- Blank line before and after every JSX block.

## Components available without importing

| Component | Use |
|---|---|
| `<Figure n={1} caption="…">…</Figure>` | Wraps a diagram. Caption is mandatory and must explain what the picture shows. |
| `<Callout label="…" tone="neutral\|warning\|verified">…</Callout>` | A boxed aside. Three per post is already too many. |
| `<KeyLine>…</KeyLine>` | The quotable sentence, set large. Exactly one per post. |
| `<Synthetic />` | The synthetic-data label. Required before any figures. |
| `<Ledger leftLabel="…" rightLabel="…" left={…} right={…} />` | Two-column comparison. |

## Diagrams

Inline SVG only. Use the theme variables so the figure works in both themes:

- Strokes and fills: `var(--ink-faint)`, `var(--ink-muted)`, `var(--rule)`,
  `var(--rule-strong)`
- Emphasis: `var(--accent)`; problems and variances: `var(--variance)`;
  in-flight or partial: `var(--pending)`
- Never hard-code `#000`, `#fff`, `black` or `white`.
- Labels: `fontFamily="var(--font-mono)"` at `fontSize="9"`–`"10"` with
  `letterSpacing="1.2"` for small-caps-style labels.
- Give the `<svg>` a `viewBox`, `className="w-full h-auto"`, `role="img"` and a
  real `aria-label` describing what the diagram shows.
- Keep it under ~300 units tall and roughly 2.5:1. Diagrams are read at
  700–760px wide.
