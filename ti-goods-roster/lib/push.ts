import "server-only";
import webpush, { type PushSubscription } from "web-push";
import { getRaw, setRaw } from "./store";
import { APP_TITLE } from "./config";

// Each person's phones: key push:<id> -> array of browser subscriptions.
const PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
export const pushReady = () => !!(PUBLIC && PRIVATE);
if (pushReady()) webpush.setVapidDetails("mailto:muster@example.com", PUBLIC, PRIVATE);

export async function listSubs(id: string): Promise<PushSubscription[]> {
  const raw = await getRaw(`push:${id}`);
  return raw ? (JSON.parse(raw) as PushSubscription[]) : [];
}
const saveSubs = (id: string, subs: PushSubscription[]) => setRaw(`push:${id}`, JSON.stringify(subs));

export async function addSub(id: string, sub: PushSubscription) {
  const subs = (await listSubs(id)).filter((s) => s.endpoint !== sub.endpoint);
  subs.push(sub);
  await saveSubs(id, subs.slice(-5)); // at most five devices per person
}
export async function removeSub(id: string, endpoint: string) {
  await saveSubs(id, (await listSubs(id)).filter((s) => s.endpoint !== endpoint));
}

// Sends one message to every phone of a person; drops subscriptions the browser has cancelled.
export async function notify(id: string, body: string, tag: string): Promise<number> {
  if (!pushReady()) return 0;
  const subs = await listSubs(id);
  const keep: PushSubscription[] = [];
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification(s, JSON.stringify({ title: APP_TITLE, body, tag }), { TTL: 6 * 3600 });
      keep.push(s); sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code !== 404 && code !== 410) keep.push(s); // keep unless the subscription is gone
    }
  }
  if (keep.length !== subs.length) await saveSubs(id, keep);
  return sent;
}
