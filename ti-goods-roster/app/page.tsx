"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ADMIN_ID, PEOPLE, SHIFTS } from "@/lib/config";
import { suggest } from "@/lib/suggest";
import { countDuties } from "@/lib/summary";

type Change = { id: string; date: string; person: string; value: string; requestedBy: string };
type Data = { me: string; entries: Record<string, Record<string, string>>; remarks: Record<string, string>; requests: Change[] };
type Tab = "today" | "roster" | "sum" | "req" | "me";

const COLORS: Record<string, string> = { raghav: "#2447d8", mahesh: "#0e8f6e", vishnu: "#c2571a", narendra: "#8a3fd0", teja: "#0a7fa8", subbareddy: "#b0356b" };
const TIMES: Record<string, string> = { "07/13": "07:00 to 13:00", "13/21": "13:00 to 21:00", "21/24": "21:00 to 24:00", "00/07": "00:00 to 07:00", "07/13 21/24": "07:00 to 13:00, 21:00 to 24:00", REST: "Weekly rest", LEAVE: "On leave" };
const NAMES: Record<string, string> = { "07/13": "Day", "13/21": "Afternoon", "21/24": "Night", "00/07": "Night off", "07/13 21/24": "Day + Night", REST: "Rest", LEAVE: "Leave" };
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dd = (d: string) => new Date(d + "T00:00:00");
const long = (d: string) => `${DOW[dd(d).getDay()]} ${+d.slice(8)} ${MON[+d.slice(5, 7) - 1]}`;
const nm = (id: string) => PEOPLE.find((p) => p.id === id)?.name ?? id;
const group = (id: string) => PEOPLE.find((p) => p.id === id)?.group;

function kind(v: string) {
  if (!v) return "rest";
  if (v === "REST") return "rest";
  if (v === "LEAVE") return "leave";
  if (v === "00/07") return "off";
  if (v.includes("21/") || v.startsWith("20/") || v.startsWith("18/")) return "night";
  if (v.startsWith("13/")) return "aft";
  return "day";
}
const label = (v: string) => NAMES[v] ?? (kind(v) === "rest" ? "Rest" : "Custom duty");

function segs(v: string) {
  const out: [number, number][] = [];
  v.split(/\s+/).forEach((t) => {
    const m = t.match(/^(\d+)\/(\d+)$/);
    if (!m) return;
    const a = +m[1];
    let b = +m[2];
    if (b <= a) b += 24;
    if (b > 24) { out.push([a, 24]); out.push([0, b - 24]); } else out.push([a, b]);
  });
  return out;
}

function Pill({ v, pend }: { v: string; pend?: boolean }) {
  const k = kind(v);
  return <span className={"pill" + (pend ? " pend" : "")} style={{ background: `var(--${k})`, color: `var(--${k}-ink)` }}>{v || "No duty"}</span>;
}
const Av = ({ id, sm }: { id: string; sm?: boolean }) => <div className={"av" + (sm ? " sm" : "")} style={{ background: COLORS[id] }}>{nm(id)[0]}</div>;

const ICONS: Record<Tab, string> = {
  today: "M4 7h16M7 3v4M17 3v4M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM12 11v4l2 1",
  roster: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  sum: "M5 20V10M12 20V4M19 20v-7",
  req: "M4 12l5 5L20 6",
  me: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c1-4 4-6 8-6s7 2 8 6",
};

