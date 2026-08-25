import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/print-button";
import { Kicker, SectionHead, Shell } from "@/components/primitives";
import { awards, education, expertise, roles, service, speaking } from "@/content/cv";
import { duration, formatMonth } from "@/lib/format";
import { liveProfiles, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Curriculum vitae",
  description: `Curriculum vitae for ${site.name} — senior technical lead. Roles described by scope and scale, education, areas of depth, speaking and service.`,
  alternates: { canonical: "/cv" },
};

export default function CVPage() {
  const first = roles[roles.length - 1];
  const totalYears = new Date().getUTCFullYear() - Number(first.start.split("-")[0]);

  return (
    <Shell width="wide" className="pt-14 pb-24 sm:pt-20">
      <header className="max-w-[52rem]">
        <Kicker className="text-accent reveal">Curriculum vitae</Kicker>
        <h1
          className="display reveal mt-5 text-[clamp(2.4rem,1.5rem+3.6vw,4.2rem)]"
          style={{ animationDelay: "60ms" }}
        >
          {site.name}
        </h1>
        <p
          className="text-ink-muted reveal mt-6 max-w-[58ch] text-[1.0625rem] leading-relaxed"
          style={{ animationDelay: "120ms" }}
        >
          {site.role} · {site.location} · {totalYears} years in transaction-processing
          systems. Roles below are described by scope and scale. No employer
          internals appear here.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 print:hidden">
          <a href={`mailto:${site.email}`} className="font-kicker text-ink-faint hover:text-accent transition-colors">
            {site.email}
          </a>
          {liveProfiles().map((p) => (
            <a
              key={p.label}
              href={p.href}
              target="_blank"
              rel="me noopener"
              className="font-kicker text-ink-faint hover:text-accent transition-colors"
            >
              {p.label}
            </a>
          ))}
          <PrintButton />
        </div>
      </header>

      {/* ---------------- experience ---------------- */}
      <section className="mt-20">
        <SectionHead n={1} label="Experience" />
        <ol className="border-t border-rule-strong">
          {roles.map((r) => (
            <li key={`${r.org}-${r.start}`} className="border-b border-rule py-9">
              <div className="grid gap-x-10 gap-y-4 lg:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
                <div>
                  <Kicker className="tabular-nums">
                    {formatMonth(r.start)} — {r.end === "Present" ? "Present" : formatMonth(r.end)}
                  </Kicker>
                  <Kicker className="text-ink-faint/70 mt-1.5">
                    {duration(r.start, r.end)}
                  </Kicker>
                </div>
                <div>
                  <h3 className="text-[clamp(1.2rem,1.05rem+0.6vw,1.5rem)] leading-[1.22] tracking-[-0.015em]">
                    {r.title}
                  </h3>
                  <p className="text-accent mt-1.5 text-[1.0625rem]">{r.org}</p>
                  <p className="text-ink-muted mt-3.5 max-w-[62ch] text-[0.975rem] leading-relaxed">
                    {r.summary}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {r.highlights.map((h) => (
                      <li
                        key={h}
                        className="text-ink-muted relative max-w-[64ch] pl-5 text-[0.95rem] leading-relaxed before:absolute before:left-0 before:top-[0.72em] before:h-px before:w-2.5 before:bg-rule-strong"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- education ---------------- */}
      <section className="mt-20">
        <SectionHead n={2} label="Education" />
        <ol className="border-t border-rule-strong">
          {education.map((e) => (
            <li key={e.institution} className="border-b border-rule py-6">
              <div className="grid gap-x-10 gap-y-2 lg:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
                <Kicker className="tabular-nums">
                  {e.start} — {e.end}
                </Kicker>
                <div>
                  <h3 className="text-[1.15rem] tracking-[-0.013em]">{e.credential}</h3>
                  <p className="text-ink-muted mt-1 text-[0.975rem]">{e.institution}</p>
                  {e.note ? (
                    <p className="text-ink-faint mt-2 text-[0.9rem]">{e.note}</p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- expertise ---------------- */}
      <section className="mt-20">
        <SectionHead n={3} label="Areas of depth" />
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

      {/* ---------------- evidence sections ---------------- */}
      <section className="mt-20">
        <SectionHead
          n={4}
          label="Speaking, service and recognition"
          intro="These sections exist because they will be filled. An empty section stated honestly is worth more than an inflated one."
        />
        <div className="grid gap-10 md:grid-cols-3">
          {[
            {
              h: "Speaking",
              items: speaking.map((s) => `${s.title} — ${s.venue}, ${s.date}`),
              empty: "No talks delivered yet. Conference submissions are planned for the coming cycle.",
            },
            {
              h: "Peer review & service",
              items: service.map((s) => `${s.role} — ${s.venue}, ${s.period}`),
              empty: "No review assignments logged yet. Every assignment will be listed with venue, year and number of submissions handled.",
            },
            {
              h: "Recognition",
              items: awards.map((a) => `${a.title} — ${a.issuer}, ${a.date}`),
              empty: "Nothing to list.",
            },
          ].map((col) => (
            <div key={col.h} className="border-t border-rule pt-5">
              <h3 className="text-[1.05rem] tracking-[-0.012em]">{col.h}</h3>
              {col.items.length ? (
                <ul className="mt-3 space-y-2">
                  {col.items.map((i) => (
                    <li key={i} className="text-ink-muted text-[0.925rem] leading-relaxed">
                      {i}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-ink-faint mt-3 text-[0.875rem] leading-relaxed italic">
                  {col.empty}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <p className="text-ink-faint mt-16 max-w-[64ch] text-[0.85rem] leading-relaxed italic print:hidden">
        A fuller account of the research behind these roles is on the{" "}
        <Link href="/research" className="link-rule text-ink-muted">
          research programme
        </Link>{" "}
        page, and the narrative version is on{" "}
        <Link href="/about" className="link-rule text-ink-muted">
          about
        </Link>
        .
      </p>
    </Shell>
  );
}
