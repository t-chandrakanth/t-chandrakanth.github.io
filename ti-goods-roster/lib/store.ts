import "server-only";
import { seedSep2026 } from "./seed-2026-09";
import { STORE_PREFIX } from "./config";

export type Entries = Record<string, Record<string, string>>; // date -> person -> duty
export type Change = {
  id: string;
  date: string;
  person: string;
  value: string;
  requestedBy: string;
  note?: string;
  to?: string; // last day of a multi-day request; `date` is the first day
  at: number;
};
export type Month = { entries: Entries; remarks: Record<string, string>; requests: Change[] };

const URL_ = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
// False on Vercel means nothing is saved: each server keeps its own memory and logins/duties vanish at random.
export const hasStore = () => !!(URL_ && (process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN));
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const mem = ((globalThis as unknown as { __roster?: Map<string, string> }).__roster ??= new Map());

export async function getRaw(k: string): Promise<string | null> {
  const key = STORE_PREFIX + k;
  if (!URL_ || !TOKEN) return mem.get(key) ?? null;
  const r = await fetch(`${URL_}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`store get failed: ${r.status}`);
  return ((await r.json()) as { result: string | null }).result;
}

export async function setRaw(k: string, value: string) {
  const key = STORE_PREFIX + k;
  if (!URL_ || !TOKEN) {
    mem.set(key, value);
    return;
  }
  const r = await fetch(`${URL_}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: value,
  });
  if (!r.ok) throw new Error(`store set failed: ${r.status}`);
}

// 21/04 and 21/00 were typed by mistake for the night duty 21/24.
const fixNight = (v: string) => v.replace(/\b21\/(04|00)\b/g, "21/24");

export async function loadMonth(month: string): Promise<Month> {
  const raw = await getRaw(`roster:${month}`);
  if (raw) {
    const m = JSON.parse(raw) as Month;
    for (const day of Object.values(m.entries)) for (const p of Object.keys(day)) day[p] = fixNight(day[p]);
    for (const r of m.requests) r.value = fixNight(r.value);
    const fixed = JSON.stringify(m);
    if (fixed !== raw) await setRaw(`roster:${month}`, fixed); // save the corrected data
    return m;
  }
  // First open of September 2026 loads the duties from the muster sheet.
  return month === "2026-09" && !STORE_PREFIX ? seedSep2026() : { entries: {}, remarks: {}, requests: [] };
}

export const saveMonth = (month: string, data: Month) => setRaw(`roster:${month}`, JSON.stringify(data));
