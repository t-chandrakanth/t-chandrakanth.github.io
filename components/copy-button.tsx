"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("done");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2200);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`font-kicker text-ink-faint hover:text-accent transition-colors ${className}`}
      aria-live="polite"
    >
      {state === "done" ? "Copied" : state === "failed" ? "Select manually" : label}
    </button>
  );
}
