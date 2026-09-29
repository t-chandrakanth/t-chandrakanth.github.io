import { checkPin, setSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { user, pin } = (await req.json()) as { user?: string; pin?: string };
  if (!user || !pin || !checkPin(user, String(pin))) {
    return Response.json({ error: "Wrong name or PIN" }, { status: 401 });
  }
  await setSession(user);
  return Response.json({ ok: true });
}
