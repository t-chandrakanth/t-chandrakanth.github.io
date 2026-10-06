/**
 * Station Siding Position - Google Sheet backend (Apps Script).
 * Bind this script to your Google Sheet (Extensions > Apps Script), run `setup` once,
 * then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 *
 * Tabs used
 *   BOARD-01 ... BOARD-08   one tab per board: only the siding positions (rakes) of that board
 *   STABLED                 one tab for the stabled loco / train position of all boards
 *   CONFIG                  (auto-created helper) stations and sidings of each board
 *   SPARE LOCOS             (auto-created helper) spare locos
 */

// Optional shared access code. If you set one, enter the same code in the app (gear icon).
var ACCESS_CODE = '';

// App board id -> tab name in your sheet. Edit the right-hand side if your tabs are named differently.
var BOARD_TABS = {
  'BOARD-01': 'BOARD-01', 'BOARD-02': 'BOARD-02', 'BOARD-03': 'BOARD-03', 'BOARD-04': 'BOARD-04',
  'BOARD-05': 'BOARD-05', 'BOARD-06': 'BOARD-06', 'BOARD-07': 'BOARD-07', 'BOARD-08': 'BOARD-08'
};
var TAB = { STABLED: 'STABLED', CONFIG: 'CONFIG', SPARE: 'SPARE LOCOS' };

// Column keys of every table, in the order they are created. (RAKES lives in the board tabs.)
var COLS = {
  RAKES:   ['id', 'station', 'siding', 'created', 'load', 'inward', 'stock', 'placement', 'release', 'loco', 'base', 'due', 'eot', 'sdg_dep', 'updated'],
  STABLED: ['id', 'board', 'station', 'kind', 'number', 'line', 'since', 'base', 'due', 'created', 'updated'],
  SPARE:   ['id', 'board', 'station', 'siding', 'loco', 'base', 'due', 'created', 'updated'],
  CONFIG:  ['board', 'station', 'siding']
};
// Heading shown in row 1 of the sheet for each key
var LABEL = {
  id: 'ID', board: 'BOARD', station: 'STATION', siding: 'SIDING', created: 'DATE', load: 'LOAD NAME', inward: 'INWARD (EX)',
  stock: 'STOCK & TYPE', placement: 'PLACEMENT TIME', release: 'RELEASE TIME', loco: 'LOCO NO', base: 'BASE', due: 'DUE (MM/YY)',
  eot: 'EOT TIME', sdg_dep: 'SDG DEP', updated: 'UPDATED', kind: 'TRAIN / LOCO', number: 'TRAIN NO / LOCO NO',
  line: 'STABLED LINE', since: 'STABLED FROM'
};
var DT_KEYS = { created: 1, updated: 1, placement: 1, release: 1, eot: 1, sdg_dep: 1, since: 1 };   // shown as dd/MM/yyyy HH:mm
var MONTH_KEYS = { due: 1 };                                                                    // shown as MM/YY

function setup() {
  Object.keys(BOARD_TABS).forEach(function (b) { sheet_('RAKES', b); });
  sheet_('STABLED'); sheet_('CONFIG'); sheet_('SPARE');
}

function doGet(e) { return handle_(e && e.parameter ? e.parameter : {}); }

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'Bad request' }); }
  return handle_(body);
}

