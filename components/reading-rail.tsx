"use client";

import { useEffect, useState } from "react";

/**
 * Sticky section index with a scroll spy. Section numbers are the same device
 * used across the rest of the site, so a long essay reads as a document with
 * clauses rather than an endless scroll.
 */
export function ReadingRail({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null);

  useEffect(() => {
    if (!sections.length) return;
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <nav aria-label="Sections" className="border-t border-rule pt-3">
      <p className="font-kicker text-ink-faint mb-3">Sections</p>
      <ol className="space-y-2">
        {sections.map((s, i) => {
          const on = active === s.id;
          return (
            <li key={s.id} className="flex gap-2.5">
              <span
                className={`font-kicker shrink-0 pt-[0.15rem] tabular-nums transition-colors ${
                  on ? "text-accent" : "text-ink-faint/70"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <a
                href={`#${s.id}`}
                className={`text-[0.875rem] leading-snug transition-colors ${
                  on ? "text-ink" : "text-ink-faint hover:text-ink-muted"
                }`}
              >
                {s.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
