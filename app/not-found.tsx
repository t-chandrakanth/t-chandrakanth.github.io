import Link from "next/link";
import { Kicker, Shell } from "@/components/primitives";
import { primaryNav } from "@/lib/site";

export default function NotFound() {
  return (
    <Shell width="wide" className="flex min-h-[62vh] flex-col justify-center py-24">
      <div className="max-w-[46rem]">
        <Kicker className="text-variance">Error 404</Kicker>
        <h1 className="display mt-5 text-[clamp(2.2rem,1.4rem+3.2vw,3.8rem)]">
          This path does not resolve.
        </h1>
        <p className="text-ink-muted mt-6 max-w-[52ch] text-[1.0625rem] leading-relaxed">
          The address you asked for went to a place that is not here. It may have
          moved, or it may never have existed — and telling those two apart, at
          speed, without guessing, is most of what this site is about.
        </p>
        <nav aria-label="Recovery" className="mt-10 border-t border-rule-strong">
          {[{ label: "Home", href: "/" }, ...primaryNav].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-baseline justify-between gap-6 border-b border-rule py-4 no-underline"
            >
              <span className="text-[1.15rem] tracking-[-0.014em] transition-colors group-hover:text-accent">
                {item.label}
              </span>
              <span
                aria-hidden="true"
                className="text-ink-faint transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </Shell>
  );
}
