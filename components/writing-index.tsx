"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Kicker } from "./primitives";
import { pillars } from "@/content/pillars";

export type IndexPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  dateLabel: string;
  yearLabel: string;
  pillar: string;
  pillarName: string;
  readingMinutes: number;
  draft?: boolean;
};

export function WritingIndex({ posts }: { posts: IndexPost[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const activePillar = params.get("pillar") ?? "all";

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: posts.length };
    for (const p of posts) c[p.pillar] = (c[p.pillar] ?? 0) + 1;
    return c;
  }, [posts]);

  const shown = useMemo(
    () => (activePillar === "all" ? posts : posts.filter((p) => p.pillar === activePillar)),
    [posts, activePillar],
  );

  const select = (id: string) => {
    router.replace(id === "all" ? "/writing" : `/writing?pillar=${id}`, { scroll: false });
  };

  // Short names, not full pillar names: the full set wraps to a second row and
  // leaves hanging dividers.
  const filters = [{ id: "all", label: "All" }, ...pillars.map((p) => ({ id: p.id, label: p.short }))];

  // Year rules are inserted between rows, so the index reads as a ledger.
  let lastYear = "";

  return (
    <>
      <div className="border-y border-rule">
        <div
          role="group"
          aria-label="Filter by pillar"
          className="-mx-5 flex overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {filters.map((f) => {
            const on = activePillar === f.id;
            const n = counts[f.id] ?? 0;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => select(f.id)}
                disabled={n === 0}
                aria-pressed={on}
                className={`font-kicker shrink-0 border-r border-rule px-4 py-3 transition-colors first:pl-0 disabled:opacity-35 ${
                  on ? "text-accent" : "text-ink-faint enabled:hover:text-ink"
                }`}
              >
                {f.label}
                <span className="ml-2 tabular-nums opacity-60">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="text-ink-muted py-16 text-center italic">
          Nothing published under this pillar yet.
        </p>
      ) : (
        <ul>
          {shown.map((post, i) => {
            const newYear = post.yearLabel !== lastYear;
            if (newYear) lastYear = post.yearLabel;
            return (
              <li key={post.slug}>
                {newYear && (
                  <div className="flex items-center gap-4 pt-10 pb-2">
                    <span className="font-kicker text-ink-faint tabular-nums">{post.yearLabel}</span>
                    <span className="h-px flex-1 bg-rule-strong" />
                  </div>
                )}
                <Link
                  href={`/writing/${post.slug}`}
                  className="group grid gap-x-8 gap-y-2 border-b border-rule py-7 no-underline md:grid-cols-[7rem_minmax(0,1fr)_5.5rem] md:items-baseline"
                >
                  <div className="flex items-center gap-3 md:block">
                    <Kicker className="tabular-nums">{post.dateLabel}</Kicker>
                    <Kicker className="text-rule-strong md:mt-1 md:block">
                      {String(i + 1).padStart(2, "0")}
                    </Kicker>
                  </div>
                  <div>
                    <h2 className="text-[clamp(1.2rem,1.05rem+0.7vw,1.6rem)] leading-[1.2] tracking-[-0.016em] transition-colors group-hover:text-accent">
                      {post.title}
                      {post.draft ? (
                        <span className="font-kicker text-pending ml-3 align-middle">Draft</span>
                      ) : null}
                    </h2>
                    <p className="text-ink-muted mt-2 max-w-[62ch] text-[0.975rem] leading-relaxed">
                      {post.description}
                    </p>
                    <Kicker className="mt-3">{post.pillarName}</Kicker>
                  </div>
                  <Kicker className="md:text-right">{post.readingMinutes} min</Kicker>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
