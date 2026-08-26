import type { ReactNode } from "react";
import { Kicker } from "./primitives";

/**
 * Figure — the wrapper every diagram in a post goes through.
 * `n` is the figure number; `caption` is mandatory in practice because a
 * diagram nobody can read without the surrounding paragraph is decoration.
 */
export function Figure({
  n,
  caption,
  children,
  bleed = false,
}: {
  n?: number;
  caption: ReactNode;
  children: ReactNode;
  bleed?: boolean;
}) {
  return (
    <figure className={`my-12 ${bleed ? "lg:-mx-24" : ""}`}>
      <div className="rounded-[18px] border border-rule bg-paper-raised p-5 sm:p-8">{children}</div>
      <figcaption>
        {n !== undefined ? (
          <span className="text-ink mr-2 font-medium">Fig. {String(n).padStart(2, "0")}</span>
        ) : null}
        {caption}
      </figcaption>
    </figure>
  );
}

/** A boxed note. Use sparingly — three per post is already too many. */
export function Callout({
  label = "Note",
  tone = "neutral",
  children,
}: {
  label?: string;
  tone?: "neutral" | "warning" | "verified";
  children: ReactNode;
}) {
  const accent =
    tone === "warning"
      ? "border-l-variance"
      : tone === "verified"
        ? "border-l-verified"
        : "border-l-rule-strong";
  return (
    <aside
      className={`my-10 rounded-[12px] border border-rule border-l-[3px] ${accent} bg-paper-raised px-5 py-4 sm:px-6`}
    >
      <Kicker className="mb-2">{label}</Kicker>
      <div className="text-ink-muted [&>*+*]:mt-3 text-[0.975rem] leading-relaxed">
        {children}
      </div>
    </aside>
  );
}

/** The sentence the piece exists to deliver. One per post. */
export function KeyLine({ children }: { children: ReactNode }) {
  // A div, not a p: MDX wraps the children in their own paragraph, and a
  // <p> inside a <p> is restructured by the browser and breaks hydration.
  return (
    <div className="my-12 border-y border-rule-strong py-7 text-center text-[clamp(1.25rem,1rem+1.1vw,1.6rem)] leading-[1.32] font-medium tracking-[-0.019em] text-balance [&>p]:m-0">
      {children}
    </div>
  );
}

/** Required label wherever numbers appear. Every dataset on this site is synthetic. */
export function Synthetic({ generator }: { generator?: string }) {
  return (
    <p className="font-kicker text-ink-faint my-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-rule py-2.5">
      <span className="text-pending">Synthetic data</span>
      <span aria-hidden="true" className="text-rule-strong">/</span>
      <span className="normal-case tracking-normal [font-size:0.75rem]">
        Figures below are generated, not observed. No employer data appears on this site.
      </span>
      {generator ? (
        <a href={generator} className="text-accent underline-offset-2 hover:underline">
          Generator
        </a>
      ) : null}
    </p>
  );
}

/** Two-column comparison used for "obvious fix vs. what actually happens". */
export function Compare({
  left,
  right,
  leftLabel = "Assumed",
  rightLabel = "Observed",
}: {
  left: ReactNode;
  right: ReactNode;
  leftLabel?: string;
  rightLabel?: string;
}) {
  return (
    <div className="my-10 grid border border-rule sm:grid-cols-2">
      <div className="border-b border-rule p-5 sm:border-b-0 sm:border-r">
        <Kicker className="mb-2.5">{leftLabel}</Kicker>
        <div className="text-ink-muted text-[0.975rem] leading-relaxed">{left}</div>
      </div>
      <div className="bg-paper-raised p-5">
        <Kicker className="text-variance mb-2.5">{rightLabel}</Kicker>
        <div className="text-ink-muted text-[0.975rem] leading-relaxed">{right}</div>
      </div>
    </div>
  );
}

/** Former name. Kept so essays written before the rename keep compiling. */
export const Ledger = Compare;
