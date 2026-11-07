import { resetPassword } from "@/lib/auth";
import { ADMIN_ID, ADMIN_NAME } from "@/lib/config";

export const dynamic = "force-dynamic";

// The chief has nobody above them in the app, so the app owner resets the chief's password
// by opening  /api/reset/chief?key=<CRON_SECRET>  in a browser. Nothing else can do it.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  const given = new URL(req.url).searchParams.get("key") ?? "";
  if (!secret || given !== secret) return new Response("Not allowed", { status: 401 });
  await resetPassword(ADMIN_ID);
  return new Response(`${ADMIN_NAME}'s password is reset to 1234. They log in with 1234 and set a new one.`, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
