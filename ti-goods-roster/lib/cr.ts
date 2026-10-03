// Compensatory Rest (CR). The rule: every week (Monday to Sunday) a person should get one REST.
// A finished week with duties but no REST (and no LEAVE/CR either) earns one CR.
// Weeks are credited to the month their Sunday falls in.

export type CrStatus = { earned: string[]; taken: number; due: number }; // earned = Mondays of the weeks without rest

const dayMs = 86400000;
const toIso = (t: number) => new Date(t).toISOString().slice(0, 10);

export function crStatus(month: string, entry: (date: string) => string, today: string): CrStatus {
  const [y, m] = month.split("-").map(Number);
  const first = Date.UTC(y, m - 1, 1);
  const last = Date.UTC(y, m, 0);
  const earned: string[] = [];
  let taken = 0;
  // CR taken this month
  for (let t = first; t <= last; t += dayMs) if (entry(toIso(t)).trim().toUpperCase() === "CR") taken++;
  // Weeks whose Sunday is in this month and already over
  for (let t = first; t <= last; t += dayMs) {
    if (new Date(t).getUTCDay() !== 0) continue; // Sunday
    const sunday = toIso(t);
    if (sunday >= today) continue; // week not finished yet
    let worked = 0, rested = false;
    for (let d = t - 6 * dayMs; d <= t; d += dayMs) {
      const v = entry(toIso(d)).trim().toUpperCase();
      if (!v) continue;
      if (v === "REST" || v === "CR" || v === "LEAVE") rested = true;
      else worked++;
    }
    if (worked > 0 && !rested) earned.push(toIso(t - 6 * dayMs));
  }
  return { earned, taken, due: Math.max(0, earned.length - taken) };
}
