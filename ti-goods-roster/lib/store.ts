import "server-only";

export type Entries = Record<string, Record<string, string>>; // date -> person -> duty
export type Change = {
  id: string;
  date: string;
  person: string;
  value: string;
  requestedBy: string;
  at: number;
};
export type Month = { entries: Entries; remarks: Record<string, string>; requests: Change[] };

const URL_ = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const mem = ((globalThis as unknown as { __roster?: Map<string, string> }).__roster ??= new Map());

async function get(key: string): Promise<string | null> {
  if (!URL_ || !TOKEN) return mem.get(key) ?? null;
  const r = await fetch(`${URL_}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`store get failed: ${r.status}`);
  return ((await r.json()) as { result: string | null }).result;
}

async function set(key: string, value: string) {
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

export async function loadMonth(month: string): Promise<Month> {
  const raw = await get(`roster:${month}`);
  return raw ? (JSON.parse(raw) as Month) : { entries: {}, remarks: {}, requests: [] };
}

export const saveMonth = (month: string, data: Month) => set(`roster:${month}`, JSON.stringify(data));
