import { requireUser } from "@/lib/auth";
import { addSub, listSubs, pushReady, removeSub } from "@/lib/push";

// GET: is push set up, and is this phone subscribed?  POST: subscribe this phone.  DELETE: unsubscribe it.
export async function GET(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const endpoint = new URL(req.url).searchParams.get("endpoint") ?? "";
  const subs = await listSubs(u.me);
  return Response.json({ ready: pushReady(), publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "", subscribed: subs.some((s) => s.endpoint === endpoint), devices: subs.length });
}

export async function POST(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  if (!pushReady()) return Response.json({ error: "Notifications are not set up on the server yet" }, { status: 503 });
  const sub = (await req.json()) as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys.auth) return Response.json({ error: "Bad subscription" }, { status: 400 });
  await addSub(u.me, { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const { endpoint } = (await req.json()) as { endpoint?: string };
  if (endpoint) await removeSub(u.me, endpoint);
  return Response.json({ ok: true });
}
