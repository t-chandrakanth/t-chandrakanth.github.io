import { CYCLE, PEOPLE } from "./config";

// Suggest a duty for each of the four team members from yesterday's duties.
// Follows the sheet's usual rotation; Raghav can edit before saving.
export function suggest(yesterday: Record<string, string> = {}): Record<string, string> {
  const team = PEOPLE.filter((p) => p.group === "team");
  const norm = (v?: string) => (v ?? "").toUpperCase().replace(/\s+/g, " ").trim();
  const slotOf = (v: string) => {
    if (v.includes("21/") && v.includes("07/13")) return 1; // day + night
    if (v.startsWith("21/") || v.startsWith("20/") || v.startsWith("18/")) return 1; // night start -> night off next
    if (/^(07|08|13)\//.test(v)) return 0; // general, day or afternoon -> night next
    return CYCLE.indexOf(v);
  };
  const taken = new Set<number>();
  const out: Record<string, string> = {};
  const pending: string[] = [];
  for (const p of team) {
    const y = norm(yesterday[p.id]);
    const s = slotOf(y);
    const next = s >= 0 ? (s + 1) % CYCLE.length : -1;
    if (next >= 0 && !taken.has(next)) {
      taken.add(next);
      out[p.id] = CYCLE[next];
    } else pending.push(p.id);
  }
  for (const id of pending) {
    const free = CYCLE.findIndex((_, i) => !taken.has(i));
    taken.add(free);
    out[id] = CYCLE[free];
  }
  return out;
}
