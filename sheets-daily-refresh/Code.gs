/**
 * DAILY POSITION (empty tabs)  ->  new dated block in "DAILY 2026_27_Daily Position"
 *
 * This sheet (DAILY POSITION) keeps the EMPTY report tabs. Every day the script
 *   1. takes each empty tab,
 *   2. changes the date in its title to the new day (e.g. NUMBERS OF TRAINS RUN-08-10-2026),
 *   3. pastes it BELOW the existing rows of the same-named tab in the master sheet
 *      "DAILY 2026_27_Daily Position" - ready to be filled for that day.
 * The empty tabs here are never changed. Formulas (totals) are pasted as formulas.
 *
 * Install (open the DAILY POSITION sheet > Extensions > Apps Script > paste > Save):
 *   a) run `previewToday`  - shows what would be pasted, changes nothing (View > Executions)
 *   b) run `createToday`   - pastes today's blocks (authorise the first time)
 *   c) run `installDailyTrigger` once - then it runs every day by itself
 */

// Master sheet (from its link: /d/<THIS PART>/edit)
var MASTER_ID = '1MyG9mvgcofrB5hxKB409qj89qMm4CY4q_56faGrUpjg';

var DAY_OFFSET = 0;         // 0 = today's date in the new block, 1 = tomorrow's
var TRIGGER_HOUR = 0;       // runs between 00:00 and 01:00 (set the time zone to IST in Project Settings)
var GAP_ROWS = 2;           // blank rows left between two days in the master tab
var ONLY_TABS = [];         // [] = every visible tab of this sheet. Or e.g. ['ALL TRAINS', 'CC']
var SKIP_TABS = [];         // tabs never used
var CREATE_MISSING_MASTER_TAB = false;   // true = create the tab in the master if it does not exist
var NOTIFY_EMAIL = '';      // optional: e-mail that receives the result

/* ---------- entry points ---------- */
// Menu "DAILY POSITION" in the sheet: one click changes every tab
function onOpen() {
  SpreadsheetApp.getUi().createMenu('DAILY POSITION')
    .addItem("Create today's blocks (all tabs)", 'menuCreateToday')
    .addToUi();
}
function menuCreateToday() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.alert('Create new dated blocks',
    "Paste today's empty blocks (with the new date) below the existing rows of every tab in the master sheet?",
    ui.ButtonSet.YES_NO);
  if (r === ui.Button.YES) createToday();
}
function previewToday() { run_(true); }
function createToday() { run_(false); }

function installDailyTrigger() {
  removeDailyTrigger();
  ScriptApp.newTrigger('createToday').timeBased().everyDays(1).atHour(TRIGGER_HOUR).create();
  SpreadsheetApp.getActive().toast('Daily run set for about ' + TRIGGER_HOUR + ':00', 'Done', 5);
}
function removeDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'createToday') ScriptApp.deleteTrigger(t);
  });
}

/* ---------- main ---------- */
function tabs_(ss) {
  return ss.getSheets().filter(function (sh) {
    var n = sh.getName();
    if (sh.isSheetHidden() || n === 'RUN LOG') return false;
    if (ONLY_TABS.length && ONLY_TABS.indexOf(n) < 0) return false;
    return SKIP_TABS.indexOf(n) < 0;
  });
}

function run_(preview) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var master = SpreadsheetApp.openById(MASTER_ID);
  var tz = ss.getSpreadsheetTimeZone();
  var day = new Date();
  day.setDate(day.getDate() + DAY_OFFSET);
  var dayLabel = Utilities.formatDate(day, tz, 'dd-MM-yyyy');
  var dayKey = Utilities.formatDate(day, tz, 'yyyy-MM-dd');
  var props = PropertiesService.getScriptProperties();
  var log = [(preview ? 'PREVIEW for ' : 'CREATED for ') + dayLabel];

  tabs_(ss).forEach(function (tpl) {
    var name = tpl.getName();
    try {
      var mt = findMasterTab_(master, name);
      if (!mt && CREATE_MISSING_MASTER_TAB && !preview) mt = master.insertSheet(name);
      if (!mt) { log.push('- ' + name + ': no tab "' + name.trim() + '" in the master - skipped'); return; }
      if (props.getProperty('DONE_' + name) === dayKey) { log.push('- ' + name + ': already pasted for ' + dayLabel + ' - skipped'); return; }

      var rng = tpl.getDataRange();
      var startRow = mt.getLastRow() === 0 ? 1 : mt.getLastRow() + 1 + GAP_ROWS;
      if (preview) {
        log.push('- ' + name + ': would paste ' + rng.getNumRows() + ' rows into master tab "' + mt.getName() + '" at row ' + startRow);
        return;
      }
      paste_(tpl, mt, startRow, master, day);
      props.setProperty('DONE_' + name, dayKey);
      log.push('- ' + name + ': pasted ' + rng.getNumRows() + ' rows into master "' + mt.getName() + '" at row ' + startRow);
    } catch (err) {
      log.push('- ' + name + ': ERROR ' + err.message);
    }
  });

  var text = log.join('\n');
  Logger.log(text);
  writeLog_(ss, log);                                 // visible in the sheet: tab RUN LOG
  try { SpreadsheetApp.getUi().alert(text); } catch (e) { /* run by the daily trigger: no screen */ }
  if (NOTIFY_EMAIL && !preview) MailApp.sendEmail(NOTIFY_EMAIL, 'Daily position blocks ' + dayLabel, text);
}

