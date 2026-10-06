/**
 * Station Siding Position - Google Sheet backend (Apps Script).
 * Bind this script to the Google Sheet that should hold the data (Extensions > Apps Script),
 * run `setup` once, then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 */

// Optional shared access code. If you set one, the same code must be entered in the app (gear icon).
var ACCESS_CODE = '';

var HEADERS = {
  CONFIG:  ['board', 'station', 'siding'],
  RAKES:   ['id', 'board', 'station', 'siding', 'created', 'load', 'inward', 'stock', 'placement', 'release', 'loco', 'base', 'due', 'eot', 'sdg_dep', 'updated'],
  STABLED: ['id', 'board', 'kind', 'number', 'stock', 'location', 'since', 'base', 'due', 'remarks', 'created', 'updated'],
  SPARE:   ['id', 'board', 'station', 'siding', 'loco', 'base', 'due', 'created', 'updated']
};

function setup() {
  Object.keys(HEADERS).forEach(function (name) { sheet_(name); });
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
        locked_(function () { remove_(p.table, String(p.id || '')); });
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

/* ---------- sheets ---------- */
function sheet_(name) {
  if (!HEADERS[name]) throw new Error('Unknown table: ' + name);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]).setFontWeight('bold');
    // plain text everywhere, so "03/27" or "2026-10-06T14:50" are never turned into dates
    sh.getRange(1, 1, sh.getMaxRows(), HEADERS[name].length).setNumberFormat('@');
    sh.setFrozenRows(1);
  }
  return sh;
}

function cell_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm");
  return v === null || v === undefined ? '' : String(v);
}

function read_(name) {
  var sh = sheet_(name);
  var last = sh.getLastRow();
  var cols = HEADERS[name];
  if (last < 2) return [];
  var vals = sh.getRange(2, 1, last - 1, cols.length).getValues();
  return vals.map(function (r) {
    var o = {};
    cols.forEach(function (c, i) { o[c] = cell_(r[i]); });
    return o;
  }).filter(function (o) { return cols.some(function (c) { return o[c] !== ''; }); });
}

function bootstrap_(board) {
  var f = function (r) { return r.board === board; };
  return {
    ok: true,
    config: read_('CONFIG').filter(f),
    RAKES: read_('RAKES').filter(f),
    STABLED: read_('STABLED').filter(f),
    SPARE: read_('SPARE').filter(f)
  };
}

function nowIso_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm");
}

function upsert_(table, row) {
  if (table === 'CONFIG') throw new Error('Use addConfig');
  var sh = sheet_(table);
  var cols = HEADERS[table];
  var idCol = cols.indexOf('id') + 1;
  var rowNum = 0;
  if (row.id) {
    var last = sh.getLastRow();
    if (last >= 2) {
      var ids = sh.getRange(2, idCol, last - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(row.id)) { rowNum = i + 2; break; }
    }
  }
  var existing = {};
  if (rowNum) {
    var cur = sh.getRange(rowNum, 1, 1, cols.length).getValues()[0];
    cols.forEach(function (c, i) { existing[c] = cell_(cur[i]); });
  }
  var out = {};
  cols.forEach(function (c) {
    out[c] = row.hasOwnProperty(c) ? String(row[c] == null ? '' : row[c]) : (existing[c] || '');
  });
  if (!out.id) out.id = Utilities.getUuid().slice(0, 8);
  if (!out.created) out.created = nowIso_();
  out.updated = nowIso_();
  var arr = [cols.map(function (c) { return out[c]; })];
  if (rowNum) sh.getRange(rowNum, 1, 1, cols.length).setValues(arr);
  else sh.getRange(sh.getLastRow() + 1, 1, 1, cols.length).setValues(arr);
  return out;
}

function remove_(table, id) {
  if (table === 'CONFIG') throw new Error('Edit CONFIG rows in the sheet');
  if (!id) return;
  var sh = sheet_(table);
  var idCol = HEADERS[table].indexOf('id') + 1;
  var last = sh.getLastRow();
  if (last < 2) return;
  var ids = sh.getRange(2, idCol, last - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) if (String(ids[i][0]) === id) { sh.deleteRow(i + 2); return; }
}

function addConfig_(row) {
  var board = String(row.board || ''), station = String(row.station || '').toUpperCase(), siding = String(row.siding || '').toUpperCase();
  if (!board || !station) throw new Error('Board and station required');
  var existing = read_('CONFIG');
  for (var i = 0; i < existing.length; i++) {
    var c = existing[i];
    if (c.board === board && c.station === station && c.siding === siding) return;
  }
  var sh = sheet_('CONFIG');
  sh.getRange(sh.getLastRow() + 1, 1, 1, 3).setValues([[board, station, siding]]);
}
