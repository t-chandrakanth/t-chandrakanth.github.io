# chandrakanth.dev

Personal engineering and research site — **The Control Loop**.
Next.js 16 (App Router) + TypeScript + Tailwind v4 + MDX, deployed on Vercel.

## Run it

```sh
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run export       # static export to ./out (EXPORT_MODE=static)
```

Node 20+ required.

## Where things live

| Path | What |
|---|---|
| `app/` | Routes. One directory per page; `writing/[slug]` renders MDX posts. |
| `components/` | UI. `primitives.tsx` holds the shared vocabulary (Kicker, Rule, Stamp, SectionHead, Shell). |
| `components/mdx.tsx` | Components available inside every post without an import. |
| `content/writing/*.mdx` | The posts. One file per essay. |
| `content/pillars.ts` | The six content pillars. Every post declares exactly one. |
| `content/work.ts` | Systems built, by domain. Backs `/work`. |
| `content/research.ts` | The research programme and its status vocabulary. |
| `content/publications.ts` | The citable record. |
| `content/cv.ts` | Roles, education, expertise. |
| `content/bios.ts` | Copy-ready 50/100/250-word biographies. |
| `content/WRITING-SPEC.md` | **House style. Read before writing a post.** |
| `lib/site.ts` | Identity, navigation, outbound profiles. |
| `lib/posts.ts` | Reads and validates post frontmatter at build time. |
| `lib/og.tsx` | Social card renderer. |
| `assets/fonts/` | TTFs used by the OG image renderer (not served). |

## Adding a post

1. Create `content/writing/<slug>.mdx`.
2. Frontmatter — `title`, `description`, `date`, `pillar` are required; the build
   fails loudly if any is missing or if `pillar` is not one of `P1`–`P6`.

   ```yaml
   ---
   title: "Sentence case, no trailing period"
   description: "The standfirst and the meta description. 120–200 characters."
   date: "2026-09-08"
   pillar: "P3"
   order: 10
   quotable: "The one sentence worth lifting out."
   tags: [enterprise ai privacy, disclosure risk]
   ---
   ```

3. Write it against `content/WRITING-SPEC.md`. Seven movements, 1,700–2,600
   words, one original diagram, one quotable line, honest limits.
4. `draft: true` keeps a post out of production while leaving it visible in
   `npm run dev`.

Everything else — the index, RSS, sitemap, JSON-LD, social card, related posts,
prev/next — follows from the frontmatter. There is nothing else to register.

## Configuration

| Variable | Effect |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Defaults to `https://chandrakanth.dev`. Set this on Vercel to the domain actually in use. |
| `EXPORT_MODE=static` | Switches to `output: "export"` for a fully static build. |

## House rules baked into the code

- **No employer internals, anywhere.** Roles are described by scope and scale.
- **All data synthetic and labelled.** Posts with numbers carry `<Synthetic />`.
- **Statuses do not inflate.** `content/research.ts` documents the six permitted
  status values and what each one requires as evidence.
- **Patent-sensitive mechanisms stay unpublished.** Projects flagged
  `patentSensitive` render the problem statement only. Public disclosure
  destroys novelty; the flag is not decoration.
- **Empty sections stay empty and say so.** An honest gap reads better than a
  padded one, and this site's whole value is that its claims check out.

## Deployment

Pushes to `main` deploy to production on Vercel. Preview deployments are created
for every other branch.

## Licence

Code is MIT (see `LICENSE`). Prose and diagrams under `content/` are
© Chandrakanth Thadkapally, all rights reserved.
