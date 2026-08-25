"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";
const ORDER: Mode[] = ["system", "light", "dark"];

const GLYPH: Record<Mode, string> = { system: "auto", light: "day", dark: "night" };

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Mode | null;
    if (stored && ORDER.includes(stored)) setMode(stored);
  }, []);

  function apply(next: Mode) {
    setMode(next);
    try {
      if (next === "system") {
        localStorage.removeItem("theme");
        document.documentElement.removeAttribute("data-theme");
      } else {
        localStorage.setItem("theme", next);
        document.documentElement.setAttribute("data-theme", next);
      }
    } catch {
      /* storage unavailable — the attribute change alone still works */
    }
  }

  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];

  return (
    <button
      type="button"
      onClick={() => apply(next)}
      className="font-kicker text-ink-faint hover:text-accent w-[3.25rem] text-right transition-colors"
      aria-label={`Appearance: ${mode}. Switch to ${next}.`}
      title={`Appearance: ${mode} — click for ${next}`}
    >
      {mounted ? GLYPH[mode] : " "}
    </button>
  );
}
