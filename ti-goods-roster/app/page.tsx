"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ADMIN_ID, PEOPLE, SHIFTS } from "@/lib/config";
import { suggest } from "@/lib/suggest";
import { countDuties } from "@/lib/summary";
import { rangeDates } from "@/lib/range";
import { holidayName } from "@/lib/holidays";
import { buildMessage, whatsappLink } from "@/lib/share";

type Change = { id: string; date: string; person: string; value: string; requestedBy: string; note?: string; to?: string };
type Data = { me: string; entries: Record<string, Record<string, string>>; remarks: Record<string, string>; requests: Change[] };
type Tab = "today" | "roster" | "sum" | "req" | "me";

const COLORS: Record<string, string> = { raghav: "#2447d8", mahesh: "#0e8f6e", vishnu: "#c2571a", narendra: "#8a3fd0", teja: "#0a7fa8", subbareddy: "#b0356b" };
const TIMES: Record<string, string> = { "08/20": "08:00 to 20:00", "07/13": "07:00 to 13:00", "13/21": "13:00 to 21:00", "21/24": "21:00 to 00:00", "00/07": "00:00 to 07:00", "07/13 21/24": "07:00 to 13:00, 21:00 to 00:00", REST: "Weekly rest", LEAVE: "On leave" };
const NAMES: Record<string, string> = { "08/20": "General", "07/13": "Day", "13/21": "Afternoon", "21/24": "Night", "00/07": "Night off", "07/13 21/24": "Day + Night", REST: "Rest", LEAVE: "Leave" };
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const isRed = (d: string) => dd(d).getDay() === 0 || !!holidayName(d);
const days_ = (a: string, b: string) => rangeDates(a, b).length;
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
const label = (v: string) => NAMES[v] ?? (kind(v) === "rest" ? "Rest" : kind(v) === "night" ? "Night" : kind(v) === "aft" ? "Afternoon" : "Day");

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

type InstallEvt = { prompt: () => Promise<void> };
function useInstall() {
  const [evt, setEvt] = useState<InstallEvt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    setInstalled(window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as unknown as InstallEvt); };
    const onInstalled = () => { setInstalled(true); setEvt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);
  const install = async () => { if (evt) { await evt.prompt(); setEvt(null); } };
  return { evt, installed, ios, install };
}

