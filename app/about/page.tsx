import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { DataRow, Kicker, SectionHead, Shell } from "@/components/primitives";
import { bios, bioLengths } from "@/content/bios";
import { currentPosition, expertise, roles } from "@/content/cv";
import { liveProfiles, site } from "@/lib/site";
import { duration } from "@/lib/format";

export const metadata: Metadata = {
  title: "About",
  description: `${site.name} — engineering leader building enterprise AI agents. Narrative biography, scope of work across retail, payments and enterprise systems, areas of depth, and copy-ready bios for organisers.`,
  alternates: { canonical: "/about" },
};

const HEADSHOT = "/headshot.jpg";
const hasHeadshot = () => fs.existsSync(path.join(process.cwd(), "public", "headshot.jpg"));

export default function AboutPage() {
  const current = currentPosition();
  const headshot = hasHeadshot();

  return (
    <Shell width="wide" className="pt-14 pb-24 sm:pt-20">
      {/* ---------------- narrative ---------------- */}
      <header className="max-w-[52rem]">
        <Kicker className="text-accent reveal">About</Kicker>
        <h1
          className="display reveal mt-5 text-[clamp(2.4rem,1.5rem+3.6vw,4.2rem)]"
          style={{ animationDelay: "60ms" }}
        >
          {site.name}
        </h1>
        <p
          className="text-ink-muted reveal mt-6 max-w-[34ch] text-[clamp(1.15rem,1rem+0.8vw,1.6rem)] leading-[1.28] tracking-[-0.019em]"
          style={{ animationDelay: "120ms" }}
        >
          {site.tagline}
        </p>
      </header>

      <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,47rem)_minmax(0,19rem)] lg:justify-between lg:gap-16">
        <div className="min-w-0 max-w-[46rem]">
          <div className="prose">
            <p>
              I have spent over a decade building the systems that move money and
              records between organisations — retail commerce platforms, payment
              reconciliation, healthcare staffing, HCM and payroll, telecom
              provisioning. Different industries, one recurring shape: two systems
              believe different things about the same event, and something has to
              decide which belief is right.
            </p>
            <p>
              For most of that time the deciding was done by rules, and by people
              working the cases the rules could not. Rules are excellent at what
              somebody anticipated. They degrade quietly on what nobody did, and
              the degradation does not announce itself — it arrives as a slowly
              growing exception queue, and the size of that queue becomes the cost
              of the system rather than a signal about it.
            </p>
            <p>
              What has changed is that we can now put a model in that seat, and
              increasingly an agent: something that plans, calls tools, and acts
              without a human between each step. That is the most interesting
              engineering problem I have worked on and the one with the least
              settled practice around it.
            </p>
            <p>
              Most of the attention goes to the model. Almost none goes to the ring
              of code around it — the tool surface, what gets into the context
              window and why, the control loop, what happens when a call fails.
              I have come to think that ring, the{" "}
              <Link href="/writing/the-agent-harness">harness</Link>, explains more
              of the variance between two teams&rsquo; results than the choice of
              model does. It is also the part nobody designs deliberately.
            </p>
            <p>
              The second gap is verification. An agent that is right most of the
              time is a demo, not a system, and in most real work there is no gold
              label to check it against —{" "}
              <Link href="/writing/evaluating-agents-without-ground-truth">
                two experienced reviewers disagree
              </Link>
              , so accuracy is undefined before you start. The third is control and
              confidentiality: what did the system disclose, and what evidence
              exists that it operated correctly. Data masking answers neither. An
              AI policy answers neither.
            </p>
            <p>
              I work these questions out in payments and reconciliation, because it
              is the domain least willing to accept a confident guess. My current
              work at Walmart Global Tech is payment reconciliation and retail
              correction at scale — event-driven services, financial data pipelines,
              and the analytics surface finance uses to confirm that transactions
              are accurate. It produced two manuscripts,{" "}
              <Link href="/publications/recongraph">ReconGraph</Link> and{" "}
              <Link href="/publications/neurorecon">NeuroRecon</Link>, both complete
              and neither submitted anywhere yet.
            </p>
            <p>
              The breadth matters more than it looks. A commerce catalogue, a
              staffing platform, a payroll run and a settlement file are the same
              problem wearing different clothes, and having built all four is what
              makes the pattern visible. What generalises is the shape of the
              failure, not the schema.
            </p>
            <p>
              Everything on this site uses synthetic data, describes classes of
              problem rather than any specific employer&rsquo;s systems, and states
              what it does not know. If you work on any of this, I would like to
              hear from you.
            </p>
          </div>

          {/* ---------------- what I actually do ---------------- */}
          <section className="mt-20">
            <SectionHead
              n={1}
              label="What I actually do"
              intro="Described by scope and scale. No employer internals appear on this site — not paraphrased, not anonymised."
            />
            <dl>
              <DataRow label="Current role">
                {current.title}, {current.org} — since November 2025.{" "}
                {roles[0].summary}
              </DataRow>
              <DataRow label="Focus">
                Enterprise AI agents and AI architecture — harness design, tool
                surfaces, evaluation without ground truth, and the control evidence
                an autonomous process has to emit before anyone can rely on it.
              </DataRow>
              <DataRow label="Scope">
                Technical direction and architecture across multiple delivery teams;
                design review, technical strategy, and engineer development. Twelve
                years across application development, senior individual contribution
                and technical leadership.
              </DataRow>
              <DataRow label="Domains">
                Retail and e-commerce, and payments and financial operations, are
                where I go deepest. Earlier work spans healthcare staffing, HCM and
                payroll, and telecom provisioning — see{" "}
                <Link href="/work" className="link-rule text-ink">
                  systems built
                </Link>
                .
              </DataRow>
              <DataRow label="Research">
                Independent, self-directed, and published here. See the{" "}
                <Link href="/research" className="link-rule text-ink">
                  research programme
                </Link>{" "}
                for current projects and their honest statuses.
              </DataRow>
              <DataRow label="Not on this site">
                Internal system names, architecture, vendors, contract terms,
                volumes, thresholds, business rules, incident detail or internal
                metrics.
              </DataRow>
            </dl>
          </section>

          {/* ---------------- where I go deep ---------------- */}
          <section className="mt-20">
            <SectionHead n={2} label="Where I go deep" />
            <div className="grid gap-x-10 sm:grid-cols-2">
              {expertise.map((group) => (
                <div key={group.heading} className="border-t border-rule py-6">
                  <h3 className="text-[1.05rem] tracking-[-0.012em]">{group.heading}</h3>
                  <ul className="mt-3 space-y-1.5">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="text-ink-muted relative pl-4 text-[0.925rem] leading-relaxed before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2 before:bg-rule-strong"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ---------------- rail ---------------- */}
        <aside className="min-w-0 lg:pt-2">
          <div className="lg:sticky lg:top-24">
            {headshot ? (
              <div className="rounded-[18px] border border-rule bg-paper-raised p-2">
                <Image
                  src={HEADSHOT}
                  alt={`${site.name}`}
                  width={640}
                  height={800}
                  className="h-auto w-full"
                  priority
                />
              </div>
            ) : null}

            <div className={headshot ? "mt-8" : ""}>
              <Kicker className="border-t border-rule pt-3">Contact</Kicker>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a href={`mailto:${site.email}`} className="link-quiet text-ink-muted text-[0.95rem] [overflow-wrap:anywhere]">
                    {site.email}
                  </a>
                </li>
                {liveProfiles().map((p) => (
                  <li key={p.label}>
                    <a
                      href={p.href}
                      target="_blank"
                      rel="me noopener"
                      className="link-quiet text-ink-muted text-[0.95rem]"
                    >
                      {p.label}
                      <span aria-hidden="true" className="ml-1 opacity-60">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <Kicker className="border-t border-rule pt-3">Elsewhere on this site</Kicker>
              <ul className="mt-4 space-y-2.5">
                {[
                  { href: "/cv", label: "Full CV" },
                  { href: "/research", label: "Research programme" },
                  { href: "/publications", label: "Publications" },
                  { href: "/writing", label: "Writing" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-quiet text-ink-muted text-[0.95rem]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* ---------------- press kit ---------------- */}
      <section className="mt-24">
        <SectionHead
          n={3}
          label="For organisers"
          title="Copy-ready biography"
          intro="Three lengths, kept in sync with the record. Use whichever fits your programme; no attribution or approval needed."
        />
        <div className="grid gap-px overflow-hidden rounded-[18px] border border-rule bg-rule lg:grid-cols-2">
          <div className="grid gap-px bg-rule">
            {bioLengths.slice(0, 2).map(({ key, label }) => (
              <div key={key} className="flex flex-col bg-paper p-6">
                <div className="flex items-center justify-between gap-4 border-b border-rule pb-3">
                  <Kicker>{label}</Kicker>
                  <CopyButton value={bios[key]} />
                </div>
                <p className="text-ink-muted mt-4 flex-1 text-[0.925rem] leading-relaxed whitespace-pre-line">
                  {bios[key]}
                </p>
              </div>
            ))}
          </div>
          {bioLengths.slice(2).map(({ key, label }) => (
            <div key={key} className="flex flex-col bg-paper p-6">
              <div className="flex items-center justify-between gap-4 border-b border-rule pb-3">
                <Kicker>{label}</Kicker>
                <CopyButton value={bios[key]} />
              </div>
              <p className="text-ink-muted mt-4 flex-1 text-[0.925rem] leading-relaxed whitespace-pre-line">
                {bios[key]}
              </p>
            </div>
          ))}
        </div>
        {!headshot ? (
          <p className="text-ink-faint mt-6 text-[0.85rem] ">
            A high-resolution headshot is available on request —{" "}
            <a href={`mailto:${site.email}`} className="link-rule text-ink-muted">
              email me
            </a>
            .
          </p>
        ) : null}
      </section>
    </Shell>
  );
}
