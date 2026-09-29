import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { PEOPLE } from "./config";
import { getRaw, setRaw } from "./store";

const SECRET = process.env.SESSION_SECRET ?? "dev-only-secret";
const COOKIE = "roster_session";
export const INITIAL_PASSWORD = "1234";

const sign = (v: string) => createHmac("sha256", SECRET).update(v).digest("hex");
const hash = (pw: string, salt: string) => scryptSync(pw, salt, 32).toString("hex");
const eq = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

type Cred = { salt: string; hash: string };
async function cred(id: string): Promise<Cred | null> {
  const raw = await getRaw(`cred:${id}`);
  return raw ? (JSON.parse(raw) as Cred) : null;
}

// Until a person sets their own password, the initial password works and a change is forced.
export async function needsPasswordChange(id: string) {
  return !(await cred(id));
}

export async function checkPassword(id: string, pw: string) {
  if (!PEOPLE.some((p) => p.id === id)) return false;
  const c = await cred(id);
  return c ? eq(hash(pw, c.salt), c.hash) : eq(pw, INITIAL_PASSWORD);
}

export async function setPassword(id: string, pw: string) {
  const salt = randomBytes(16).toString("hex");
  await setRaw(`cred:${id}`, JSON.stringify({ salt, hash: hash(pw, salt) }));
}

export const resetPassword = (id: string) => setRaw(`cred:${id}`, "");

// Best-effort brute-force guard: 8 wrong tries per person per 10 minutes.
const fails: Map<string, number[]> = ((globalThis as unknown as { __fails?: Map<string, number[]> }).__fails ??= new Map());
export function tooManyTries(id: string) {
  const now = Date.now();
  const recent = (fails.get(id) ?? []).filter((t) => now - t < 600000);
  fails.set(id, recent);
  return recent.length >= 8;
}
export const noteFail = (id: string) => fails.set(id, [...(fails.get(id) ?? []), Date.now()]);
export const clearFails = (id: string) => fails.delete(id);

export async function setSession(id: string) {
  (await cookies()).set(COOKIE, `${id}.${sign(id)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser(): Promise<string | null> {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return null;
  const [id, sig] = v.split(".");
  if (!id || !sig || !eq(sig, sign(id))) return null;
  return PEOPLE.some((p) => p.id === id) ? id : null;
}

// For API routes: the signed-in user, or an error response.
export async function requireUser(): Promise<{ me: string } | { error: Response }> {
  const me = await currentUser();
  if (!me) return { error: Response.json({ error: "Login required" }, { status: 401 }) };
  if (await needsPasswordChange(me)) {
    return { error: Response.json({ error: "Set your own password first", mustChange: true }, { status: 403 }) };
  }
  return { me };
}
