import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { PEOPLE } from "./config";

const SECRET = process.env.SESSION_SECRET ?? "dev-only-secret";
const COOKIE = "roster_session";

const sign = (v: string) => createHmac("sha256", SECRET).update(v).digest("hex");

export function checkPin(id: string, pin: string) {
  const expected = process.env[`PIN_${id.toUpperCase()}`] ?? (process.env.NODE_ENV === "production" ? "" : "1234");
  if (!expected || !PEOPLE.some((p) => p.id === id)) return false;
  const a = Buffer.from(pin);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

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
  if (!id || !sig) return null;
  const good = sign(id);
  if (sig.length !== good.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  return PEOPLE.some((p) => p.id === id) ? id : null;
}
