export type Counts = {
  day: number;
  afternoon: number;
  night: number;
  nightOff: number;
  rest: number;
  cr: number;
  leave: number;
  other: number;
  worked: number; // days with any duty
  marked: number; // days with any entry
};

export const emptyCounts = (): Counts => ({ day: 0, afternoon: 0, night: 0, nightOff: 0, rest: 0, cr: 0, leave: 0, other: 0, worked: 0, marked: 0 });

// Counting rules (from the muster sheet's codes):
//  Day        = a 07/13-type duty starting 05:00-12:59
//  Afternoon  = 13/21 (start 13:00-17:59)
//  Night      = a duty starting 18:00 or later (21/24, 20/24, 18/24 ...)
//  Night off  = 00/07 (second half of a night duty, starts at midnight)
// A Day+Night entry counts once as Day and once as Night.
export function countDuties(values: string[]): Counts {
  const c = emptyCounts();
  for (const raw of values) {
    const v = raw.trim().toUpperCase();
    if (!v) continue;
    c.marked++;
    if (v === "REST") { c.rest++; continue; }
    if (v === "CR") { c.cr++; continue; }
    if (v === "LEAVE") { c.leave++; continue; }
    let any = false;
    for (const t of v.split(/\s+/)) {
      const m = t.match(/^(\d+)\/(\d+)$/);
      if (!m) continue;
      const s = +m[1];
      any = true;
      if (s === 0) c.nightOff++;
      else if (s >= 18) c.night++;
      else if (s >= 13) c.afternoon++;
      else c.day++;
    }
    if (any) c.worked++; else c.other++;
  }
  return c;
}
