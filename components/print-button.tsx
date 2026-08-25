"use client";

export function PrintButton({ label = "Print / save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="font-kicker text-ink-faint hover:text-accent transition-colors print:hidden"
    >
      {label}
    </button>
  );
}