async function api(url: string, body?: unknown, method = "POST") {
  const r = await fetch(url, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  return { ok: r.ok, status: r.status, j: (await r.json().catch(() => ({}))) as Record<string, unknown> };
}

export default function Page() {
  const [auth, setAuth] = useState<{ me: string | null; mustChange?: boolean } | undefined>();
  const check = useCallback(async () => {
    const r = await fetch("/api/me", { cache: "no-store" });
    setAuth((await r.json()) as { me: string | null; mustChange?: boolean });
  }, []);
  useEffect(() => { check(); }, [check]);

  if (!auth) return <div className="phone"><p className="empty">Loading…</p></div>;
  if (!auth.me) return <Login onDone={check} />;
  if (auth.mustChange) return <SetPassword first onDone={check} />;
  return <App me={auth.me} onLogout={async () => { await api("/api/logout"); check(); }} />;
}

function Brand({ sub }: { sub: string }) {
  return (
    <div className="brand">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.jpg" alt="Indian Railways" />
      <h1>TI GOODS MUSTER</h1>
      <div className="rule" />
      <p>{sub}</p>
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [user, setUser] = useState(PEOPLE[0].id);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="phone">
      <form className="login" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setErr("");
        const r = await api("/api/login", { user, password: pw });
        setBusy(false);
        if (r.ok) onDone(); else setErr(String(r.j.error ?? "Login failed"));
      }}>
        <Brand sub="Login to see your duties" />
        <div className="field">
          <label htmlFor="name">Name</label>
          <select id="name" value={user} onChange={(e) => setUser(e.target.value)}>
            {PEOPLE.map((p) => <option key={p.id} value={p.id}>{p.name}{p.group === "lr" ? " (LR)" : ""}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pw">Password</label>
          <input id="pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        {err && <div className="err" role="alert">{err}</div>}
        <button className="btn pri" disabled={busy || !pw}>{busy ? "Signing in…" : "Login"}</button>
        <p className="note">First time? Your password is 1234. You will be asked to set your own.</p>
      </form>
    </div>
  );
}

function SetPassword({ first, onDone }: { first?: boolean; onDone: () => void }) {
  const [cur, setCur] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (a !== b) return setErr("The two passwords do not match");
    setBusy(true);
    const r = await api("/api/password", { current: cur, next: a });
    setBusy(false);
    if (r.ok) onDone(); else setErr(String(r.j.error ?? "Could not save"));
  };
  return (
    <form className={first ? "login" : "card"} onSubmit={submit}>
      {first ? <Brand sub="Set your own password to continue" /> : <h2>Change password</h2>}
      {!first && (
        <div className="field"><label htmlFor="cur">Current password</label><input id="cur" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} /></div>
      )}
      <div className="field"><label htmlFor="n1">New password</label><input id="n1" type="password" autoComplete="new-password" value={a} onChange={(e) => setA(e.target.value)} /></div>
      <div className="field"><label htmlFor="n2">Repeat new password</label><input id="n2" type="password" autoComplete="new-password" value={b} onChange={(e) => setB(e.target.value)} /></div>
      {err && <div className="err" role="alert">{err}</div>}
      <button className="btn pri" disabled={busy || a.length < 4}>{busy ? "Saving…" : "Save password"}</button>
      <p className="note">At least 4 characters, and not 1234.</p>
    </form>
  );
}

