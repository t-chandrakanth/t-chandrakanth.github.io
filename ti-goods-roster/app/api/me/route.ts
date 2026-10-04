import { currentUser, needsPasswordChange } from "@/lib/auth";
import { hasStore } from "@/lib/store";
import { pushReady } from "@/lib/push";
import { TEAM } from "@/lib/config";

export async function GET() {
  const me = await currentUser();
  const storage = hasStore() || !process.env.VERCEL; // local dev without Redis is fine
  // team/push/cron are safe to show without login; they only say whether setup is complete.
  const setup = { team: TEAM.id, storage, push: pushReady(), cron: !!process.env.CRON_SECRET };
  if (!me) return Response.json({ me: null, ...setup });
  return Response.json({ me, mustChange: await needsPasswordChange(me), ...setup });
}