// Writes the result into a tab called RUN LOG, so it can always be read inside the sheet.
function writeLog_(ss, lines) {
  var sh = ss.getSheetByName('RUN LOG') || ss.insertSheet('RUN LOG');
  sh.clear();
  var stamp = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'dd-MM-yyyy HH:mm:ss');
  var rows = [['Run at ' + stamp]].concat(lines.map(function (l) { return [l]; }));
  sh.getRange(1, 1, rows.length, 1).setValues(rows);
  sh.setColumnWidth(1, 700);
}

/* ---------- paste a dated copy of the empty tab below the master tab's rows ---------- */
function findMasterTab_(master, name) {
  var want = name.trim().toUpperCase();
  var all = master.getSheets();
  for (var i = 0; i < all.length; i++) if (all[i].getName().trim().toUpperCase() === want) return all[i];
  return null;
}

function paste_(tpl, mt, startRow, master, day) {
  var rng = tpl.getDataRange();
  var r0 = rng.getRow(), c0 = rng.getColumn(), nR = rng.getNumRows(), nC = rng.getNumColumns();
  var tmp = tpl.copyTo(master);                       // exact copy (formats, merges, borders, formulas) inside the master
  try {
    setDates_(tmp, day);                              // new date in the titles of the COPY only
    var needRows = startRow + nR - 1;
    if (mt.getMaxRows() < needRows) mt.insertRowsAfter(mt.getMaxRows(), needRows - mt.getMaxRows());
    if (mt.getMaxColumns() < c0 + nC - 1) mt.insertColumnsAfter(mt.getMaxColumns(), c0 + nC - 1 - mt.getMaxColumns());
    tmp.getRange(r0, c0, nR, nC).copyTo(mt.getRange(startRow, c0, nR, nC));
  } finally {
    master.deleteSheet(tmp);
  }
}

function setDates_(sh, day) {
  var rng = sh.getDataRange();
  var vals = rng.getValues();
  for (var r = 0; r < vals.length; r++) {
    for (var c = 0; c < vals[r].length; c++) {
      var v = vals[r][c];
      if (v instanceof Date) {
        sh.getRange(rng.getRow() + r, rng.getColumn() + c).setValue(new Date(day.getFullYear(), day.getMonth(), day.getDate()));
      } else if (typeof v === 'string') {
        var nv = newTitle_(v, day);
        if (nv !== v) sh.getRange(rng.getRow() + r, rng.getColumn() + c).setValue(nv);
      }
    }
  }
}

/* ---------- pure helper ---------- */
function p2_(n) { return (n < 10 ? '0' : '') + n; }

// "NUMBERS OF TRAINS RUN-07-10-2026" -> same text with the new date
// "NUT SHELL POSITION ON DATE-  07-08/10/2026" (two days) -> day-nextday/MM/yyyy
function newTitle_(s, day) {
  var tom = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
  var range = /(\d{1,2})\s*-\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})/;
  if (range.test(s)) return s.replace(range, p2_(day.getDate()) + '-' + p2_(tom.getDate()) + '/' + p2_(tom.getMonth() + 1) + '/' + tom.getFullYear());
  var dash = /(\d{1,2})-(\d{1,2})-(\d{4})/;
  if (dash.test(s)) return s.replace(dash, p2_(day.getDate()) + '-' + p2_(day.getMonth() + 1) + '-' + day.getFullYear());
  var slash = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
  if (slash.test(s)) return s.replace(slash, p2_(day.getDate()) + '/' + p2_(day.getMonth() + 1) + '/' + day.getFullYear());
  return s;
}
