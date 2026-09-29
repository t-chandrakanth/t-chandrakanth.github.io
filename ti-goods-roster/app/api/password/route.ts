import { INITIAL_PASSWORD, checkPassword, currentUser, needsPasswordChange, resetPassword, setPassword } from "@/lib/auth";
import { isAdmin, personById } from "@/lib/config";

// Change your own password, or (Raghav) reset someone to the initial password.
export async function POST(req: Request) {
  const me = await currentUser();
  if (!me) return Response.json({ error: "Login required" }, { status: 401 });
  const b = (await req.json()) as { current?: string; next?: string; reset?: string };

  if (b.reset) {
    if (!isAdmin(me) || !personById(b.reset)) return Response.json({ error: "Not allowed" }, { status: 403 });
    await resetPassword(b.reset);
    return Response.json({ ok: true });
  }

  const next = b.next ?? "";
  if (next.length < 4) return Response.json({ error: "Use at least 4 characters" }, { status: 400 });
  if (next === INITIAL_PASSWORD) return Response.json({ error: "Choose a password other than 1234" }, { status: 400 });
  if (!(await needsPasswordChange(me)) && !(await checkPassword(me, b.current ?? ""))) {
    return Response.json({ error: "Current password is wrong" }, { status: 401 });
  }
  await setPassword(me, next);
  return Response.json({ ok: true });
}
