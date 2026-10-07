/**
 * DAILY POSITION - daily archive + reset.
 *
 * Every morning, for each daily tab of THIS sheet (HQ IVVALID, ALL TRAINS, NUT SHELL, ...):
 *   1. the tab as filled yesterday is pasted BELOW the existing rows of the same-named tab in the master sheet
 *      ("DAILY 2026_27_Daily Position");
 *   2. the daily tab is emptied (restored from its hidden template copy TPL_<name>);
 *   3. the date in the titles is changed to today.
 * Nothing is cleared unless the paste into the master worked. A tab nobody filled is not archived.
 *
 * Install (open the DAILY POSITION sheet > Extensions > Apps Script > paste > Save):
 *   a) while the daily tabs are EMPTY run `setupTemplates` once (authorise)  - it stores the empty layout
 *   b) run `previewDaily`  - shows what would happen, changes nothing (View > Logs / Executions)
 *   c) run `installDailyTrigger` once  - then it runs every morning by itself
 */

// Master / archive sheet (from its link: /d/<THIS PART>/edit)
var MASTER_ID = '1MyG9mvgcofrB5hxKB409qj89qMm4CY4q_56faGrUpjg';

var TRIGGER_HOUR = 5;       // runs at about 05:00 (set the time zone to IST in Project Settings)
var GAP_ROWS = 2;           // blank rows left between two days in the master tab
var ONLY_TABS = [];         // [] = all tabs. Or e.g. ['ALL TRAINS', 'CC']
var SKIP_TABS = [];         // tabs never touched
var CREATE_MISSING_MASTER_TAB = false;   // true = create the tab in the master if it does not exist
var NOTIFY_EMAIL = '';      // optional: e-mail that receives the result
var TPL_PREFIX = 'TPL_';

/* ---------- entry points ---------- */
function setupTemplates() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var n = 0;
  tabs_(ss).forEach(function (sh) {
    var old = ss.getSheetByName(TPL_PREFIX + sh.getName());
    if (old) ss.deleteSheet(old);
    var tpl = sh.copyTo(ss);
    tpl.setName((TPL_PREFIX + sh.getName()).slice(0, 100));
    tpl.hideSheet();
    n++;
  });
  ss.toast(n + ' template(s) saved (hidden TPL_ tabs). Keep them.', 'Done', 6);
}
function previewDaily() { run_(true); }
function runDaily() { run_(false); }

function installDailyTrigger() {
  removeDailyTrigger();
  ScriptApp.newTrigger('runDaily').timeBased().everyDays(1).atHour(TRIGGER_HOUR).create();
  SpreadsheetApp.getActive().toast('Daily run set for about ' + TRIGGER_HOUR + ':00', 'Done', 5);
}
function removeDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'runDaily') ScriptApp.deleteTrigger(t);
  });
}

/* ---------- main ---------- */
function tabs_(ss) {
  return ss.getSheets().filter(function (sh) {
    var n = sh.getName();
    if (n.indexOf(TPL_PREFIX) === 0) return false;
    if (ONLY_TABS.length && ONLY_TABS.indexOf(n) < 0) return false;
    return SKIP_TABS.indexOf(n) < 0;
  });
}

function run_(preview) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var master = SpreadsheetApp.openById(MASTER_ID);
  var tz = ss.getSpreadsheetTimeZone();
  var today = new Date();
  var todayLabel = Utilities.formatDate(today, tz, 'dd-MM-yyyy');
  var props = PropertiesService.getScriptProperties();
  var runKey = Utilities.formatDate(today, tz, 'yyyy-MM-dd');
  var log = [(preview ? 'PREVIEW ' : 'RUN ') + todayLabel];

  if (!preview && props.getProperty('LAST_RUN') === runKey) {
    Logger.log('Already ran today (' + todayLabel + ') - nothing done.');
    return;
  }

  tabs_(ss).forEach(function (dsh) {
    var name = dsh.getName();
    try {
      var tpl = ss.getSheetByName((TPL_PREFIX + name).slice(0, 100));
      if (!tpl) { log.push('- ' + name + ': no template - run setupTemplates first - skipped'); return; }

      var changed = norm_(dsh.getDataRange().getValues()) !== norm_(tpl.getDataRange().getValues());
      if (changed) {
        var mt = findMasterTab_(master, name);
        if (!mt && CREATE_MISSING_MASTER_TAB && !preview) mt = master.insertSheet(name);
        if (!mt) { log.push('- ' + name + ': filled, but no tab "' + name.trim() + '" in the master - NOT cleared'); return; }
        var startRow = mt.getLastRow() === 0 ? 1 : mt.getLastRow() + 1 + GAP_ROWS;
        var rng = dsh.getDataRange();
        if (preview) {
          log.push('- ' + name + ': filled -> would paste ' + rng.getNumRows() + ' rows into master tab "' + mt.getName() + '" at row ' + startRow + ', then empty the tab');
          return;
        }
        archive_(dsh, mt, startRow, master);
        log.push('- ' + name + ': pasted ' + rng.getNumRows() + ' rows into master "' + mt.getName() + '" at row ' + startRow);
      } else {
        log.push('- ' + name + ': nothing filled - not archived' + (preview ? '' : ', date refreshed'));
      }
      if (!preview) reset_(dsh, tpl, today);
    } catch (err) {
      log.push('- ' + name + ': ERROR ' + err.message + ' (tab left as it was)');
    }
  });

  if (!preview) props.setProperty('LAST_RUN', runKey);
  var text = log.join('\n');
  Logger.log(text);
  try { ss.toast('Done - details in Executions/Logs', preview ? 'Preview' : 'Daily run', 8); } catch (e) { /* trigger: no UI */ }
  if (NOTIFY_EMAIL && !preview) MailApp.sendEmail(NOTIFY_EMAIL, 'Daily position run ' + todayLabel, text);
}

