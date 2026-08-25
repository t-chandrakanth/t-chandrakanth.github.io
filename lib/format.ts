const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Parse a `YYYY-MM-DD` or `YYYY-MM` string without timezone drift. */
function parts(iso: string) {
  const [y, m = "01", d = "01"] = iso.split("-");
  return { y: Number(y), m: Number(m), d: Number(d) };
}

export function formatDate(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatMonth(iso: string): string {
  if (iso === "Present") return "Present";
  const { y, m } = parts(iso);
  return `${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

export function formatShort(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
}

export function year(iso: string): string {
  return iso.split("-")[0];
}

/** "2 yr 4 mo" — used on the CV rail. */
export function duration(start: string, end: string): string {
  const s = parts(start);
  const e = end === "Present" ? null : parts(end);
  const now = new Date();
  const endY = e ? e.y : now.getUTCFullYear();
  const endM = e ? e.m : now.getUTCMonth() + 1;
  const months = Math.max(0, (endY - s.y) * 12 + (endM - s.m));
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  const bits: string[] = [];
  if (yrs) bits.push(`${yrs} yr`);
  if (mos) bits.push(`${mos} mo`);
  return bits.join(" ") || "< 1 mo";
}

export function ordinal(n: number): string {
  return String(n).padStart(2, "0");
}
