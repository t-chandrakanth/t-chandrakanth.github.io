import { checkPassword, clearFails, needsPasswordChange, noteFail, setSession, tooManyTries } from "@/lib/auth";

export async function POST(req: Request) {
  const { user, password } = (await req.json()) as { user?: string; password?: string };
  if (!user || typeof password !== "string") return Response.json({ error: "Enter name and password" }, { status: 400 });
  if (tooManyTries(user)) return Response.json({ error: "Too many wrong tries. Wait 10 minutes." }, { status: 429 });
  if (!(await checkPassword(user, password))) {
    noteFail(user);
    return Response.json({ error: "Wrong name or password" }, { status: 401 });
  }
  clearFails(user);
  await setSession(user);
  return Response.json({ ok: true, mustChange: await needsPasswordChange(user) });
}