function handle_(p) {
  try {
    if (ACCESS_CODE && String(p.code || '') !== ACCESS_CODE) return json_({ ok: false, error: 'Wrong access code' });
    switch (p.action) {
      case 'bootstrap':
        return json_(bootstrap_(String(p.board || '')));
      case 'upsert':
        return json_({ ok: true, row: locked_(function () { return upsert_(p.table, p.row || {}); }) });
      case 'delete':
        locked_(function () { remove_(p.table, String(p.id || ''), String(p.board || '')); });
        return json_({ ok: true });
      case 'addConfig':
        locked_(function () { addConfig_(p.row || {}); });
        return json_({ ok: true });
      default:
        return json_({ ok: false, error: 'Unknown action' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function locked_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}

/* ---------- value conversion (app <-> sheet) ---------- */
function p2_(n) { return (n < 10 ? '0' : '') + n; }

function toSheet_(key, v) {
  v = v === null || v === undefined ? '' : String(v);
  var m;
  if (DT_KEYS[key] && (m = v.match(/^(\d{4})-(\d\d)-(\d\d)[T ](\d\d):(\d\d)/))) return m[3] + '/' + m[2] + '/' + m[1] + ' ' + m[4] + ':' + m[5];
  if (MONTH_KEYS[key] && (m = v.match(/^(\d{4})-(\d\d)$/))) return m[2] + '/' + m[1].slice(2);
  return v;
}

function fromSheet_(key, v) {
  if (v === null || v === undefined) return '';
  var tz = Session.getScriptTimeZone();
  if (v instanceof Date) {
    return MONTH_KEYS[key] ? Utilities.formatDate(v, tz, 'yyyy-MM') : Utilities.formatDate(v, tz, "yyyy-MM-dd'T'HH:mm");
  }
  v = String(v).trim();
  var m;
  if (DT_KEYS[key] && (m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/))) return m[3] + '-' + p2_(+m[2]) + '-' + p2_(+m[1]) + 'T' + p2_(+m[4]) + ':' + m[5];
  if (MONTH_KEYS[key] && (m = v.match(/^(\d{1,2})\/(\d{2})$/))) return '20' + m[2] + '-' + p2_(+m[1]);
  return v;
}

function nowIso_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm");
}

/* ---------- sheets ---------- */
function tabName_(table, board) {
  if (table === 'RAKES') {
    if (!BOARD_TABS[board]) throw new Error('Unknown board: ' + board);
    return BOARD_TABS[board];
  }
  if (!TAB[table]) throw new Error('Unknown table: ' + table);
  return TAB[table];
}

// Returns {sh, keys}: keys[i] is the column key of sheet column i+1 (null for columns that are not ours).
// Creates the tab / headings when missing and appends any heading that is not there yet.
function sheet_(table, board) {
  var name = tabName_(table, board);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);

  var rev = {};
  Object.keys(LABEL).forEach(function (k) { rev[LABEL[k].toUpperCase()] = k; });
  var want = COLS[table];
  var width = Math.max(sh.getLastColumn(), 1);
  var head = sh.getRange(1, 1, 1, width).getValues()[0];
  var keys = head.map(function (h) {
    var k = rev[String(h).trim().toUpperCase()];
    return k && want.indexOf(k) > -1 ? k : null;
  });
  var empty = head.every(function (h) { return String(h).trim() === ''; });
  if (empty) keys = [];                       // no headings yet: build them from scratch
  var used = keys.filter(function (k) { return k; });
  want.forEach(function (k) {
    if (used.indexOf(k) > -1) return;
    keys.push(k); used.push(k);
    var col = keys.length;
    sh.getRange(1, col).setValue(LABEL[k]).setFontWeight('bold');
    // plain text, so "03/27" or "14:50" are never converted to dates by Sheets
    sh.getRange(2, col, Math.max(sh.getMaxRows() - 1, 1), 1).setNumberFormat('@');
  });
  if (sh.getFrozenRows() < 1) sh.setFrozenRows(1);
  return { sh: sh, keys: keys };
}

function read_(table, board) {
  var s = sheet_(table, board);
  var last = s.sh.getLastRow();
  if (last < 2) return [];
  var vals = s.sh.getRange(2, 1, last - 1, s.keys.length).getValues();
  var out = [];
  vals.forEach(function (r) {
    var o = {}, any = false;
    s.keys.forEach(function (k, i) {
      if (!k) return;
      o[k] = fromSheet_(k, r[i]);
      if (o[k] !== '') any = true;
    });
    if (!any) return;
    if (table === 'RAKES') o.board = board;
    out.push(o);
  });
  return out;
}

function bootstrap_(board) {
  if (!BOARD_TABS[board]) throw new Error('Unknown board: ' + board);
  var f = function (r) { return r.board === board; };
  return {
    ok: true,
    config: read_('CONFIG').filter(f),
    RAKES: read_('RAKES', board),
    STABLED: read_('STABLED').filter(f),
    SPARE: read_('SPARE').filter(f)
  };
}

function upsert_(table, row) {
  if (table === 'CONFIG') throw new Error('Use addConfig');
  var board = String(row.board || '');
  if (table === 'RAKES' && !BOARD_TABS[board]) throw new Error('Unknown board: ' + board);
  var s = sheet_(table, board);
  var idCol = s.keys.indexOf('id') + 1;
  var rowNum = 0;
  if (row.id) {
    var last = s.sh.getLastRow();
    if (last >= 2) {
      var ids = s.sh.getRange(2, idCol, last - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(row.id)) { rowNum = i + 2; break; }
    }
  }
  var cur = rowNum ? s.sh.getRange(rowNum, 1, 1, s.keys.length).getValues()[0] : [];
  var out = {};
  s.keys.forEach(function (k, i) {
    if (!k) return;
    out[k] = row.hasOwnProperty(k) ? String(row[k] == null ? '' : row[k]) : (rowNum ? fromSheet_(k, cur[i]) : '');
  });
  if (!out.id) out.id = Utilities.getUuid().slice(0, 8);
  if (!out.created) out.created = nowIso_();
  out.updated = nowIso_();
  if (table === 'RAKES') out.board = board;
  var arr = s.keys.map(function (k, i) {
    return k ? toSheet_(k, out[k]) : (rowNum ? cur[i] : '');     // columns that are not ours stay untouched
  });
  if (rowNum) s.sh.getRange(rowNum, 1, 1, s.keys.length).setValues([arr]);
  else s.sh.getRange(s.sh.getLastRow() + 1, 1, 1, s.keys.length).setValues([arr]);
  return out;
}

function remove_(table, id, board) {
  if (table === 'CONFIG') throw new Error('Edit CONFIG rows in the sheet');
  if (!id) return;
  var s = sheet_(table, board);
  var idCol = s.keys.indexOf('id') + 1;
  var last = s.sh.getLastRow();
  if (last < 2) return;
  var ids = s.sh.getRange(2, idCol, last - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) if (String(ids[i][0]) === id) { s.sh.deleteRow(i + 2); return; }
}

function addConfig_(row) {
  var board = String(row.board || ''), station = String(row.station || '').toUpperCase(), siding = String(row.siding || '').toUpperCase();
  if (!BOARD_TABS[board] || !station) throw new Error('Board and station required');
  var existing = read_('CONFIG');
  for (var i = 0; i < existing.length; i++) {
    var c = existing[i];
    if (c.board === board && c.station === station && c.siding === siding) return;
  }
  var s = sheet_('CONFIG');
  var arr = s.keys.map(function (k) { return k === 'board' ? board : k === 'station' ? station : k === 'siding' ? siding : ''; });
  s.sh.getRange(s.sh.getLastRow() + 1, 1, 1, s.keys.length).setValues([arr]);
}
