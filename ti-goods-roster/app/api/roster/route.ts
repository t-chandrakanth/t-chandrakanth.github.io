import { requireUser } from "@/lib/auth";
import { ADMIN_NAME, isAdmin, personById } from "@/lib/config";
import { loadMonth, saveMonth, type Month } from "@/lib/store";
import { followWithNightOff, saveMonths } from "@/lib/nightoff";
import { rangeDates, todayIST } from "@/lib/range";

const MONTH = /^\d{4}-\d{2}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const me = u.me;
  const month = new URL(req.url).searchParams.get("month") ?? "";
  if (!MONTH.test(month)) return Response.json({ error: "Bad month" }, { status: 400 });
  const data = await loadMonth(month);
  // Pending requests are visible to everyone.
  return Response.json({ me, ...data });
}

// Raghav: sets any duty directly. Team member: files a request for their own duty only.
export async function PUT(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const me = u.me;
  const b = (await req.json()) as { date?: string; person?: string; value?: string; remark?: string; note?: string; to?: string };
  if (!b.date || !DATE.test(b.date)) return Response.json({ error: "Bad date" }, { status: 400 });
  const month = b.date.slice(0, 7);
  const data = await loadMonth(month);

  if (typeof b.remark === "string") {
    if (!isAdmin(me)) return Response.json({ error: `Only ${ADMIN_NAME} can edit remarks` }, { status: 403 });
    data.remarks[b.date] = b.remark.slice(0, 200);
    await saveMonth(month, data);
    return Response.json({ ok: true });
  }

  const person = personById(b.person ?? "");
  if (!person || typeof b.value !== "string") return Response.json({ error: "Bad request" }, { status: 400 });
  const value = b.value.trim().toUpperCase().slice(0, 40);

  if (isAdmin(me)) {
    (data.entries[b.date] ??= {})[person.id] = value;
    data.requests = data.requests.filter((r) => !(r.date === b.date && r.person === person.id));
    const months = new Map<string, Month>([[month, data]]);
    const nightOff = await followWithNightOff(b.date, person.id, value, months);
    await saveMonths(months);
    return Response.json({ ok: true, nightOff });
  }

  if (person.id !== me) {
    return Response.json({ error: "You can only request changes to your own duty" }, { status: 403 });
  }
  if (person.group === "lr" && value !== "REST" && value !== "LEAVE") {
    return Response.json({ error: `LR candidates can only ask for Rest or Leave. ${ADMIN_NAME} decides LR shifts.` }, { status: 403 });
  }
  // Completed days are the record of what happened; only Raghav corrects them.
  if (b.date < todayIST()) return Response.json({ error: `That day is over. Only ${ADMIN_NAME} can change a completed day.` }, { status: 403 });
  const to = b.to && DATE.test(b.to) && b.to > b.date ? b.to : undefined;
  if (to && rangeDates(b.date, to).length > 31) return Response.json({ error: "Ask for at most 31 days at a time" }, { status: 400 });
  data.requests = data.requests.filter((r) => !(r.date === b.date && r.person === me));
  data.requests.push({ id: crypto.randomUUID(), date: b.date, person: me, value, requestedBy: me, note: (b.note ?? "").trim().slice(0, 120), ...(to ? { to } : {}), at: Date.now() });
  await saveMonth(month, data);
  return Response.json({ ok: true, pending: true });
}
