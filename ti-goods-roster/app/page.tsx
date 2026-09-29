"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ADMIN_ID, PEOPLE, SHIFTS } from "@/lib/config";
import { suggest } from "@/lib/suggest";

type Change = { id: string; date: string; person: string; value: string; requestedBy: string };
type Data = {
  me: string;
  entries: Record<string, Record<string, string>>;
  remarks: Record<string, string>;
  requests: Change[];
};

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const nameOf = (id: string) => PEOPLE.find((p) => p.id === id)?.name ?? id;

function tone(v: string) {
  if (!v) return "transparent";
  if (v === "REST") return "var(--rest)";
  if (v === "LEAVE") return "var(--leave)";
  if (v === "00/07") return "var(--off)";
  if (v.includes("21/") ) return "var(--night)";
  if (v.startsWith("13/")) return "var(--aft)";
  return "var(--day)";
}

export default function Page() {
  const [me, setMe] = useState<string | null | undefined>(undefined);
  const [month, setMonth] = useState(() => iso(new Date()).slice(0, 7));
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState<{ date: string; person: string } | null>(null);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    const r = await fetch(`/api/roster?month=${month}`, { cache: "no-store" });
    if (r.status === 401) return setMe(null);
    if (!r.ok) return setErr("Could not load roster");
    const d = (await r.json()) as Data;
    setData(d);
    setMe(d.me);
  }, [month]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!me) return;
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [me, load]);

  const isAdmin = me === ADMIN_ID;
  const days = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return Array.from({ length: new Date(y, m, 0).getDate() }, (_, i) => iso(new Date(y, m - 1, i + 1)));
  }, [month]);
  const today = iso(new Date());

  async function save(date: string, person: string, value: string) {
    setBusy(true); setErr(""); setNote("");
    const r = await fetch("/api/roster", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ date, person, value }) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(j.error ?? "Failed");
    if (j.pending) setNote("Request sent to Raghav for approval.");
    setEdit(null); load();
  }

  async function saveRemark(date: string, remark: string) {
    await fetch("/api/roster", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ date, remark }) });
    load();
  }

  async function decide(c: Change, action: "approve" | "reject") {
    await fetch("/api/requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: c.id, date: c.date, action }) });
    load();
  }

  async function suggestDay(date: string) {
    const prev = iso(new Date(new Date(date).getTime() - 86400000));
    let yesterday = data?.entries[prev];
    if (!yesterday && prev.slice(0, 7) !== month) {
      const r = await fetch(`/api/roster?month=${prev.slice(0, 7)}`);
      if (r.ok) yesterday = ((await r.json()) as Data).entries[prev];
    }
    const s = suggest(yesterday);
    for (const [p, v] of Object.entries(s)) await save(date, p, v);
  }

  function shiftMonth(delta: number) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  }

  if (me === undefined) return <main className="muted">Loading…</main>;
  if (me === null) return <Login onDone={load} />;

  const mine = days.filter((d) => data?.entries[d]?.[me]).map((d) => ({ d, v: data!.entries[d][me] }));
  const upcoming = mine.filter((x) => x.d >= today).slice(0, 5);
  const team = PEOPLE.filter((p) => p.group === "team");
  const lr = PEOPLE.filter((p) => p.group === "lr");

  return (
    <main>
      <div className="bar">
        <h1>TI Goods Roster</h1>
        <div className="row">
          <span className="pill">{nameOf(me)}{isAdmin ? " · admin" : ""}</span>
          <button onClick={async () => { await fetch("/api/logout", { method: "POST" }); setMe(null); setData(null); }}>Logout</button>
        </div>
      </div>

      <div className="card">
        <strong>My next duties</strong>
        <div className="row small" style={{ marginTop: 8 }}>
          {upcoming.length ? upcoming.map((x) => (
            <span key={x.d}>{x.d.slice(8)}/{x.d.slice(5, 7)} <span className="chip" style={{ background: tone(x.v) }}>{x.v}</span></span>
          )) : <span className="muted">Nothing scheduled yet this month.</span>}
        </div>
        {!isAdmin && <p className="small muted" style={{ marginBottom: 0 }}>Everyone&apos;s duties are visible. You can only ask for a change to your own; Raghav approves.</p>}
      </div>

      {isAdmin && data && data.requests.length > 0 && (
        <div className="card">
          <strong>Change requests</strong>
          {data.requests.map((c) => (
            <div key={c.id} className="row" style={{ marginTop: 8 }}>
              <span>{nameOf(c.person)} · {c.date.slice(8)}/{c.date.slice(5, 7)} → <b>{c.value || "clear"}</b> (now: {data.entries[c.date]?.[c.person] || "—"})</span>
              <button className="primary" onClick={() => decide(c, "approve")}>Approve</button>
              <button onClick={() => decide(c, "reject")}>Reject</button>
            </div>
          ))}
        </div>
      )}

      <div className="bar">
        <div className="row">
          <button onClick={() => shiftMonth(-1)}>‹</button>
          <strong>{month}</strong>
          <button onClick={() => shiftMonth(1)}>›</button>
        </div>
        <span className="err">{err}</span><span className="small">{note}</span>
      </div>

      <div className="wrap">
        <table>
          <thead>
            <tr>
              <th>DATE</th>
              {team.map((p) => <th key={p.id}>{p.name.toUpperCase()}</th>)}
              {lr.map((p, i) => <th key={p.id} className={i === 0 ? "lr" : ""}>LR {p.name.toUpperCase()}</th>)}
              <th className="lr">REMARKS</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d} className={d === today ? "today" : ""}>
                <td className="date">
                  {DOW[new Date(d).getDay()]} {d.slice(8)}/{d.slice(5, 7)}
                  {isAdmin && <button className="small" style={{ marginLeft: 6, padding: "1px 6px" }} disabled={busy} onClick={() => suggestDay(d)} title="Fill from yesterday's rotation">✨</button>}
                </td>
                {[...team, ...lr].map((p, i) => {
                  const v = data?.entries[d]?.[p.id] ?? "";
                  const req = data?.requests.find((r) => r.date === d && r.person === p.id && !isAdmin);
                  const canEdit = isAdmin || (p.id === me && p.group === "team");
                  const editing = edit?.date === d && edit.person === p.id;
                  return (
                    <td key={p.id} className={(p.id === me ? "mine " : "") + (i === team.length ? "lr" : "")}>
                      {editing ? (
                        <Editor value={v} busy={busy} onSave={(x) => save(d, p.id, x)} onCancel={() => setEdit(null)} />
                      ) : (
                        <span
                          className={"chip" + (canEdit ? " editable" : "") + (req ? " pending" : "")}
                          style={{ background: tone(req ? req.value : v) }}
                          onClick={() => canEdit && setEdit({ date: d, person: p.id })}
                          title={req ? `Pending request: ${req.value}` : undefined}
                        >
                          {(req ? req.value : v) || (canEdit ? "+" : "")}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="lr small">
                  {isAdmin ? <input defaultValue={data?.remarks[d] ?? ""} onBlur={(e) => e.target.value !== (data?.remarks[d] ?? "") && saveRemark(d, e.target.value)} style={{ width: 160, padding: "2px 6px" }} /> : data?.remarks[d]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="legend small">
        {SHIFTS.map((s) => <span key={s.code} className="chip" style={{ background: tone(s.code) }}>{s.code} · {s.label}</span>)}
      </div>
    </main>
  );
}

function Editor({ value, busy, onSave, onCancel }: { value: string; busy: boolean; onSave: (v: string) => void; onCancel: () => void }) {
  const [v, setV] = useState(value);
  return (
    <span className="row" style={{ flexWrap: "nowrap", gap: 4 }}>
      <input list="shifts" value={v} onChange={(e) => setV(e.target.value)} style={{ width: 120, padding: "4px 6px" }} autoFocus />
      <datalist id="shifts">{SHIFTS.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}</datalist>
      <button className="primary" disabled={busy} onClick={() => onSave(v)} style={{ padding: "4px 8px" }}>✓</button>
      <button onClick={onCancel} style={{ padding: "4px 8px" }}>✕</button>
    </span>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [user, setUser] = useState(PEOPLE[0].id);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  return (
    <main>
      <form className="card login" onSubmit={async (e) => {
        e.preventDefault(); setErr("");
        const r = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ user, pin }) });
        if (r.ok) onDone(); else setErr((await r.json()).error ?? "Login failed");
      }}>
        <h1>TI Goods Roster</h1>
        <select value={user} onChange={(e) => setUser(e.target.value)}>
          {PEOPLE.map((p) => <option key={p.id} value={p.id}>{p.name}{p.group === "lr" ? " (LR)" : ""}</option>)}
        </select>
        <input type="password" inputMode="numeric" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
        <button className="primary">Login</button>
        <span className="err small">{err}</span>
      </form>
    </main>
  );
}
