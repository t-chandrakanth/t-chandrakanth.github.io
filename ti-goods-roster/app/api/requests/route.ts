import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/config";
import { loadMonth, saveMonth, type Month } from "@/lib/store";
import { rangeDates } from "@/lib/range";

// Raghav approves or rejects a duty change request.
export async function POST(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const me = u.me;
  if (!isAdmin(me)) return Response.json({ error: "Only Raghav can decide requests" }, { status: 403 });
  const { id, date, action } = (await req.json()) as { id?: string; date?: string; action?: string };
  if (!id || !date || (action !== "approve" && action !== "reject")) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const month = date.slice(0, 7);
  const data = await loadMonth(month);
  const r = data.requests.find((x) => x.id === id);
  if (!r) return Response.json({ error: "Request not found" }, { status: 404 });
  data.requests = data.requests.filter((x) => x.id !== id);
  if (action === "approve") {
    // A multi-day request can cross into the next month, so load each month it touches.
    const months = new Map<string, Month>([[month, data]]);
    for (const d of r.to ? rangeDates(r.date, r.to) : [r.date]) {
      const m = d.slice(0, 7);
      if (!months.has(m)) months.set(m, await loadMonth(m));
      (months.get(m)!.entries[d] ??= {})[r.person] = r.value;
    }
    for (const [m, md] of months) await saveMonth(m, md);
  } else {
    await saveMonth(month, data);
  }
  return Response.json({ ok: true });
}

// The person who made a request (or Raghav) can delete it while it is pending.
export async function DELETE(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const { id, date } = (await req.json()) as { id?: string; date?: string };
  if (!id || !date) return Response.json({ error: "Bad request" }, { status: 400 });
  const month = date.slice(0, 7);
  const data = await loadMonth(month);
  const r = data.requests.find((x) => x.id === id);
  if (!r) return Response.json({ error: "Request not found" }, { status: 404 });
  if (r.requestedBy !== u.me && !isAdmin(u.me)) return Response.json({ error: "You can only delete your own request" }, { status: 403 });
  data.requests = data.requests.filter((x) => x.id !== id);
  await saveMonth(month, data);
  return Response.json({ ok: true });
}
