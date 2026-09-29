import { currentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/config";
import { loadMonth, saveMonth } from "@/lib/store";

// Raghav approves or rejects a duty change request.
export async function POST(req: Request) {
  const me = await currentUser();
  if (!isAdmin(me)) return Response.json({ error: "Only Raghav can decide requests" }, { status: 403 });
  const { id, date, action } = (await req.json()) as { id?: string; date?: string; action?: string };
  if (!id || !date || (action !== "approve" && action !== "reject")) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const month = date.slice(0, 7);
  const data = await loadMonth(month);
  const r = data.requests.find((x) => x.id === id);
  if (!r) return Response.json({ error: "Request not found" }, { status: 404 });
  if (action === "approve") (data.entries[r.date] ??= {})[r.person] = r.value;
  data.requests = data.requests.filter((x) => x.id !== id);
  await saveMonth(month, data);
  return Response.json({ ok: true });
}
