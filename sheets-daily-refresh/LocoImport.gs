/**
 * DPWCS LOCOS IN OTHER DIV - upload / paste a report (JPG, PNG, PDF, Excel, CSV) and fill TR.NO + CURRENT LOCATION.
 *
 * Add TWO files to the Apps Script project of the sheet that holds the locos tab:
 *   LocoImport.gs   (this file)      LocoSidebar.html   (the window)
 * and turn on  Services (+)  >  Drive API  (needed to read pictures / PDF / Excel).
 *
 * What it does: the window reads the text of the file, looks for every loco number that is already in the
 * DPWCS LOCO NO column, and next to it finds the train no and the location (like BGKT/JU/NWR).
 * You see a preview and press APPLY - only then TR.NO and CURRENT LOCATION are written. Nothing else is touched.
 */

var LOCO_HEADERS = { loco: 'DPWCS LOCO NO', train: 'TR.NO', loc: 'CURRENT LOCATION' };   // heading texts of the three columns

function addLocoMenu_() {                          // call this from your onOpen():  addLocoMenu_();
  SpreadsheetApp.getUi().createMenu('LOCOS')
    .addItem('Upload / paste report', 'openLocoUpload')
    .addToUi();
}

// Also assign this function to a button: Insert > Drawing > (draw a button) > Save > "..." > Assign script > openLocoUpload
function openLocoUpload() {
  var html = HtmlService.createHtmlOutputFromFile('LocoSidebar').setWidth(720).setHeight(620);
  SpreadsheetApp.getUi().showModalDialog(html, 'DPWCS locos - upload / paste report');
}

/* ---------- the locos tab ---------- */
function findLocoSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var list = [ss.getActiveSheet()].concat(ss.getSheets());
  for (var i = 0; i < list.length; i++) {
    var h = locoHeader_(list[i]);
    if (h) return { sh: list[i], h: h };
  }
  throw new Error('No tab with the headings "' + LOCO_HEADERS.loco + '", "' + LOCO_HEADERS.train + '", "' + LOCO_HEADERS.loc + '" found.');
}

function locoHeader_(sh) {
  var n = Math.min(sh.getLastRow(), 15), c = sh.getLastColumn();
  if (n < 1 || c < 1) return null;
  var v = sh.getRange(1, 1, n, c).getValues();
  for (var r = 0; r < n; r++) {
    var up = v[r].map(function (x) { return String(x).replace(/\s+/g, ' ').trim().toUpperCase(); });
    var a = up.indexOf(LOCO_HEADERS.loco), b = up.indexOf(LOCO_HEADERS.train), d = up.indexOf(LOCO_HEADERS.loc);
    if (a > -1 && b > -1 && d > -1) return { row: r + 1, loco: a + 1, train: b + 1, loc: d + 1 };
  }
  return null;
}

// [{row, loco:'44323+42372', nums:['44323','42372'], train, loc}]
function readLocoRows_() {
  var f = findLocoSheet_(), sh = f.sh, h = f.h;
  var last = sh.getLastRow();
  var out = [];
  if (last <= h.row) return { sheet: sh, h: h, rows: out };
  var width = Math.max(h.loco, h.train, h.loc);
  var vals = sh.getRange(h.row + 1, 1, last - h.row, width).getValues();
  vals.forEach(function (r, i) {
    var txt = String(r[h.loco - 1]);
    var nums = txt.match(/(?:^|\D)(\d{5})(?!\d)/g);
    var list = [];
    String(txt).replace(/(?<!\d)\d{5}(?!\d)/g, function (m) { list.push(m); return m; });
    if (!list.length) return;
    out.push({ row: h.row + 1 + i, loco: txt.trim(), nums: list, train: String(r[h.train - 1]), loc: String(r[h.loc - 1]) });
  });
  return { sheet: sh, h: h, rows: out };
}

/* ---------- called by the window ---------- */
// Returns {matches:[...], notFound:[...], chars:n}
function parseReport(name, mime, b64) {
  var text = extractText_(name, mime, b64);
  var info = readLocoRows_();
  var res = matchLocos_(text, info.rows);
  res.chars = text.length;
  res.sample = text.slice(0, 600);
  return res;
}

function applyMatches(items) {
  var info = readLocoRows_(), sh = info.sheet, h = info.h, n = 0;
  items.forEach(function (it) {
    var row = Number(it.row);
    if (!row || row <= h.row) return;
    if (it.train !== undefined && it.train !== '') sh.getRange(row, h.train).setValue(String(it.train).trim());
    if (it.loc !== undefined && it.loc !== '') sh.getRange(row, h.loc).setValue(String(it.loc).trim());
    n++;
  });
  SpreadsheetApp.flush();
  return n;
}

