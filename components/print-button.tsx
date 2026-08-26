"use client";

export function PrintButton({ label = "Print / save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="link-action transition-colors print:hidden"
    >
      {label}
    </button>
  );
}
