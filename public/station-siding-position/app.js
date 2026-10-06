(function () {
  "use strict";

  var BOARDS = [];
  for (var i = 1; i <= 8; i++) BOARDS.push("BOARD-" + (i < 10 ? "0" : "") + i);

  var $app = document.getElementById("app");
  var $toast = document.getElementById("toast");

  /* ---------- small helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function nowLocal() {
    var d = new Date();
    return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()) + "T" + p2(d.getHours()) + ":" + p2(d.getMinutes());
  }
  // "2026-07-28T14:50" -> "14:50 28/07"
  function fmtDT(s) {
    var m = String(s || "").match(/^(\d{4})-(\d\d)-(\d\d)[T ](\d\d):(\d\d)/);
    return m ? m[4] + ":" + m[5] + " " + m[3] + "/" + m[2] : (s ? String(s) : "—");
  }
  // "2026-07-28T14:50" -> "28/07/2026 14:50"
  function fmtFull(s) {
    var m = String(s || "").match(/^(\d{4})-(\d\d)-(\d\d)[T ](\d\d):(\d\d)/);
    return m ? m[3] + "/" + m[2] + "/" + m[1] + " " + m[4] + ":" + m[5] : (s ? String(s) : "—");
  }
  // "2027-03" -> "03/27"
  function fmtDue(s) {
    var m = String(s || "").match(/^(\d{4})-(\d\d)$/);
    return m ? m[2] + "/" + m[1].slice(2) : (s ? String(s) : "—");
  }
  function toast(msg, isErr) {
    $toast.textContent = msg;
    $toast.className = "show" + (isErr ? " err" : "");
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { $toast.className = ""; }, isErr ? 4500 : 2200);
  }
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  function uid() { return Math.random().toString(36).slice(2, 10); }

  /* ---------- backend: Google Sheet (Apps Script) or local demo ---------- */
  function settings() {
    var c = window.SSP_CONFIG || {};
    return { url: LS.get("ssp_url", "") || c.APP_SCRIPT_URL || "", code: LS.get("ssp_code", "") || c.ACCESS_CODE || "" };
  }
  function isDemo() { return !settings().url; }

  function remote(method, payload) {
    var s = settings();
    var req;
    if (method === "GET") {
      var q = Object.keys(payload).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(payload[k]); }).join("&");
      req = fetch(s.url + (s.url.indexOf("?") > -1 ? "&" : "?") + q + "&code=" + encodeURIComponent(s.code));
    } else {
      payload.code = s.code;
      // text/plain keeps this a "simple" request (no CORS preflight) - Apps Script reads the raw body
      req = fetch(s.url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
    }
    return req.then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) throw new Error(j.error || "Server error");
      return j;
    });
  }

  function demoDb() {
    var db = LS.get("ssp_demo_db", null);
    if (!db) {
      db = {
        config: [
          { board: "BOARD-01", station: "KPCC", siding: "SDG-1" },
          { board: "BOARD-01", station: "KPCC", siding: "SDG-2" },
          { board: "BOARD-01", station: "KTPG", siding: "SDG-1" }
        ],
        RAKES: [], STABLED: [], SPARE: []
      };
      LS.set("ssp_demo_db", db);
    }
    return db;
  }

  var Api = {
    load: function (board) {
      if (isDemo()) {
        var db = demoDb();
        var f = function (r) { return r.board === board; };
        return Promise.resolve({ config: db.config.filter(f), RAKES: db.RAKES.filter(f), STABLED: db.STABLED.filter(f), SPARE: db.SPARE.filter(f) });
      }
      return remote("GET", { action: "bootstrap", board: board });
    },
    upsert: function (table, row) {
      if (isDemo()) {
        var db = demoDb();
        var list = db[table];
        var now = nowLocal();
        var i = -1;
        for (var k = 0; k < list.length; k++) if (list[k].id === row.id) i = k;
        if (i < 0) { row.id = row.id || uid(); row.created = row.created || now; row.updated = now; list.push(row); }
        else { row.updated = now; list[i] = Object.assign({}, list[i], row); row = list[i]; }
        LS.set("ssp_demo_db", db);
        return Promise.resolve(row);
      }
      return remote("POST", { action: "upsert", table: table, row: row }).then(function (j) { return j.row; });
    },
    remove: function (table, id) {
      if (isDemo()) {
        var db = demoDb();
        db[table] = db[table].filter(function (r) { return r.id !== id; });
        LS.set("ssp_demo_db", db);
        return Promise.resolve();
      }
      return remote("POST", { action: "delete", table: table, id: id });
    },
    addConfig: function (row) {
      if (isDemo()) {
        var db = demoDb();
        db.config.push(row);
        LS.set("ssp_demo_db", db);
        return Promise.resolve();
      }
      return remote("POST", { action: "addConfig", row: row });
    }
  };

  /* ---------- state ---------- */
  var S = { board: null, tab: "siding", data: null, station: "", siding: "", editing: null, busy: false, kind: "TRAIN" };

  function boardSidings(station) {
    var seen = {}, out = [];
    S.data.config.forEach(function (c) {
      if (c.station === station && c.siding && !seen[c.siding]) { seen[c.siding] = 1; out.push(c.siding); }
    });
    return out;
  }
  function boardStations() {
    var seen = {}, out = [];
    S.data.config.forEach(function (c) { if (c.station && !seen[c.station]) { seen[c.station] = 1; out.push(c.station); } });
    return out;
  }
  function byCreated(a, b) { return String(a.created).localeCompare(String(b.created)); }

  /* ---------- views ---------- */
  function header(title, back) {
    return '<header class="top">' +
      (back ? '<button data-act="back" aria-label="Back">←</button>' : "") +
      "<h1>" + esc(title) + "</h1>" +
      (S.board ? '<button data-act="refresh" aria-label="Refresh">⟳</button>' : "") +
      '<button data-act="settings" aria-label="Settings">⚙</button></header>' +
      (isDemo() ? '<div class="banner">DEMO MODE – data stays on this phone only. Tap ⚙ to connect your Google Sheet.</div>' : "");
  }

  function viewHome() {
    var h = header("STATION SIDING POSITION", false) + '<div class="grid">';
    BOARDS.forEach(function (b) { h += '<button class="board" data-act="board" data-b="' + b + '">' + b + "<small>Siding · Stabled</small></button>"; });
    return h + "</div>";
  }

  function field(label, html) { return "<label>" + label + "</label>" + html; }
  function dtField(id, label, val) {
    return '<label for="' + id + '">' + label + '</label><div class="row"><input type="datetime-local" id="' + id + '" value="' + esc(val || "") + '">' +
      '<button type="button" class="now fit" data-now="' + id + '">now</button></div>';
  }

  function viewBoard() {
    var h = header(S.board, true) +
      '<div class="tabs"><button data-act="tab" data-t="siding" class="' + (S.tab === "siding" ? "on" : "") + '">Siding Position</button>' +
      '<button data-act="tab" data-t="stabled" class="' + (S.tab === "stabled" ? "on" : "") + '">Stabled Loco/Train</button></div>';
    if (!S.data) return h + '<p class="loading">Loading…</p>';
    return h + (S.tab === "siding" ? viewSiding() : viewStabled());
  }

  /* --- siding position --- */
  function stationPicker() {
    var stations = boardStations();
    return '<label for="st">Station name</label><div class="row"><select id="st">' +
      '<option value="">— select station —</option>' +
      stations.map(function (s) { return '<option value="' + esc(s) + '"' + (s === S.station ? " selected" : "") + ">" + esc(s) + "</option>"; }).join("") +
      '</select><button class="btn sec fit" data-act="addStation">＋ Station</button></div>' +
      (!stations.length ? '<p class="empty">No stations yet for ' + esc(S.board) + ". Tap ＋ Station to add one.</p>" : "");
  }

  function viewSiding() {
    var h = '<section class="card"><h2>Select station &amp; siding</h2>' + stationPicker();
    if (S.station) {
      h += "<label>Siding (tap name)</label><div class=\"chips\">" +
        boardSidings(S.station).map(function (g) { return '<button class="chip' + (g === S.siding ? " on" : "") + '" data-act="siding" data-s="' + esc(g) + '">' + esc(g) + "</button>"; }).join("") +
        '<button class="chip add" data-act="addSiding">＋ Siding</button></div>';
    }
    h += "</section>";
    if (S.station && S.siding) h += viewRakes() + viewSpare();
    return h;
  }

  function viewRakes() {
    var rakes = S.data.RAKES.filter(function (r) { return r.station === S.station && r.siding === S.siding; }).sort(byCreated);
    var ed = S.editing ? rakes.filter(function (r) { return r.id === S.editing; })[0] : null;
    var r = ed || {};
    var h = '<section class="card"><h2>' + esc(S.station) + " · " + esc(S.siding) + " — rakes (" + rakes.length + ")</h2>";
    if (!rakes.length) h += '<p class="empty">No rake saved here yet.</p>';
    rakes.forEach(function (x, n) {
      h += '<div class="rake' + (x.id === S.editing ? " sel" : "") + '"><div class="t"><span>' + (n + 1) + ". " + esc(x.load || "—") +
        (x.inward ? '<span class="badge">EX ' + esc(x.inward) + "</span>" : "") + "</span><span>" + esc(fmtFull(x.created)) + "</span></div><dl>" +
        "<dt>Stock</dt><dd>" + esc(x.stock || "—") + "</dd>" +
        "<dt>Placement</dt><dd>" + esc(fmtDT(x.placement)) + "</dd>" +
        "<dt>Release</dt><dd>" + esc(fmtDT(x.release)) + "</dd>" +
        "<dt>Loco</dt><dd>" + esc(x.loco || "—") + (x.loco ? " · Base " + esc(x.base || "—") + " · Due " + esc(fmtDue(x.due)) : "") + "</dd>" +
        "<dt>EOT</dt><dd>" + esc(fmtDT(x.eot)) + "</dd>" +
        "<dt>SDG dep</dt><dd>" + esc(fmtDT(x.sdg_dep)) + "</dd></dl>" +
        '<div class="btns"><button class="btn sec small" data-act="editRake" data-id="' + esc(x.id) + '">Edit</button>' +
        '<button class="btn danger small" data-act="delRake" data-id="' + esc(x.id) + '">Delete</button></div></div>';
    });
    h += "</section>";

    h += '<section class="card"><h2>' + (ed ? "Edit rake" : "New rake") + "</h2>" +
      "<label>Date (automatic)</label><div class=\"autodate\">" + esc(fmtFull(ed ? ed.created : nowLocal())) + "</div>" +
      '<label for="f_load">1. Load name (e.g. KPCC)</label><input id="f_load" autocapitalize="characters" value="' + esc(r.load) + '">' +
      '<div class="inline"><input type="checkbox" id="f_inw"' + (r.inward ? " checked" : "") + '><label for="f_inw">Inward load (EX)</label></div>' +
      '<div id="exwrap"' + (r.inward ? "" : " hidden") + '><label for="f_ex">EX station</label><input id="f_ex" autocapitalize="characters" value="' + esc(r.inward) + '"></div>' +
      '<label for="f_stock">2. Stock and type (e.g. BCNHL 58+1)</label><input id="f_stock" autocapitalize="characters" value="' + esc(r.stock) + '">' +
      dtField("f_placement", "3. Placement time", r.placement) +
      dtField("f_release", "4. Release time", r.release) +
      '<label for="f_loco">5. Loco no (if any) (e.g. 28242+28243)</label><input id="f_loco" inputmode="text" value="' + esc(r.loco) + '">' +
      '<div class="row"><div><label for="f_base">Base (e.g. KZJ)</label><input id="f_base" autocapitalize="characters" value="' + esc(r.base) + '"></div>' +
      '<div><label for="f_due">Due (MM/YY)</label><input id="f_due" type="month" value="' + esc(r.due) + '"></div></div>' +
      dtField("f_eot", "6. EOT time", r.eot) +
      dtField("f_sdg", "7. SDG dep", r.sdg_dep) +
      '<div class="actions"><button class="btn" data-act="rakeAdd">ADD</button><button class="btn sec" data-act="rakeSave">SAVE</button><button class="btn sec" data-act="rakeClear">CLEAR</button></div>' +
      '<p class="empty">ADD saves this rake and opens a new blank one. SAVE keeps this one open. CLEAR empties the boxes.</p></section>';
    return h;
  }

  function viewSpare() {
    var list = S.data.SPARE.filter(function (x) { return x.station === S.station; }).sort(byCreated);
    var h = '<section class="card"><h2>Spare locos (siding/station) — ' + esc(S.station) + "</h2>" +
      '<div class="spare h"><span>#</span><span>LOCO NO</span><span>BASE</span><span>DUE</span><span></span></div>';
    if (!list.length) h += '<p class="empty">No spare loco listed.</p>';
    list.forEach(function (x, n) {
      h += '<div class="spare"><span>' + (n + 1) + ".</span><span>" + esc(x.loco) + (x.siding ? '<br><small style="color:var(--muted)">' + esc(x.siding) + "</small>" : "") +
        "</span><span>" + esc(x.base || "—") + "</span><span>" + esc(fmtDue(x.due)) + '</span><button data-act="delSpare" data-id="' + esc(x.id) + '" aria-label="Delete">✕</button></div>';
    });
    h += '<label for="sp_loco">Loco no</label><input id="sp_loco" inputmode="text">' +
      '<div class="row"><div><label for="sp_base">Base</label><input id="sp_base" autocapitalize="characters"></div>' +
      '<div><label for="sp_due">Due (MM/YY)</label><input id="sp_due" type="month"></div></div>' +
      '<div class="actions"><button class="btn" data-act="spareAdd">ADD</button></div></section>';
    return h;
  }

  /* --- stabled loco/train position --- */
  function viewStabled() {
    var h = '<section class="card"><h2>Stabled loco / train position</h2>' + stationPicker();
    if (!S.station) return h + "</section>";
    var all = S.data.STABLED.filter(function (x) { return x.station === S.station; });
    var nTrain = all.filter(function (x) { return x.kind === "TRAIN"; }).length;
    var nLoco = all.length - nTrain;
    h += '<label>Stabled</label><div class="tabs" style="margin:0">' +
      '<button data-act="kind" data-k="TRAIN" class="' + (S.kind === "TRAIN" ? "on" : "") + '">TRAIN (' + nTrain + ")</button>" +
      '<button data-act="kind" data-k="LOCO" class="' + (S.kind === "LOCO" ? "on" : "") + '">LOCO (' + nLoco + ")</button></div></section>";

    var list = all.filter(function (x) { return x.kind === S.kind; }).sort(byCreated);
    var ed = S.editing ? list.filter(function (x) { return x.id === S.editing; })[0] : null;
    var r = ed || {};
    var isTrain = S.kind === "TRAIN";

    h += '<section class="card"><h2>' + esc(S.station) + " — stabled " + (isTrain ? "trains" : "locos") + " (" + list.length + ")</h2>";
    if (!list.length) h += '<p class="empty">Nothing stabled here.</p>';
    list.forEach(function (x, n) {
      h += '<div class="rake' + (x.id === S.editing ? " sel" : "") + '"><div class="t"><span>' + (n + 1) + ". " + esc(x.number || "—") + "</span><span>" + esc(fmtFull(x.created)) + "</span></div><dl>" +
        "<dt>Stabled line</dt><dd>" + esc(x.line || "—") + "</dd>" +
        (isTrain ? "<dt>Stabled from</dt><dd>" + esc(fmtDT(x.since)) + "</dd>"
                 : "<dt>Base</dt><dd>" + esc(x.base || "—") + "</dd><dt>Due</dt><dd>" + esc(fmtDue(x.due)) + "</dd>") +
        '</dl><div class="btns"><button class="btn sec small" data-act="editStabled" data-id="' + esc(x.id) + '">Edit</button>' +
        '<button class="btn danger small" data-act="delStabled" data-id="' + esc(x.id) + '">Delete</button></div></div>';
    });
    h += "</section>";

    h += '<section class="card"><h2>' + (ed ? "Edit " : "New ") + (isTrain ? "train" : "loco") + "</h2>";
    if (isTrain) {
      h += '<label for="g_number">Train no (e.g. KPCC)</label><input id="g_number" autocapitalize="characters" value="' + esc(r.number) + '">' +
        '<label for="g_line">Stabled line (e.g. R-04)</label><input id="g_line" autocapitalize="characters" value="' + esc(r.line) + '">' +
        dtField("g_since", "Stabled from (e.g. 06-10 05:30)", r.since);
    } else {
      h += '<label for="g_number">Loco no</label><input id="g_number" inputmode="text" value="' + esc(r.number) + '">' +
        '<div class="row"><div><label for="g_base">Base</label><input id="g_base" autocapitalize="characters" value="' + esc(r.base) + '"></div>' +
        '<div><label for="g_due">Due (MM/YY)</label><input id="g_due" type="month" value="' + esc(r.due) + '"></div></div>' +
        '<label for="g_line">Stabled line</label><input id="g_line" autocapitalize="characters" value="' + esc(r.line) + '">';
    }
    h += '<div class="actions"><button class="btn" data-act="stAdd">ADD</button><button class="btn sec" data-act="stSave">SAVE</button><button class="btn sec" data-act="stClear">CLEAR</button></div></section>';
    return h;
  }

  function viewSettings() {
    var s = settings();
    return header("Settings", true) +
      '<section class="card"><h2>Google Sheet connection</h2>' +
      '<label for="set_url">Apps Script Web App URL</label><input id="set_url" inputmode="url" placeholder="https://script.google.com/macros/s/.../exec" value="' + esc(LS.get("ssp_url", "") || s.url) + '">' +
      '<label for="set_code">Access code (if you set one)</label><input id="set_code" type="password" value="' + esc(LS.get("ssp_code", "") || s.code) + '">' +
      '<div class="actions"><button class="btn" data-act="saveSettings">Save</button><button class="btn sec" data-act="useDemo">Use demo</button></div>' +
      '<p class="empty">Leave the URL empty to use demo mode (data stored only on this phone).</p></section>';
  }

  /* ---------- render ---------- */
  var route = "home";
  function render() {
    $app.innerHTML = route === "home" ? viewHome() : route === "settings" ? viewSettings() : viewBoard();
  }
  function keepScroll(fn) { var y = window.scrollY; fn(); window.scrollTo(0, y); }

  function loadBoard(board) {
    S.board = board; S.data = null; route = "board"; S.station = ""; S.siding = ""; S.editing = null;
    render();
    return Api.load(board).then(function (d) {
      S.data = { config: d.config || [], RAKES: d.RAKES || [], STABLED: d.STABLED || [], SPARE: d.SPARE || [] };
      render();
    }).catch(function (e) { toast("Could not load: " + e.message, true); render(); });
  }
  function reload() {
    return Api.load(S.board).then(function (d) {
      S.data = { config: d.config || [], RAKES: d.RAKES || [], STABLED: d.STABLED || [], SPARE: d.SPARE || [] };
    });
  }

  /* ---------- form readers ---------- */
  function v(id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; }
  function upper(s) { return s.toUpperCase(); }

  function readRake() {
    var inward = document.getElementById("f_inw").checked ? upper(v("f_ex")) || "—" : "";
    return {
      board: S.board, station: S.station, siding: S.siding,
      load: upper(v("f_load")), inward: inward, stock: upper(v("f_stock")),
      placement: v("f_placement"), release: v("f_release"),
      loco: v("f_loco"), base: upper(v("f_base")), due: v("f_due"),
      eot: v("f_eot"), sdg_dep: v("f_sdg")
    };
  }
  function readStabled() {
    var train = S.kind === "TRAIN";
    return {
      board: S.board, station: S.station, kind: S.kind, number: train ? upper(v("g_number")) : v("g_number"), line: upper(v("g_line")),
      since: train ? v("g_since") : "", base: train ? "" : upper(v("g_base")), due: train ? "" : v("g_due")
    };
  }
  function nonEmpty(row, keys) { return keys.some(function (k) { return row[k]; }); }

  /* ---------- actions ---------- */
  function guard(fn) {
    if (S.busy) return;
    S.busy = true;
    Promise.resolve().then(fn).catch(function (e) { toast("Not saved: " + (e && e.message ? e.message : e), true); })
      .then(function () { S.busy = false; });
  }

  function saveRake(keepOpen) {
    var row = readRake();
    if (!nonEmpty(row, ["load", "stock", "placement", "release", "loco", "eot", "sdg_dep"])) { toast("Enter rake details first", true); return Promise.resolve(); }
    if (S.editing) row.id = S.editing;
    return Api.upsert("RAKES", row).then(function (saved) {
      S.editing = keepOpen ? saved.id : null;
      return reload();
    }).then(function () { render(); toast(keepOpen ? "Saved" : "Saved – new rake ready"); if (!keepOpen) { var e = document.getElementById("f_load"); if (e) e.focus(); } });
  }
  function saveStabled(keepOpen) {
    var row = readStabled();
    if (!S.station) { toast("Select station first", true); return Promise.resolve(); }
    if (!row.number) { toast(S.kind === "TRAIN" ? "Enter train no" : "Enter loco no", true); return Promise.resolve(); }
    if (S.editing) row.id = S.editing;
    return Api.upsert("STABLED", row).then(function (saved) {
      S.editing = keepOpen ? saved.id : null;
      return reload();
    }).then(function () { render(); toast(keepOpen ? "Saved" : "Saved – new " + (S.kind === "TRAIN" ? "train" : "loco") + " ready"); });
  }

  document.addEventListener("click", function (ev) {
    var now = ev.target.closest("[data-now]");
    if (now) { document.getElementById(now.getAttribute("data-now")).value = nowLocal(); return; }
    var el = ev.target.closest("[data-act]");
    if (!el) return;
    var act = el.getAttribute("data-act");
    var id = el.getAttribute("data-id");

    switch (act) {
      case "board": loadBoard(el.getAttribute("data-b")); break;
      case "back":
        if (route === "settings") { route = S.board ? "board" : "home"; render(); }
        else { route = "home"; S.board = null; render(); }
        break;
      case "refresh": guard(function () { return reload().then(function () { keepScroll(render); toast("Refreshed"); }); }); break;
      case "settings": route = "settings"; render(); break;
      case "saveSettings":
        LS.set("ssp_url", v("set_url")); LS.set("ssp_code", v("set_code"));
        toast(v("set_url") ? "Saved – connected to Google Sheet" : "Saved – demo mode");
        route = S.board ? "board" : "home"; if (S.board) loadBoard(S.board); else render();
        break;
      case "useDemo": LS.del("ssp_url"); LS.del("ssp_code"); toast("Demo mode"); route = "home"; S.board = null; render(); break;
      case "tab": S.tab = el.getAttribute("data-t"); S.editing = null; render(); break;
      case "kind": S.kind = el.getAttribute("data-k"); S.editing = null; render(); break;

      case "addStation":
        var st = (prompt("Station name (e.g. KPCC)") || "").trim().toUpperCase();
        if (!st) break;
        var sg = (prompt("First siding name for " + st + " (e.g. SDG-1)") || "").trim().toUpperCase();
        guard(function () {
          return Api.addConfig({ board: S.board, station: st, siding: sg }).then(reload).then(function () { S.station = st; S.siding = sg; S.editing = null; render(); });
        });
        break;
      case "addSiding":
        var sd = (prompt("New siding name for " + S.station + " (e.g. SDG-3)") || "").trim().toUpperCase();
        if (!sd) break;
        guard(function () {
          return Api.addConfig({ board: S.board, station: S.station, siding: sd }).then(reload).then(function () { S.siding = sd; S.editing = null; render(); });
        });
        break;
      case "siding": S.siding = el.getAttribute("data-s"); S.editing = null; render(); break;

      case "rakeAdd": guard(function () { return saveRake(false); }); break;
      case "rakeSave": guard(function () { return saveRake(true); }); break;
      case "rakeClear": S.editing = null; render(); break;
      case "editRake": S.editing = id; render(); document.getElementById("f_load").scrollIntoView(); break;
      case "delRake":
        if (confirm("Delete this rake?")) guard(function () { return Api.remove("RAKES", id).then(reload).then(function () { if (S.editing === id) S.editing = null; keepScroll(render); toast("Deleted"); }); });
        break;

      case "spareAdd":
        guard(function () {
          var row = { board: S.board, station: S.station, siding: S.siding, loco: v("sp_loco"), base: upper(v("sp_base")), due: v("sp_due") };
          if (!row.loco) { toast("Enter loco no", true); return; }
          return Api.upsert("SPARE", row).then(reload).then(function () { keepScroll(render); toast("Spare loco added"); });
        });
        break;
      case "delSpare":
        if (confirm("Remove this spare loco?")) guard(function () { return Api.remove("SPARE", id).then(reload).then(function () { keepScroll(render); }); });
        break;

      case "stAdd": guard(function () { return saveStabled(false); }); break;
      case "stSave": guard(function () { return saveStabled(true); }); break;
      case "stClear": S.editing = null; render(); break;
      case "editStabled": S.editing = id; render(); document.getElementById("g_number").scrollIntoView(); break;
      case "delStabled":
        if (confirm("Delete this entry?")) guard(function () { return Api.remove("STABLED", id).then(reload).then(function () { if (S.editing === id) S.editing = null; keepScroll(render); toast("Deleted"); }); });
        break;
    }
  });

  document.addEventListener("change", function (ev) {
    if (ev.target.id === "st") { S.station = ev.target.value; S.siding = ""; S.editing = null; render(); }
    if (ev.target.id === "f_inw") { document.getElementById("exwrap").hidden = !ev.target.checked; }
  });

  window.addEventListener("online", function () { toast("Back online"); });
  window.addEventListener("offline", function () { toast("You are offline – changes cannot be saved", true); });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () { /* optional */ }); });
  }

  render();
})();
