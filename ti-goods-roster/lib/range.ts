// Every date from `from` to `to`, both included (YYYY-MM-DD).
export function rangeDates(from: string, to: string): string[] {
  const out: string[] = [];
  const end = Date.parse(to + "T00:00:00Z");
  for (let t = Date.parse(from + "T00:00:00Z"); t <= end && out.length < 62; t += 86400000) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

// Today's date in India (YYYY-MM-DD), so "completed day" means the same thing on the server and on phones.
export const todayIST = () => new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10);

// A duty that runs into the night (21/24, 20/24, 07/13 21/24 ...): the same person does 00/07 the next morning.
export const endsAtNight = (code: string) =>
  code.trim().toUpperCase().split(/\s+/).some((t) => { const m = t.match(/^(\d+)\/(\d+)$/); return !!m && +m[1] >= 18; });

export const nextDay = (d: string) => new Date(Date.parse(d + "T00:00:00Z") + 86400000).toISOString().slice(0, 10);
