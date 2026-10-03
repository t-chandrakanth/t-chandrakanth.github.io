// Compensatory Rest (CR). Rule: every week (Monday to Sunday) a person should get one REST.
// A finished week with duties but no REST (and no CR or LEAVE either) earns one CR.
// CR carries forward until a CR day is taken. The chief enters the balance pending on a
// start date ("opening"); from that date on, the app counts weeks and CR days itself.

export type CrLedger = {
  opening: number;
  earned: string[]; // Mondays of the weeks without rest, from the start date, finished before today
  taken: number;    // CR days on or after the start date (future ones count too, they are already granted)
  due: number;      // opening + earned - taken, never below 0
};

const dayMs = 86400000;
const toIso = (t: number) => new Date(t).toISOString().slice(0, 10);
const utc = (d: string) => Date.parse(d + "T00:00:00Z");

export function crLedger(entry: (date: string) => string, from: string, today: string, opening = 0, until = today): CrLedger {
  const earned: string[] = [];
  let taken = 0;
  const start = utc(from);
  // CR days taken from the start date up to `until` (the last date we have data for)
  for (let t = start; t <= utc(until); t += dayMs) if (entry(toIso(t)).trim().toUpperCase() === "CR") taken++;
  // First Monday on/after the start date, then every finished week
  let mon = start;
  while (new Date(mon).getUTCDay() !== 1) mon += dayMs;
  for (; ; mon += 7 * dayMs) {
    const sun = mon + 6 * dayMs;
    if (toIso(sun) >= today) break; // week not over yet
    let worked = 0, rested = false;
    for (let d = mon; d <= sun; d += dayMs) {
      const v = entry(toIso(d)).trim().toUpperCase();
      if (!v) continue;
      if (v === "REST" || v === "CR" || v === "LEAVE") rested = true;
      else worked++;
    }
    if (worked > 0 && !rested) earned.push(toIso(mon));
  }
  return { opening, earned, taken, due: Math.max(0, opening + earned.length - taken) };
}
