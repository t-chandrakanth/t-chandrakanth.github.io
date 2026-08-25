import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { DataRow, Kicker, SectionHead, Shell } from "@/components/primitives";
import { bios, bioLengths } from "@/content/bios";
import { expertise, roles } from "@/content/cv";
import { liveProfiles, site } from "@/lib/site";
import { duration } from "@/lib/format";

export const metadata: Metadata = {
  title: "About",
  description: `${site.name} — senior technical lead working on trustworthy AI for regulated finance. Narrative biography, scope of work, areas of depth, and copy-ready bios for organisers.`,
  alternates: { canonical: "/about" },
};

const HEADSHOT = "/headshot.jpg";
const hasHeadshot = () => fs.existsSync(path.join(process.cwd(), "public", "headshot.jpg"));

export default function AboutPage() {
  const current = roles[0];
  const years = new Date().getUTCFullYear() - 2014;
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
          className="reveal mt-6 max-w-[34ch] text-[clamp(1.15rem,1rem+0.8vw,1.6rem)] leading-[1.28] tracking-[-0.014em] italic"
          style={{ animationDelay: "120ms" }}
        >
          {site.tagline}
        </p>
      </header>

      <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,47rem)_minmax(0,19rem)] lg:justify-between lg:gap-16">
        <div className="max-w-[46rem]">
          <div className="prose">
            <p>
              I have spent more than {years} years building the systems that move
              money and records between organisations — retail commerce
              platforms, healthcare claims processing, vendor management,
              ticketing. Different industries, one recurring shape: two parties
              believe different things about the same event, and something has
              to decide which belief is right.
            </p>
            <p>
              For most of that time the deciding was done by rules. Rules are
              excellent at the cases somebody anticipated. They degrade quietly
              on the cases nobody did, and the degradation does not announce
              itself — it arrives as a slowly growing exception queue that a
              team of people works down every month, and the size of that queue
              becomes the cost of the system rather than a signal about it.
            </p>
            <p>
              Machine learning is the obvious response and, applied naively, the
              wrong one. A model that gets 97% of matches right in a domain
              where the sum of the parts is definitionally the whole has not
              solved 97% of the problem. It has produced a population of
              exceptions with no explanation attached, and it has broken the one
              property the finance function actually depends on: that the
              numbers reconcile exactly, and that you can say why.
            </p>
            <p>
              That gap is what I work on now. It has three parts, and I have
              found that they are the same problem seen from different angles.
            </p>
            <p>
              The first is <strong>representation</strong>. Reconciliation is
              modelled almost everywhere as pairwise matching, which assumes a
              one-to-one correspondence that real settlement does not have.
              Split payments, aggregated remittances, partial settlement and
              out-of-order timing are not edge cases; they are the ordinary case,
              and they are naturally a graph. I write about that under{" "}
              <Link href="/writing?pillar=P1">financial graph intelligence</Link>.
            </p>
            <p>
              The second is <strong>constraint</strong>. Accounting identities
              are not soft preferences you can regularise towards. A learned
              model has to satisfy them exactly, and there are only four places
              in a pipeline where a hard constraint can actually be enforced.
              Which one you choose determines what you give up.
            </p>
            <p>
              The third is <strong>confidentiality and control</strong>. Once you
              put a model between a person and the ledger, two new questions
              appear that the machine-learning literature mostly does not ask:
              what did the system disclose, and what evidence exists that it
              operated correctly. Data masking answers neither. An AI policy
              answers neither. I have been working on both — on disclosure risk
              that survives masking, and on what an AI-mediated control has to
              emit before a control tester will accept it.
            </p>
            <p>
              Two manuscripts came out of the first two strands —{" "}
              <Link href="/publications/recongraph">ReconGraph</Link>, on
              reconciliation as probabilistic inference over a heterogeneous
              temporal graph, and{" "}
              <Link href="/publications/neurorecon">NeuroRecon</Link>, on putting
              accounting constraints into the training objective rather than into
              a filter that runs afterwards. Both are complete and neither has
              been submitted anywhere yet; the abstracts, methods and full result
              tables are on this site.
            </p>
            <p>
              I write here because the intersection is underpopulated. There is
              excellent work in graph learning, excellent work in neuro-symbolic
              methods, and a great deal of writing about AI governance. There is
              very little that takes all three seriously at once, in a domain
              where being approximately right is a finding.
            </p>
            <p>
              Everything on this site uses synthetic data, describes classes of
              problem rather than any specific employer's systems, and states
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
                {current.title}, {current.org} — since {current.start.split("-")[0]} (
                {duration(current.start, current.end)}). {current.summary}
              </DataRow>
              <DataRow label="Scope">
                Technical direction and architecture for platform engineering across
                multiple delivery teams; design review, technical strategy and
                engineer development.
              </DataRow>
              <DataRow label="Domain">
                High-volume transaction systems — commerce, healthcare claims,
                vendor management and financial operations — where correctness is
                audited rather than assumed.
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
        <aside className="lg:pt-2">
          <div className="lg:sticky lg:top-24">
            {headshot ? (
              <div className="border border-rule bg-paper-raised p-2">
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
                  <a href={`mailto:${site.email}`} className="link-quiet text-ink-muted text-[0.95rem] break-all">
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
        <div className="grid gap-px border border-rule bg-rule lg:grid-cols-2">
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
          <p className="text-ink-faint mt-6 text-[0.85rem] italic">
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
