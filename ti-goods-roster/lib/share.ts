import { PEOPLE, activeOn } from "./config";

// Turn a duty code into the wording used in the WhatsApp group.
function wording(code: string) {
  const v = code.trim().toUpperCase();
  if (v === "REST") return "Rest";
  if (v === "CR") return "CR";
  if (v === "LEAVE") return "Leave";
  if (v === "08/20") return "General";
  const starts = v.split(/\s+/).map((t) => +(t.match(/^(\d+)\//)?.[1] ?? -1)).filter((n) => n >= 0);
  if (starts.some((s) => s >= 5 && s < 13) && starts.some((s) => s >= 18)) return "Day/Night";
  return v;
}

// Order in the message: Day/Night, day, afternoon, night, night off, rest, leave.
function rank(label: string) {
  if (label === "Day/Night") return 0;
  if (label === "General") return 1;
  if (label === "Rest") return 5;
  if (label === "CR") return 5;
  if (label === "Leave") return 6;
  const s = +(label.match(/^(\d+)\//)?.[1] ?? 99);
  if (s === 0) return 4;
  if (s >= 18) return 3;
  if (s >= 13) return 2;
  return 1;
}

export function buildMessage(date: string, entries: Record<string, Record<string, string>>, remark = "") {
  const day = entries[date] ?? {};
  const section = (group: "team" | "lr") => {
    const g = new Map<string, string[]>();
    for (const p of PEOPLE.filter((p) => p.group === group && activeOn(p, date))) {
      const code = (day[p.id] ?? "").trim();
      if (!code) continue;
      const label = wording(code);
      g.set(label, [...(g.get(label) ?? []), p.name]);
    }
    return [...g.entries()].sort((a, b) => rank(a[0]) - rank(b[0])).map(([label, names]) => `${label} - ${names.join(", ")}`);
  };
  const team = section("team");
  const lr = section("lr");
  if (!team.length && !lr.length) return "";
  const [y, m, d] = date.split("-");
  return [`Duties -${d}-${m}-${y.slice(2)}`, ...team, ...(lr.length ? ["", "LR", ...lr] : []), ...(remark ? ["", `Remark: ${remark}`] : [])].join("\n");
}

export const whatsappLink = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;