function App({ me, onLogout }: { me: string; onLogout: () => void }) {
  const today = iso(new Date());
  const [tab, setTab] = useState<Tab>("today");
  const [day, setDay] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [view, setView] = useState<"mine" | "all">("mine");
  const [data, setData] = useState<Data | null>(null);
  const [sheet, setSheet] = useState<{ d: string; p: string } | null>(null);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const admin = me === ADMIN_ID;
  const stripRef = useRef<HTMLDivElement>(null);
  const [installEvt, setInstallEvt] = useState<{ prompt: () => Promise<void> } | null>(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    const onPrompt = (e: Event) => { e.preventDefault(); setInstallEvt(e as unknown as { prompt: () => Promise<void> }); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const load = useCallback(async () => {
    const r = await fetch(`/api/roster?month=${month}`, { cache: "no-store" });
    if (r.ok) setData((await r.json()) as Data);
  }, [month]);
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
  useEffect(() => { if (day.slice(0, 7) !== month) setMonth(day.slice(0, 7)); }, [day, month]);
  useEffect(() => {
    const on = stripRef.current?.querySelector<HTMLElement>(".on");
    if (on && stripRef.current) stripRef.current.scrollLeft = on.offsetLeft - stripRef.current.clientWidth / 2 + 25;
  }, [day, tab, data]);

  const say = (t: string) => { setToast(t); setTimeout(() => setToast((x) => (x === t ? "" : x)), 2600); };
  const canEdit = (id: string) => admin || (id === me && group(id) === "team");
  const entry = (d: string, id: string) => data?.entries[d]?.[id] ?? "";
  const days = (m: string) => {
    const [y, mo] = m.split("-").map(Number);
    return Array.from({ length: new Date(y, mo, 0).getDate() }, (_, i) => `${m}-${pad(i + 1)}`);
  };

  async function save(d: string, p: string, v: string) {
    setBusy(true);
    const r = await api("/api/roster", { date: d, person: p, value: v }, "PUT");
    setBusy(false); setSheet(null);
    if (!r.ok) return say(String(r.j.error ?? "Could not save"));
    say(r.j.pending ? "Request sent to Raghav." : "Saved.");
    load();
  }
  async function decide(c: Change, action: "approve" | "reject") {
    await api("/api/requests", { id: c.id, date: c.date, action });
    say(action === "approve" ? `Approved. ${nm(c.person)} is updated.` : "Request rejected.");
    load();
  }
  async function autoFill(d: string) {
    const prev = iso(new Date(dd(d).getTime() - 86400000));
    let y = data?.entries[prev];
    if (!y && prev.slice(0, 7) !== month) {
      const r = await fetch(`/api/roster?month=${prev.slice(0, 7)}`);
      if (r.ok) y = ((await r.json()) as Data).entries[prev];
    }
    for (const [p, v] of Object.entries(suggest(y))) await api("/api/roster", { date: d, person: p, value: v }, "PUT");
    say("Filled from yesterday's rotation. Check and adjust."); load();
  }

  const reqs = data?.requests ?? [];
  const pending = reqs.length;
  const title = tab === "today" ? `Hi ${nm(me)}` : tab === "roster" ? "Roster" : tab === "sum" ? "Summary" : tab === "req" ? "Requests" : "Me";

  const PersonRow = ({ d, id, first }: { d: string; id: string; first?: boolean }) => {
    const v = entry(d, id);
    const q = reqs.find((r) => r.date === d && r.person === id && !admin);
    const inner = (
      <>
        <Av id={id} />
        <div className="nm">{nm(id)}{id === me && <span className="tag">You</span>}<small>{group(id) === "lr" ? "LR candidate" : "Team"}{q ? " · change pending" : ""}</small></div>
        <Pill v={q ? q.value : v} pend={!!q} />
      </>
    );
    return canEdit(id)
      ? <button className={"row" + (first ? " first" : "")} onClick={() => setSheet({ d, p: id })}>{inner}</button>
      : <div className={"row" + (first ? " first" : "")}>{inner}</div>;
  };

  const SummaryCards = () => (
    <>
      {PEOPLE.map((p) => {
        const c = countDuties(days(month).map((d) => entry(d, p.id)));
        const cells: [string, number, string][] = [
          ["Day", c.day, "day"], ["Afternoon", c.afternoon, "aft"], ["Night", c.night, "night"],
          ["Night off", c.nightOff, "off"], ["Rest", c.rest, "rest"], ["Leave", c.leave, "leave"],
        ];
        return (
          <div key={p.id} className="card">
            <div className="row first" style={{ padding: 0 }}><Av id={p.id} /><div className="nm">{p.name}{p.id === me && <span className="tag">You</span>}<small>{c.worked} duty days · {c.marked} days marked{c.other ? ` · ${c.other} other` : ""}</small></div></div>
            <div className="sumgrid">
              {cells.map(([t, n, k]) => (
                <div key={t} style={{ background: `var(--${k})`, color: `var(--${k}-ink)` }}><b>{n}</b><span>{t}</span></div>
              ))}
            </div>
          </div>
        );
      })}
      <div className="note">Day+Night counts once as Day and once as Night. Night off is the 00/07 part after a night duty.</div>
    </>
  );

  const myV = entry(day, me);
  return (
    <div className="phone">
      <header>
        <div><h1>{title}</h1><p>TI Goods Muster · {long(today)}</p></div>
        <button className="me-btn" onClick={() => setTab("me")}><Av id={me} />{admin ? "Admin" : "Team"}</button>
      </header>
      <main>
        {tab === "today" && (<>
          <div className="strip" ref={stripRef}>
            {days(day.slice(0, 7)).map((k) => (
              <button key={k} className={"dchip" + (k === day ? " on" : "") + (k === today ? " now" : "")} onClick={() => setDay(k)}>{DOW[dd(k).getDay()]}<b>{+k.slice(8)}</b></button>
            ))}
          </div>
          <div className="hero">
            <small>{day === today ? "Your duty today" : `Your duty on ${long(day)}`}</small>
            <div className="big">{myV || "No duty"}</div>
            <div className="lbl">{myV ? label(myV) : "Nothing assigned yet"}</div>
            <div className="bar">{segs(myV).map(([a, b], i) => <i key={i} style={{ left: `${(a / 24) * 100}%`, width: `${((b - a) / 24) * 100}%` }} />)}</div>
            <div className="ticks"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
          </div>
          {data?.remarks[day] && <div className="note">Remark: {data.remarks[day]}</div>}
          <div className="card">
            <div className="dayhead"><h2>Everyone on {long(day)}</h2>
              {admin && <button className="tag" disabled={busy} onClick={() => autoFill(day)}>✨ Auto-fill</button>}
            </div>
            {PEOPLE.map((p, i) => <PersonRow key={p.id} d={day} id={p.id} first={i === 0} />)}
          </div>
          {!admin && <div className="note">{group(me) === "lr" ? "You can see all duties. Raghav decides LR shifts." : "Tap your own row to ask for a change. Raghav approves it."}</div>}
        </>)}

        {(tab === "roster" || tab === "sum") && (<>
          <div className="monthbar">
            <button aria-label="Previous month" onClick={() => { const d = dd(month + "-01"); d.setMonth(d.getMonth() - 1); setMonth(iso(d).slice(0, 7)); }}>‹</button>
            <strong>{MON[+month.slice(5) - 1]} {month.slice(0, 4)}</strong>
            <button aria-label="Next month" onClick={() => { const d = dd(month + "-01"); d.setMonth(d.getMonth() + 1); setMonth(iso(d).slice(0, 7)); }}>›</button>
          </div>
          {tab === "roster" && <div className="seg">
            <button className={view === "mine" ? "on" : ""} onClick={() => setView("mine")}>My month</button>
            <button className={view === "all" ? "on" : ""} onClick={() => setView("all")}>Everyone</button>
          </div>}
          {tab === "sum" && <SummaryCards />}
          {tab === "roster" && days(month).map((d) => (
            <button key={d} className="card" style={{ textAlign: "left" }} onClick={() => { setDay(d); setTab("today"); }}>
              <div className="dayhead"><b>{long(d)}{d === today && <span className="tag">Today</span>}</b><span>{data?.remarks[d] ?? ""}</span></div>
              {view === "mine" ? (
                <div className="row first" style={{ padding: 0 }}><div className="nm" style={{ color: "var(--muted)", fontWeight: 400 }}>{entry(d, me) ? label(entry(d, me)) : "No duty"}</div><Pill v={entry(d, me)} /></div>
              ) : (
                <div className="mini">{PEOPLE.map((p) => <div key={p.id}><Av id={p.id} sm /><Pill v={entry(d, p.id)} /></div>)}</div>
              )}
            </button>
          ))}
        </>)}

        {tab === "req" && (reqs.length === 0
          ? <div className="empty">{admin ? "No requests waiting. Team change requests appear here." : "You have no pending requests."}</div>
          : reqs.map((c) => (
            <div key={c.id} className="card">
              <div className="row first" style={{ padding: 0 }}><Av id={c.person} /><div className="nm">{nm(c.person)}<small>{long(c.date)}</small></div></div>
              <div className="row first" style={{ padding: 0 }}><div className="nm"><small>Now</small></div><Pill v={data?.entries[c.date]?.[c.person] ?? ""} /><span>→</span><Pill v={c.value} /></div>
              {admin
                ? <div className="btns"><button className="btn pri" onClick={() => decide(c, "approve")}>Approve</button><button className="btn" onClick={() => decide(c, "reject")}>Reject</button></div>
                : <div className="note">Waiting for Raghav to approve.</div>}
            </div>
          )))}

        {tab === "me" && (<>
          <div className="card">
            <div className="row first" style={{ padding: 0 }}><Av id={me} /><div className="nm">{nm(me)}<small>{admin ? "Admin" : group(me) === "lr" ? "LR candidate, view only" : "Team member"}</small></div></div>
            <button className="btn" onClick={onLogout}>Logout</button>
          </div>
          {!installed && (
            <div className="card">
              <h2>Install on your phone</h2>
              {installEvt
                ? <button className="btn pri" onClick={async () => { await installEvt.prompt(); setInstallEvt(null); }}>Install app</button>
                : <div className="note">Android or Chrome: open the browser menu and tap <b>Install app</b> or <b>Add to Home screen</b>. iPhone: tap Share, then <b>Add to Home Screen</b>.</div>}
            </div>
          )}
          <SetPassword onDone={() => say("Password changed.")} />
          {admin && (
            <div className="card">
              <h2>Reset a password to 1234</h2>
              {PEOPLE.filter((p) => p.id !== me).map((p) => (
                <div key={p.id} className="row"><Av id={p.id} /><div className="nm">{p.name}</div>
                  <button className="btn" onClick={async () => { await api("/api/password", { reset: p.id }); say(`${p.name} can log in with 1234 and set a new password.`); }}>Reset</button>
                </div>
              ))}
            </div>
          )}
        </>)}
      </main>
      <nav>
        {(["today", "roster", "sum", "req", "me"] as Tab[]).map((k) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
            <svg viewBox="0 0 24 24"><path d={ICONS[k]} /></svg>
            {k === "today" ? "Today" : k === "roster" ? "Roster" : k === "sum" ? "Summary" : k === "req" ? "Requests" : "Me"}
            {k === "req" && pending > 0 && <span className="badge">{pending}</span>}
          </button>
        ))}
      </nav>
      {sheet && (
        <div className="scrim" onClick={(e) => e.target === e.currentTarget && setSheet(null)}>
          <div className="sheet">
            <div className="grab" />
            <div className="row first" style={{ padding: 0 }}><Av id={sheet.p} /><div className="nm">{nm(sheet.p)}<small>{long(sheet.d)}</small></div></div>
            <div className="note">{admin ? "Pick a duty. It saves straight away." : "Pick the duty you want. Raghav will approve it."}</div>
            {[...SHIFTS.map((s) => s.code), ""].map((code) => (
              <button key={code || "clear"} className="opt" disabled={busy} onClick={() => save(sheet.d, sheet.p, code)}>
                <span>{code ? NAMES[code] ?? code : "Clear duty"}<br /><small>{code ? TIMES[code] : "Leave the day empty"}</small></span>
                {code && <Pill v={code} />}
              </button>
            ))}
          </div>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
