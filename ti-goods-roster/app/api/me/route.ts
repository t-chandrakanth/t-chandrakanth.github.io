import { currentUser, needsPasswordChange } from "@/lib/auth";

export async function GET() {
  const me = await currentUser();
  if (!me) return Response.json({ me: null });
  return Response.json({ me, mustChange: await needsPasswordChange(me) });
}