function InstallBanner() {
  const { evt, installed, ios, install } = useInstall();
  const [hidden, setHidden] = useState(false);
  const [help, setHelp] = useState(false);
  useEffect(() => { try { setHidden(sessionStorage.getItem("hideInstall") === "1"); } catch {} }, []);
  if (installed || hidden) return null;
  const close = () => { setHidden(true); try { sessionStorage.setItem("hideInstall", "1"); } catch {} };
  return (
    <div className="install">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" />
      <div className="txt">
        <b>Install TI Goods Muster</b>
        <span>{help ? (ios ? "Tap the Share button, then Add to Home Screen." : "Open the browser menu, then tap Install app or Add to Home screen.") : "Open it like an app from your home screen."}</span>
      </div>
      <button className="btn pri" onClick={evt ? install : () => setHelp((h) => !h)}>{evt ? "Tap here to install" : help ? "Got it" : "How to install"}</button>
      <button className="x" aria-label="Hide" onClick={close}>✕</button>
    </div>
  );
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

function Calendar({ selected, onPick }: { selected?: string; onPick?: (d: string) => void }) {
  const now = new Date();
  const [ym, setYm] = useState<[number, number]>(() => (selected ? [+selected.slice(0, 4), +selected.slice(5, 7) - 1] : [now.getFullYear(), now.getMonth()]));
  const [y, m] = ym;
  const go = (n: number) => { const d = new Date(y, m + n, 1); setYm([d.getFullYear(), d.getMonth()]); };
  const first = new Date(y, m, 1).getDay();
  const count = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => `${y}-${pad(m + 1)}-${pad(i + 1)}`)];
  const todayIso = iso(now);
  const hols = Array.from({ length: count }, (_, i) => `${y}-${pad(m + 1)}-${pad(i + 1)}`).filter((d) => holidayName(d));
  return (
    <div className="card cal">
      <div className="monthbar">
        <button type="button" aria-label="Previous month" onClick={() => go(-1)}>‹</button>
        <strong>{MON[m]} {y}</strong>
        <button type="button" aria-label="Next month" onClick={() => go(1)}>›</button>
      </div>
      <div className="calgrid">
        {DOW.map((w, i) => <span key={w} className={"calh" + (i === 0 ? " red" : "")}>{w}</span>)}
        {cells.map((d, i) => d
          ? <button type="button" key={d} className={"calc" + (isRed(d) ? " red" : "") + (d === todayIso ? " now" : "") + (d === selected ? " on" : "")} onClick={() => onPick?.(d)}>{+d.slice(8)}</button>
          : <span key={"e" + i} />)}
      </div>
      {hols.map((d) => <div key={d} className="calh-n"><b>{+d.slice(8)} {MON[m]}</b> · {holidayName(d)}</div>)}
    </div>
  );
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
        <InstallBanner />
        <Brand sub="Login to see your duties" />
        <Calendar />
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
      {first && <InstallBanner />}
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
  const [reqNote, setReqNote] = useState("");
  const [range, setRange] = useState<{ id?: string; from: string; to: string; type: string } | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [sumSel, setSumSel] = useState<{ p: string; k: string } | null>(null);
  const [restOnly, setRestOnly] = useState(false);
  const [ticker, setTicker] = useState<Change[]>([]);
  const admin = me === ADMIN_ID;
  const stripRef = useRef<HTMLDivElement>(null);
  const inst = useInstall();

  const load = useCallback(async () => {
    const r = await fetch(`/api/roster?month=${month}`, { cache: "no-store" });
    if (r.ok) setData((await r.json()) as Data);
  }, [month]);
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
  const tomorrow = iso(new Date(dd(today).getTime() + 86400000));
  const [tmData, setTmData] = useState<Data | null>(null);
  const loadTomorrow = useCallback(async () => {
    const r = await fetch(`/api/roster?month=${tomorrow.slice(0, 7)}`, { cache: "no-store" });
    if (r.ok) setTmData((await r.json()) as Data);
  }, [tomorrow]);
  useEffect(() => { loadTomorrow(); const t = setInterval(loadTomorrow, 30000); return () => clearInterval(t); }, [loadTomorrow]);
  useEffect(() => { if (data) loadTomorrow(); }, [data, loadTomorrow]);
  const loadTicker = useCallback(async () => {
    const t = dd(today);
    const ms = [-1, 0, 1, 2].map((i) => iso(new Date(t.getFullYear(), t.getMonth() + i, 1)).slice(0, 7));
    const all: Change[] = [];
    for (const m of ms) {
      const r = await fetch(`/api/roster?month=${m}`, { cache: "no-store" });
      if (r.ok) all.push(...(((await r.json()) as Data).requests));
    }
    setTicker(all.sort((a, b) => a.date.localeCompare(b.date)));
  }, [today]);
  useEffect(() => { loadTicker(); const t = setInterval(loadTicker, 30000); return () => clearInterval(t); }, [loadTicker]);
  useEffect(() => { if (data) loadTicker(); }, [data, loadTicker]);
  // Follow the selected day's month, but let the ‹ › buttons on Roster/Summary browse other months freely.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setMonth(day.slice(0, 7)); }, [day]);
  useEffect(() => {
    const on = stripRef.current?.querySelector<HTMLElement>(".on");
    if (on && stripRef.current) stripRef.current.scrollLeft = on.offsetLeft - stripRef.current.clientWidth / 2 + 25;
  }, [day, tab, data]);

  const say = (t: string) => { setToast(t); setTimeout(() => setToast((x) => (x === t ? "" : x)), 2600); };
  const canEdit = (id: string, d?: string) => admin || (id === me && group(id) === "team" && (!d || d >= today));
  const entry = (d: string, id: string) => data?.entries[d]?.[id] ?? "";
  const days = (m: string) => {
    const [y, mo] = m.split("-").map(Number);
    return Array.from({ length: new Date(y, mo, 0).getDate() }, (_, i) => `${m}-${pad(i + 1)}`);
  };

  async function save(d: string, p: string, v: string) {
    setBusy(true);
    const r = await api("/api/roster", { date: d, person: p, value: v, note: reqNote }, "PUT");
    setBusy(false); setSheet(null); setReqNote("");
    if (!r.ok) return say(String(r.j.error ?? "Could not save"));
    say(r.j.pending ? "Request sent to Raghav." : r.j.nightOff ? "Saved. Next day set to Night off 00/07." : "Saved.");
    load();
  }
  async function decide(c: Change, action: "approve" | "reject") {
    await api("/api/requests", { id: c.id, date: c.date, action });
    say(action === "approve" ? `Approved. ${nm(c.person)} is updated.` : "Request rejected.");
    load();
  }
  const when = (c: Change) => (c.to ? `${long(c.date)} to ${long(c.to)} (${days_(c.date, c.to)} days)` : long(c.date));
  async function sendRange() {
    if (!range) return;
    if (range.to < range.from) return say("The last day is before the first day.");
    if (range.from < today) return say("That day is over. Only Raghav can change a completed day.");
    setBusy(true);
    if (range.id) await api("/api/requests", { id: range.id, date: range.from }, "DELETE");
    const r = await api("/api/roster", { date: range.from, to: range.to > range.from ? range.to : undefined, person: me, value: range.type, note: reqNote }, "PUT");
    setBusy(false);
    if (!r.ok) return say(String(r.j.error ?? "Could not send"));
    setRange(null); setReqNote("");
    say("Request sent to Raghav."); load();
  }
  async function removeReq(c: Change) {
    const r = await api("/api/requests", { id: c.id, date: c.date }, "DELETE");
    if (r.ok) setTicker((t) => t.filter((x) => x.id !== c.id));
    say(r.ok ? "Request deleted." : String(r.j.error ?? "Could not delete"));
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

  // Requests from last month to two months ahead, so a leave asked for next month still shows.
  const reqs = ticker;
  const pending = reqs.length;
  const title = tab === "today" ? `Hi ${nm(me)}` : tab === "roster" ? "Roster" : tab === "sum" ? "Summary" : tab === "req" ? "Requests" : "Me";

  const PersonRow = ({ d, id, first }: { d: string; id: string; first?: boolean }) => {
    const v = entry(d, id);
    const q = reqs.find((r) => r.person === id && d >= r.date && d <= (r.to ?? r.date) && !admin);
    const inner = (
      <>
        <Av id={id} />
        <div className="nm">{nm(id)}{id === me && <span className="tag">You</span>}<small>{group(id) === "lr" ? "LR candidate" : "Team"}{q ? " · change pending" : ""}</small></div>
        <Pill v={q ? q.value : v} pend={!!q} />
      </>
    );
    return canEdit(id, d)
      ? <button className={"row" + (first ? " first" : "")} onClick={() => { setRestOnly(false); setSheet({ d, p: id }); }}>{inner}</button>
      : <div className={"row" + (first ? " first" : "")}>{inner}</div>;
  };

  const SummaryCards = () => (
    <>
      {PEOPLE.map((p) => {
        const c = countDuties(days(month).map((d) => entry(d, p.id)));
        const cells: [string, number, string][] = [
          ["Day / General", c.day, "day"], ["Afternoon", c.afternoon, "aft"], ["Night", c.night, "night"],
          ["Night off", c.nightOff, "off"], ["Rest", c.rest, "rest"], ["Leave", c.leave, "leave"],
        ];
        const sel = sumSel?.p === p.id ? sumSel.k : null;
        const test = (v: string, k: string) => {
          const x = countDuties([v]);
          return k === "day" ? x.day > 0 : k === "aft" ? x.afternoon > 0 : k === "night" ? x.night > 0 : k === "off" ? x.nightOff > 0 : k === "rest" ? x.rest > 0 : x.leave > 0;
        };
        const listFor = (fn: (v: string) => boolean) => days(month).map((d) => [d, entry(d, p.id)] as const).filter(([, v]) => v && fn(v));
        const rows = sel ? listFor((v) => test(v, sel)) : [];
        return (
          <div key={p.id} className="card">
            <div className="row first" style={{ padding: 0 }}><Av id={p.id} /><div className="nm">{p.name}{p.id === me && <span className="tag">You</span>}<small>{c.worked} duty days · {c.marked} days marked{c.other ? ` · ${c.other} other` : ""}</small></div></div>
            <div className="sumgrid">
              {cells.map(([t, n, k]) => (
                <button type="button" key={t} className={sel === k ? "sel" : ""} onClick={() => setSumSel(sel === k ? null : { p: p.id, k })} style={{ background: `var(--${k})`, color: `var(--${k}-ink)` }}><b>{n}</b><span>{t}</span></button>
              ))}
            </div>
            {sel && (
              <div className="sumlist">
                <div className="slh"><b>{cells.find((c2) => c2[2] === sel)?.[0]} days ({rows.length})</b><button type="button" className="hide" aria-label="Hide list" onClick={() => setSumSel(null)}>✕ Hide</button></div>
                {rows.length === 0 && <span className="none">None this month</span>}
                {rows.map(([d, v]) => <div key={d} className="sl"><span className={isRed(d) ? "redt" : ""}>{long(d)}</span><Pill v={v} /></div>)}
              </div>
            )}
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
            {Array.from({ length: 12 }, (_, i) => `${day.slice(0, 4)}-${pad(i + 1)}`).flatMap((m) => [
              <span key={m} className="mchip">{MON[+m.slice(5) - 1]}</span>,
              ...days(m).map((k) => (
                <button key={k} className={"dchip" + (isRed(k) ? " red" : "") + (k === day ? " on" : "") + (k === today ? " now" : "")} onClick={() => setDay(k)}>{k === today ? "Today" : DOW[dd(k).getDay()]}<b>{+k.slice(8)}</b></button>
              )),
            ])}
          </div>
          {holidayName(day) && <div className="note redn">{long(day)} · {holidayName(day)}</div>}
          {!holidayName(day) && dd(day).getDay() === 0 && <div className="note redn">{long(day)} · Sunday</div>}
          {ticker.length > 0 && (
            <div className="ticker" role="marquee" aria-label="Pending rest and leave requests">
              <span className="tk-h">Requests</span>
              <div className="tk-w"><div className="tk-t" style={{ animationDuration: `${Math.max(15, ticker.length * 9)}s` }}>
                {[0, 1].map((n) => ticker.map((c) => (
                  <span key={n + c.id}>{nm(c.person)} asks {NAMES[c.value] ?? c.value} on {when(c)}{c.note ? ` — "${c.note}"` : ""} (waiting for Raghav)</span>
                )))}
              </div></div>
            </div>
          )}
          <div className="hero">
            <small>{day === today ? "Your duty today" : `Your duty on ${long(day)}`}</small>
            <div className="big">{myV || "No duty"}</div>
            <div className="lbl">{myV ? label(myV) : "Nothing assigned yet"}</div>
          </div>
          {data?.remarks[day] && <div className="note">Remark: {data.remarks[day]}</div>}
          {day !== tomorrow && (
            <button className="card" style={{ textAlign: "left" }} onClick={() => setDay(tomorrow)}>
              <div className="dayhead"><h2>Tomorrow · {long(tomorrow)}</h2><span>Tap to open</span></div>
              <div className="row first" style={{ padding: 0 }}>
                <div className="nm" style={{ color: "var(--muted)", fontWeight: 400 }}>Your duty{tmData?.entries[tomorrow]?.[me] ? ` · ${label(tmData.entries[tomorrow][me])}` : ""}</div>
                <Pill v={tmData?.entries[tomorrow]?.[me] ?? ""} />
              </div>
              <div className="mini">{PEOPLE.filter((p) => p.id !== me).map((p) => <div key={p.id}><Av id={p.id} sm /><Pill v={tmData?.entries[tomorrow]?.[p.id] ?? ""} /></div>)}</div>
            </button>
          )}
          <div className="card">
            <div className="dayhead">
              <button type="button" className="fold" aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}><span className="chev">{showAll ? "▲" : "▼"}</span><h2>👥 Everyone on {long(day)}</h2><span className="chev">{showAll ? "Hide" : "Show"}</span></button>
              {admin && showAll && <button className="tag" disabled={busy} onClick={() => autoFill(day)}>✨ Auto-fill</button>}
            </div>
            {showAll && PEOPLE.map((p, i) => <PersonRow key={p.id} d={day} id={p.id} first={i === 0} />)}
          </div>
          {(() => {
            const msg = data && admin ? buildMessage(day, data.entries) : "";
            if (!msg) return null;
            return (
              <div className="card">
                <h2>Message for WhatsApp</h2>
                <pre className="wamsg">{msg}</pre>
                <div className="btns">
                  <a className="btn wa" href={whatsappLink(msg)} target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.6L3 21z" /><path d="M9.2 8.6c.3 2.3 2.4 4.6 4.8 5.2l1.4-1.3-1.9-1-1 .8c-.8-.4-1.5-1.1-1.9-1.9l.8-1-1-1.9-1.2 1.1z" /></svg>
                    Share on WhatsApp
                  </a>
                  <button className="btn" onClick={async () => { try { await navigator.clipboard.writeText(msg); say("Message copied."); } catch { say("Could not copy. Select the text and copy it."); } }}>Copy</button>
                </div>
              </div>
            );
          })()}
          {!admin && group(me) === "team" && day >= today && (
            <button className="btn reqbtn" onClick={() => { setReqNote(""); setRange({ from: day, to: day, type: "LEAVE" }); }}>✋ Request Rest / Leave (one or many days)</button>
          )}
          {!admin && group(me) === "team" && day < today && <div className="note">This day is over. Only Raghav can change a completed day.</div>}
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
              <div className="dayhead"><b className={isRed(d) ? "redt" : ""}>{long(d)}{d === today && <span className="tag">Today</span>}</b><span>{holidayName(d) ?? data?.remarks[d] ?? ""}</span></div>
              {view === "mine" ? (
                <div className="row first" style={{ padding: 0 }}><div className="nm" style={{ color: "var(--muted)", fontWeight: 400 }}>{entry(d, me) ? label(entry(d, me)) : "No duty"}</div><Pill v={entry(d, me)} /></div>
              ) : (
                <div className="mini">{PEOPLE.map((p) => <div key={p.id}><Av id={p.id} sm /><Pill v={entry(d, p.id)} /></div>)}</div>
              )}
            </button>
          ))}
        </>)}

        {tab === "req" && (reqs.length === 0
          ? <div className="empty">No requests waiting. Rest and leave requests appear here for everyone.</div>
          : reqs.map((c) => (
            <div key={c.id} className="card">
              {c.date.slice(0, 7) !== month && <small className="tag">{MON[+c.date.slice(5, 7) - 1]}</small>}
              <div className="row first" style={{ padding: 0 }}><Av id={c.person} /><div className="nm">{nm(c.person)}<small>{when(c)}</small></div></div>
              {c.note && <div className="note">Note: {c.note}</div>}
              <div className="row first" style={{ padding: 0 }}>{!c.to && <><div className="nm"><small>Now</small></div><Pill v={data?.entries[c.date]?.[c.person] ?? ""} /><span>→</span></>}<Pill v={c.value} /></div>
              {admin
                ? <div className="btns">
                    <button className="btn pri" onClick={() => decide(c, "approve")}>Approve</button>
                    <button className="btn" onClick={() => decide(c, "reject")}>Reject</button>
                    <button className="btn" onClick={() => { setReqNote(c.note ?? ""); setRestOnly(false); if (c.requestedBy === me && (c.value === "REST" || c.value === "LEAVE")) setRange({ id: c.id, from: c.date, to: c.to ?? c.date, type: c.value }); else setSheet({ d: c.date, p: c.person }); }}>Edit</button>
                    <button className="btn" onClick={() => removeReq(c)}>Delete</button>
                  </div>
                : c.requestedBy === me
                  ? <div className="btns">
                      <button className="btn" onClick={() => { setReqNote(c.note ?? ""); setRestOnly(false); if (c.requestedBy === me && (c.value === "REST" || c.value === "LEAVE")) setRange({ id: c.id, from: c.date, to: c.to ?? c.date, type: c.value }); else setSheet({ d: c.date, p: c.person }); }}>Edit</button>
                      <button className="btn" onClick={() => removeReq(c)}>Delete</button>
                    </div>
                  : <div className="note">Waiting for Raghav to approve.</div>}
            </div>
          )))}

        {tab === "me" && (<>
          <div className="card">
            <div className="row first" style={{ padding: 0 }}><Av id={me} /><div className="nm">{nm(me)}<small>{admin ? "Admin" : group(me) === "lr" ? "LR candidate, view only" : "Team member"}</small></div></div>
            <button className="btn" onClick={onLogout}>Logout</button>
          </div>
          {!inst.installed && (
            <div className="card">
              <h2>Install on your phone</h2>
              {inst.evt
                ? <button className="btn pri" onClick={inst.install}>Tap here to install</button>
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
      {range && (
        <div className="scrim" onClick={(e) => e.target === e.currentTarget && setRange(null)}>
          <div className="sheet">
            <div className="grab" />
            <h2>{range.id ? "Edit request" : "Ask Raghav for Rest / Leave"}</h2>
            <div className="seg">
              {["LEAVE", "REST"].map((t) => <button type="button" key={t} className={range.type === t ? "on" : ""} onClick={() => setRange({ ...range, type: t })}>{NAMES[t]}</button>)}
            </div>
            <div className="field"><label htmlFor="rf">First day</label><input id="rf" type="date" min={today} value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value, to: range.to < e.target.value ? e.target.value : range.to })} /></div>
            <div className="field"><label htmlFor="rt">Last day</label><input id="rt" type="date" min={range.from < today ? today : range.from} value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></div>
            <div className="field"><label htmlFor="rn2">Note for Raghav (optional)</label><input id="rn2" maxLength={120} placeholder="Reason, e.g. family function" value={reqNote} onChange={(e) => setReqNote(e.target.value)} /></div>
            {range.to >= range.from && <div className="note">{days_(range.from, range.to)} day{days_(range.from, range.to) > 1 ? "s" : ""}: {long(range.from)}{range.to > range.from ? ` to ${long(range.to)}` : ""}</div>}
            <button className="btn pri" disabled={busy || !range.from || !range.to} onClick={sendRange}>{busy ? "Sending…" : range.id ? "Save changes" : "Send to Raghav"}</button>
          </div>
        </div>
      )}
      {sheet && (
        <div className="scrim" onClick={(e) => e.target === e.currentTarget && (setSheet(null), setRestOnly(false))}>
          <div className="sheet">
            <div className="grab" />
            <div className="row first" style={{ padding: 0 }}><Av id={sheet.p} /><div className="nm">{nm(sheet.p)}<small>{long(sheet.d)}</small></div></div>
            <div className="note">{admin ? "Pick a duty. It saves straight away." : "Pick the duty you want. Raghav will approve it."}</div>
            {!admin && (
              <div className="field"><label htmlFor="rn">Note for Raghav (optional)</label>
                <input id="rn" maxLength={120} placeholder="Reason, e.g. family function" value={reqNote} onChange={(e) => setReqNote(e.target.value)} /></div>
            )}
            {[...SHIFTS.map((s) => s.code), ""].filter((c) => !restOnly || c === "REST" || c === "LEAVE").map((code) => (
              <button key={code || "clear"} className="opt" disabled={busy} onClick={async () => { await save(sheet.d, sheet.p, code); setRestOnly(false); }}>
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
