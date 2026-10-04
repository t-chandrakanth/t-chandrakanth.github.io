import { currentUser, needsPasswordChange } from "@/lib/auth";
import { hasStore } from "@/lib/store";

export async function GET() {
  const me = await currentUser();
  const storage = hasStore() || !process.env.VERCEL; // local dev without Redis is fine
  if (!me) return Response.json({ me: null, storage });
  return Response.json({ me, mustChange: await needsPasswordChange(me), storage });
}
