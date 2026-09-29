import "server-only";
import { loadMonth, saveMonth, type Month } from "./store";
import { endsAtNight, nextDay } from "./range";

// After a night duty is saved for `date`, put 00/07 on the next day for that person,
// unless Raghav already gave them something else there. Returns true if it wrote.
export async function followWithNightOff(date: string, person: string, value: string, months: Map<string, Month>): Promise<boolean> {
  if (!endsAtNight(value)) return false;
  const d = nextDay(date);
  const m = d.slice(0, 7);
  if (!months.has(m)) months.set(m, await loadMonth(m));
  const md = months.get(m)!;
  const cur = (md.entries[d]?.[person] ?? "").trim();
  if (cur && cur !== "00/07") return false;
  (md.entries[d] ??= {})[person] = "00/07";
  return true;
}

export const saveMonths = async (months: Map<string, Month>) => { for (const [m, md] of months) await saveMonth(m, md); };
