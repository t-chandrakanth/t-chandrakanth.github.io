import { requireUser } from "@/lib/auth";
import { ACTIVE as PEOPLE, ADMIN_NAME, isAdmin } from "@/lib/config";
import { getRaw, loadMonth, setRaw } from "@/lib/store";
import { crLedger, type CrLedger } from "@/lib/cr";
import { todayIST } from "@/lib/range";

type Opening = { from: string; balances: Record<string, number> };
const KEY = "cr:opening";
const DATE = /^\d{4}-\d{2}-\d{2}$/;

async function opening(): Promise<Opening> {
  const raw = await getRaw(KEY);
  if (raw) return JSON.parse(raw) as Opening;
  return { from: todayIST().slice(0, 7) + "-01", balances: {} }; // nothing entered yet: count from the 1st of this month
}

const addMonths = (ym: string, n: number) => { const [y, m] = ym.split("-").map(Number); return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7); };

// Everyone can see the CR position; it is computed from the duties since the start date.
export async function GET() {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const o = await opening();
  const today = todayIST();
  const months: Record<string, Record<string, Record<string, string>>> = {};
  const last = addMonths(today.slice(0, 7), 1); // include next month: CR days already granted there count as taken
  for (let m = o.from.slice(0, 7); m <= last; m = addMonths(m, 1)) months[m] = (await loadMonth(m)).entries;
  const until = last + "-31";
  const people: Record<string, CrLedger> = {};
  for (const p of PEOPLE) {
    const entry = (d: string) => months[d.slice(0, 7)]?.[d]?.[p.id] ?? "";
    people[p.id] = crLedger(entry, o.from, today, o.balances[p.id] ?? 0, until);
  }
  return Response.json({ from: o.from, balances: o.balances, people });
}

// The chief enters how many CR each person is owed as of a start date.
export async function PUT(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  if (!isAdmin(u.me)) return Response.json({ error: `Only ${ADMIN_NAME} can set CR balances` }, { status: 403 });
  const b = (await req.json()) as { from?: string; balances?: Record<string, unknown> };
  if (!b.from || !DATE.test(b.from)) return Response.json({ error: "Bad start date" }, { status: 400 });
  const balances: Record<string, number> = {};
  for (const p of PEOPLE) {
    const n = Number(b.balances?.[p.id] ?? 0);
    balances[p.id] = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  }
  await setRaw(KEY, JSON.stringify({ from: b.from, balances }));
  return Response.json({ ok: true });
}
