import { currentUser, resetPassword } from "@/lib/auth";
import { ACTIVE, ADMIN_ID, ADMIN_NAME, isAdmin } from "@/lib/config";
import { getRaw, setRaw } from "@/lib/store";
import { notify } from "@/lib/push";

// "Forgot password?" on the login screen. The person asks, the chief taps Reset to 1234.
type ResetReq = { id: string; user: string; at: number };
const KEY = "resets";
const load = async (): Promise<ResetReq[]> => { const raw = await getRaw(KEY); return raw ? (JSON.parse(raw) as ResetReq[]) : []; };
const save = (list: ResetReq[]) => setRaw(KEY, JSON.stringify(list));

// Anyone (not logged in) can ask, once per 10 minutes per name.
export async function POST(req: Request) {
  const { user } = (await req.json()) as { user?: string };
  const p = ACTIVE.find((x) => x.id === user);
  if (!p) return Response.json({ error: "Pick your name" }, { status: 400 });
  if (p.id === ADMIN_ID) return Response.json({ error: `${ADMIN_NAME} is the chief; there is nobody above to reset it. Use the Vercel console or ask the developer.` }, { status: 400 });
  const list = await load();
  const mine = list.find((r) => r.user === p.id);
  if (mine && Date.now() - mine.at < 600000) return Response.json({ ok: true, already: true });
  await save([...list.filter((r) => r.user !== p.id), { id: crypto.randomUUID(), user: p.id, at: Date.now() }]);
  await notify(ADMIN_ID, `${p.name} forgot their password. Open Requests and tap "Reset to 1234".`, `reset-${p.id}`).catch(() => 0);
  return Response.json({ ok: true });
}

// The chief sees the list…
export async function GET() {
  const me = await currentUser();
  if (!isAdmin(me)) return Response.json({ error: "Not allowed" }, { status: 403 });
  return Response.json({ resets: await load() });
}

// …and resets (sets the password back to 1234) or dismisses a request.
export async function DELETE(req: Request) {
  const me = await currentUser();
  if (!isAdmin(me)) return Response.json({ error: "Not allowed" }, { status: 403 });
  const { id, action } = (await req.json()) as { id?: string; action?: "reset" | "dismiss" };
  const list = await load();
  const r = list.find((x) => x.id === id);
  if (!r) return Response.json({ error: "Request not found" }, { status: 404 });
  if (action === "reset") await resetPassword(r.user);
  await save(list.filter((x) => x.id !== id));
  return Response.json({ ok: true, reset: action === "reset" });
}
