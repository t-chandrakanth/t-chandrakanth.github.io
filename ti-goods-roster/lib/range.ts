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
