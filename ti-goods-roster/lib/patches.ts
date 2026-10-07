import type { Month } from "./store";

// Duties handed over on paper and typed in here once, so the app shows them without the chief
// re-entering them. A patch only fills a blank cell: anything the chief has already saved wins.
type Patch = { entries: Record<string, Record<string, string>>; remarks?: Record<string, string> };

const TI_GOODS: Record<string, Patch> = {
  "2026-10": {
    // Ravinder Goud joined TI Goods on 1 Oct 2026 (Narendra stays on the muster).
    entries: {
      "2026-10-01": { ravinder: "LEAVE" },
      "2026-10-02": { ravinder: "LEAVE" },
      "2026-10-03": { ravinder: "07/13" },
      "2026-10-04": { ravinder: "13/21" },
      "2026-10-05": { ravinder: "REST" },
      "2026-10-06": { ravinder: "CR" },
      "2026-10-07": { ravinder: "21/24" },
      "2026-10-08": { ravinder: "00/07" },
    },
    remarks: { "2026-10-06": "Ravinder Goud: CR (PME)" },
  },
};

// Returns true if anything was filled in.
export function applyPatches(teamId: string, month: string, m: Month): boolean {
  const patch = teamId === "ti-goods" ? TI_GOODS[month] : undefined;
  if (!patch) return false;
  let changed = false;
  for (const [date, people] of Object.entries(patch.entries)) {
    for (const [id, v] of Object.entries(people)) {
      if ((m.entries[date]?.[id] ?? "") === "") { (m.entries[date] ??= {})[id] = v; changed = true; }
    }
  }
  for (const [date, text] of Object.entries(patch.remarks ?? {})) {
    if (!m.remarks[date]) { m.remarks[date] = text; changed = true; }
  }
  return changed;
}