/* ---------- archive: paste the filled tab below the existing rows of the master tab ---------- */
function findMasterTab_(master, name) {
  var want = name.trim().toUpperCase();
  var all = master.getSheets();
  for (var i = 0; i < all.length; i++) if (all[i].getName().trim().toUpperCase() === want) return all[i];
  return null;
}

function archive_(dsh, mt, startRow, master) {
  var rng = dsh.getDataRange();
  var nR = rng.getNumRows(), nC = rng.getNumColumns();
  var tmp = dsh.copyTo(master);                       // exact copy (formats, merges, borders) inside the master
  try {
    var needRows = startRow + nR - 1;
    if (mt.getMaxRows() < needRows) mt.insertRowsAfter(mt.getMaxRows(), needRows - mt.getMaxRows());
    if (mt.getMaxColumns() < rng.getColumn() + nC - 1) mt.insertColumnsAfter(mt.getMaxColumns(), rng.getColumn() + nC - 1 - mt.getMaxColumns());
    var from = tmp.getRange(rng.getRow(), rng.getColumn(), nR, nC);
    var to = mt.getRange(startRow, rng.getColumn(), nR, nC);
    from.copyTo(to);
    to.setValues(to.getValues());                     // freeze formulas as values in the archive
  } finally {
    master.deleteSheet(tmp);
  }
}

/* ---------- reset: empty the daily tab and set today's date ---------- */
function reset_(dsh, tpl, today) {
  dsh.getRange(1, 1, dsh.getMaxRows(), dsh.getMaxColumns()).breakApart();
  dsh.clear();
  tpl.getDataRange().copyTo(dsh.getRange(1, 1));

  var rng = dsh.getDataRange();
  var vals = rng.getValues();
  for (var r = 0; r < vals.length; r++) {
    for (var c = 0; c < vals[r].length; c++) {
      var v = vals[r][c];
      var cell = dsh.getRange(rng.getRow() + r, rng.getColumn() + c);
      if (v instanceof Date) {
        cell.setValue(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
      } else if (typeof v === 'string') {
        var nv = newTitle_(v, today);
        if (nv !== v) cell.setValue(nv);
      }
    }
  }
}

/* ---------- pure helpers ---------- */
function p2_(n) { return (n < 10 ? '0' : '') + n; }

// "NUMBERS OF TRAINS RUN-07-10-2026" -> same text with today's date
// "NUT SHELL POSITION ON DATE-  07-08/10/2026" (two days) -> today-tomorrow/MM/yyyy
function newTitle_(s, today) {
  var tom = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  var range = /(\d{1,2})\s*-\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})/;
  if (range.test(s)) return s.replace(range, p2_(today.getDate()) + '-' + p2_(tom.getDate()) + '/' + p2_(tom.getMonth() + 1) + '/' + tom.getFullYear());
  var dash = /(\d{1,2})-(\d{1,2})-(\d{4})/;
  if (dash.test(s)) return s.replace(dash, p2_(today.getDate()) + '-' + p2_(today.getMonth() + 1) + '-' + today.getFullYear());
  var slash = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
  if (slash.test(s)) return s.replace(slash, p2_(today.getDate()) + '/' + p2_(today.getMonth() + 1) + '/' + today.getFullYear());
  return s;
}

// Comparable text of a tab with every date removed, so a changed title date alone does not count as "filled".
function norm_(values) {
  return JSON.stringify(values.map(function (row) {
    return row.map(function (v) {
      if (v instanceof Date) return '';
      if (typeof v === 'string') return v.replace(/\d{1,2}\s*-\s*\d{1,2}\s*\/\s*\d{1,2}\s*\/\s*\d{4}|\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/g, '').trim();
      return v;
    });
  }));
}
