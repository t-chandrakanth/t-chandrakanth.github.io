import { PEOPLE } from "@/lib/config";
import { loadMonth } from "@/lib/store";
import { nextDay, todayIST } from "@/lib/range";
import { notify, pushReady } from "@/lib/push";
import { holidayName } from "@/lib/holidays";

export const dynamic = "force-dynamic";

const NAMES: Record<string, string> = { "08/20": "General", "07/13": "Day", "13/21": "Afternoon", "21/24": "Night", "00/07": "Night off", "07/13 21/24": "Day + Night", REST: "Rest", CR: "CR", LEAVE: "Leave" };
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const long = (d: string) => `${DOW[new Date(d + "T00:00:00Z").getUTCDay()]} ${+d.slice(8)} ${MON[+d.slice(5, 7) - 1]}`;

// Called by the scheduler (Vercel cron sends "Authorization: Bearer <CRON_SECRET>"; other schedulers can pass ?key=).
// Before 12:00 IST it sends today's duty, after that tomorrow's. ?slot=today|tomorrow overrides.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.CRON_SECRET ?? "";
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? url.searchParams.get("key") ?? "";
  if (!secret || given !== secret) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!pushReady()) return Response.json({ error: "VAPID keys missing" }, { status: 503 });

  const today = todayIST();
  const hourIST = new Date(Date.now() + 5.5 * 3600000).getUTCHours();
  const slot = url.searchParams.get("slot") ?? (hourIST < 12 ? "today" : "tomorrow");
  const date = slot === "today" ? today : nextDay(today);
  const data = await loadMonth(date.slice(0, 7));
  const when = slot === "today" ? `Today, ${long(date)}` : `Tomorrow, ${long(date)}`;
  const hol = holidayName(date);
  const remark = data.remarks[date];

  const results: Record<string, number> = {};
  for (const p of PEOPLE) {
    const v = (data.entries[date]?.[p.id] ?? "").trim();
    const duty = v ? `${v}${NAMES[v] ? ` (${NAMES[v]})` : ""}` : "no duty entered yet";
    const body = `${when}${hol ? ` · ${hol}` : ""}\nYour duty: ${duty}${remark ? `\nRemark: ${remark}` : ""}`;
    results[p.id] = await notify(p.id, body, `duty-${slot}-${date}`);
  }
  return Response.json({ ok: true, slot, date, sent: results });
}
