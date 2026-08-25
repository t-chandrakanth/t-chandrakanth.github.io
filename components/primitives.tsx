import type { ReactNode } from "react";

/** Small mono label. The site's connective tissue. */
export function Kicker({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "span" | "p" | "h2";
}) {
  return <Tag className={`font-kicker text-ink-faint ${className}`}>{children}</Tag>;
}

/** A numbered section marker: §01 */
export function SectionMark({ n }: { n: number }) {
  return (
    <span className="font-kicker text-ink-faint tabular-nums">
      §{String(n).padStart(2, "0")}
    </span>
  );
}

export function Rule({
  className = "",
  strong = false,
}: {
  className?: string;
  strong?: boolean;
}) {
  return (
    <hr
      className={`border-0 h-px w-full ${strong ? "bg-rule-strong" : "bg-rule"} ${className}`}
    />
  );
}

/**
 * Section heading with a marginal number and a rule that runs to the edge.
 * The number is the site's organising device — it makes long pages navigable
 * and it is the visual reason the thing reads as a document, not a landing page.
 */
export function SectionHead({
  n,
  label,
  title,
  intro,
  action,
}: {
  n: number;
  label: string;
  title?: string;
  intro?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-10">
      <div className="flex items-baseline gap-4 border-t border-rule-strong pt-3">
        <SectionMark n={n} />
        <Kicker className="text-ink-muted flex-1">{label}</Kicker>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {title ? (
        <h2 className="display mt-5 text-[clamp(1.7rem,1.2rem+1.7vw,2.4rem)]">{title}</h2>
      ) : null}
      {intro ? (
        <div className="text-ink-muted mt-4 max-w-[58ch] text-[1.0625rem] leading-relaxed">
          {intro}
        </div>
      ) : null}
    </header>
  );
}

const TONE: Record<string, string> = {
  verified: "text-verified border-verified/40 bg-verified/[0.06]",
  pending: "text-pending border-pending/40 bg-pending/[0.06]",
  neutral: "text-ink-muted border-rule-strong bg-paper-sunk",
  accent: "text-accent border-accent/40 bg-accent-wash",
};

/** Status stamp — reads as something applied to a document, not a UI pill. */
export function Stamp({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof TONE | string;
  className?: string;
}) {
  return (
    <span
      className={`font-kicker inline-flex items-center border px-[0.45rem] py-[0.2rem] leading-none ${
        TONE[tone] ?? TONE.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}

/** Definition row used across CV, research and publication pages. */
export function DataRow({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-1 border-t border-rule py-3 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-6 ${className}`}
    >
      <dt className="font-kicker text-ink-faint pt-[0.2rem]">{label}</dt>
      <dd className="text-ink-muted text-[0.95rem] leading-relaxed">{children}</dd>
    </div>
  );
}

export function Shell({
  children,
  className = "",
  width = "default",
}: {
  children: ReactNode;
  className?: string;
  width?: "default" | "wide" | "prose";
}) {
  const w =
    width === "wide"
      ? "max-w-[84rem]"
      : width === "prose"
        ? "max-w-[46rem]"
        : "max-w-[68rem]";
  return (
    <div className={`mx-auto w-full ${w} px-5 sm:px-8 lg:px-10 ${className}`}>{children}</div>
  );
}