/* ---------- reading text out of a file ---------- */
function extractText_(name, mime, b64) {
  var bytes = Utilities.base64Decode(b64);
  var lower = String(name || '').toLowerCase();
  if (/\.csv$|\.txt$/.test(lower) || mime === 'text/csv' || mime === 'text/plain') {
    return Utilities.newBlob(bytes).getDataAsString();
  }
  var isSheet = /\.xlsx?$/.test(lower) || /spreadsheet|ms-excel/.test(mime || '');
  var blob = Utilities.newBlob(bytes, mime || 'application/octet-stream', name || 'report');
  var target = isSheet ? MimeType.GOOGLE_SHEETS : MimeType.GOOGLE_DOCS;
  var id = driveConvert_(blob, target, name);
  try {
    if (isSheet) {
      var out = [];
      SpreadsheetApp.openById(id).getSheets().forEach(function (s) {
        s.getDataRange().getDisplayValues().forEach(function (r) { out.push(r.join('  ')); });
      });
      return out.join('\n');
    }
    return DocumentApp.openById(id).getBody().getText();
  } finally {
    try { DriveApp.getFileById(id).setTrashed(true); } catch (e) { }
  }
}

function driveConvert_(blob, targetMime, name) {
  if (typeof Drive === 'undefined') throw new Error('Turn on Services (+) > Drive API in this Apps Script project, then try again.');
  var title = 'tmp-loco-import-' + (name || '');
  if (Drive.Files.insert) {                                        // Drive API v2
    var f = Drive.Files.insert({ title: title, mimeType: targetMime }, blob, { ocr: targetMime === MimeType.GOOGLE_DOCS, ocrLanguage: 'en', convert: true });
    return f.id;
  }
  var g = Drive.Files.create({ name: title, mimeType: targetMime }, blob, { ocrLanguage: 'en' });   // Drive API v3
  return g.id;
}

/* ---------- finding train no + location next to each loco (pure) ---------- */
var LOC_RE = /^[A-Z]{2,6}(?:\/[A-Z0-9]{1,6}){1,3}$/;

function matchLocos_(text, rows) {
  var tokens = String(text).toUpperCase().replace(/[|;,–—]/g, ' ').replace(/\+/g, ' + ').split(/\s+/).filter(function (t) { return t; });
  var known = {};
  rows.forEach(function (r) { r.nums.forEach(function (n) { (known[n] = known[n] || []).push(r); }); });

  var hits = [];                                                   // {i, num}
  tokens.forEach(function (t, i) {
    var m = t.match(/(?<!\d)\d{5}(?!\d)/);
    if (m && known[m[0]]) hits.push({ i: i, num: m[0] });
  });

  var found = {};                                                  // row number -> match
  hits.forEach(function (hit, k) {
    var r = known[hit.num][0];
    if (found[r.row]) return;
    // a pair like 44323+42372 is two hits close together: the search starts after the last one
    var from = hit.i, kk = k;
    while (kk + 1 < hits.length && hits[kk + 1].i - hits[kk].i <= 2) { kk++; from = hits[kk].i; }
    var end = Math.min(tokens.length, from + 12);
    if (kk + 1 < hits.length) end = Math.min(end, hits[kk + 1].i);
    var win = tokens.slice(from + 1, end).filter(function (t) { return t !== '+' && !known[t]; });
    var loc = '', train = '', conf = 'ok', li = -1;
    for (var a = 0; a < win.length; a++) if (LOC_RE.test(win[a])) { loc = win[a]; li = a; break; }
    var tEnd = li > -1 ? li : win.length;
    for (var b = 0; b < tEnd; b++) {
      var t = win[b];
      if (/^\d{1,2}[:.]\d{2}$/.test(t) || /^\d{1,2}[-\/]\d{1,2}([-\/]\d{2,4})?$/.test(t)) continue;      // times and dates
      if (/^(?:[A-Z][A-Z0-9\-]{1,9}|\d{4,6})$/.test(t)) {
        train = t;
        if (b + 1 < tEnd && /^[A-Z]$/.test(win[b + 1])) train += ' ' + win[b + 1];                    // "BFNV E"
        break;
      }
    }
    if (!loc && train) { var nx = win[win.indexOf(train.split(' ')[0]) + 1]; if (nx && /^[A-Z]{2,6}$/.test(nx)) { loc = nx; conf = 'check'; } }
    if (!loc || !train) conf = 'check';
    if (!loc && !train) conf = 'none';
    found[r.row] = { row: r.row, loco: r.loco, train: train, loc: loc, oldTrain: r.train, oldLoc: r.loc, conf: conf };
  });

  var matches = Object.keys(found).map(function (k) { return found[k]; }).sort(function (a, b) { return a.row - b.row; });
  var notFound = rows.filter(function (r) { return !found[r.row]; }).map(function (r) { return r.loco; });
  return { matches: matches, notFound: notFound };
}
