/**
 * Put this script INSIDE the master sheet "DAILY 2026_27_Daily Position"
 * (open that sheet > Extensions > Apps Script > paste > Save > reload the sheet).
 *
 * A menu "DAILY POSITION" appears. One click on "Create today's blocks (all tabs)" adds, at the bottom of EVERY
 * report tab of this sheet, a new empty block with the new date - copied from the empty form tabs of the
 * "DAILY POSITION" sheet (same tab names). Each tab can start in its own column (see TAB_SETTINGS).
 * Tabs that have no form there (MIXED SPL DATA, TXR POSITION, ...) are not touched.
 * Nothing existing is changed or deleted; blocks are only added below the last row.
 */

// The sheet that holds the EMPTY forms (from its link: /d/<THIS PART>/edit)
var TEMPLATE_ID = '1QcVso_XejCeQolF__9fg_Pmx3maZGFjm_UEo6p3dzkA';

var DAY_OFFSET = 0;         // date in the new blocks: 0 = today, 1 = tomorrow  (a tab can override it below)
var GAP_ROWS = 2;           // blank rows left between two days
var ONLY_TABS = [];         // [] = every tab that has a form in DAILY POSITION. Or e.g. ['ALL TRAINS', 'CC']
var SKIP_TABS = [];         // tabs never touched

// Per tab: col = column where the new block starts (default A), dayOffset = date of the block (default DAY_OFFSET),
// create = make the tab in this sheet if it does not exist yet.  Names ignore spaces and capital letters.
var TAB_SETTINGS = {
  'HQ IVVALID': { col: 'B' },
  'HQ INVALID': { col: 'B' },
  'CC':         { col: 'B' },
  'SPL TRAINS': { col: 'D' },
  'HQ CRACK..': { col: 'B' },
  'BREAK VAN':  { col: 'C', dayOffset: 1, create: true }     // starts in column C, carries TOMORROW's date
};

/* ---------- menu ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('DAILY POSITION')
    .addItem("Create today's blocks (all tabs)", 'menuCreateToday')
    .addToUi();
}

function menuCreateToday() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.alert('Create new dated blocks',
    'Add the new empty blocks (with the new date) at the bottom of every report tab?',
    ui.ButtonSet.YES_NO);
  if (r === ui.Button.YES) createToday();
}

/* ---------- main ---------- */
function createToday() {
  var master = SpreadsheetApp.getActiveSpreadsheet();
  var tplBook = SpreadsheetApp.openById(TEMPLATE_ID);
  var tz = master.getSpreadsheetTimeZone();
  var props = PropertiesService.getScriptProperties();
  var log = ['New blocks'];
  var settings = {};
  Object.keys(TAB_SETTINGS).forEach(function (k) { settings[key_(k)] = TAB_SETTINGS[k]; });

  tplBook.getSheets().forEach(function (tpl) {
    if (tpl.isSheetHidden()) return;
    var name = tpl.getName();
    var key = key_(name);
    if (ONLY_TABS.length && !inList_(ONLY_TABS, name)) return;
    if (inList_(SKIP_TABS, name)) return;
    var st = settings[key] || {};

    var day = new Date();
    day.setDate(day.getDate() + (st.dayOffset === undefined ? DAY_OFFSET : st.dayOffset));
    var dayLabel = Utilities.formatDate(day, tz, 'dd-MM-yyyy');
    var dayKey = Utilities.formatDate(day, tz, 'yyyy-MM-dd');
    var col = colIndex_(st.col || 'A');

    try {
      var mt = findTab_(master, name);
      if (!mt && st.create) mt = master.insertSheet(name.trim());
      if (!mt) return;                                   // not a report tab of this sheet - leave it alone
      if (props.getProperty('DONE_' + key) === dayKey) { log.push('- ' + name.trim() + ': already added for ' + dayLabel + ' - skipped'); return; }
      var startRow = mt.getLastRow() === 0 ? 1 : mt.getLastRow() + 1 + GAP_ROWS;
      var rows = paste_(tpl, mt, startRow, col, master, day);
      props.setProperty('DONE_' + key, dayKey);
      log.push('- ' + name.trim() + ': block added (' + rows + ' rows, from row ' + startRow + ', column ' + (st.col || 'A') + ', date ' + dayLabel + ')');
    } catch (err) {
      log.push('- ' + name.trim() + ': ERROR ' + err.message);
    }
  });

  var text = log.join('\n');
  Logger.log(text);
  try { SpreadsheetApp.getUi().alert(text); } catch (e) { /* run without a screen: the log is enough */ }
}

/* ---------- helpers ---------- */
function key_(name) { return String(name).replace(/\s+/g, '').toUpperCase(); }

function inList_(list, name) {
  var k = key_(name);
  for (var i = 0; i < list.length; i++) if (key_(list[i]) === k) return true;
  return false;
}

function colIndex_(letters) {
  var n = 0, s = String(letters).toUpperCase();
  for (var i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
  return n;
}

function findTab_(book, name) {
  var want = key_(name);
  var all = book.getSheets();
  for (var i = 0; i < all.length; i++) if (key_(all[i].getName()) === want) return all[i];
  return null;
}

// Pastes a dated copy of the empty form below the last row of the master tab, its left edge in column `col`.
// Returns the number of rows pasted.
function paste_(tpl, mt, startRow, col, master, day) {
  var rng = tpl.getDataRange();
  var r0 = rng.getRow(), c0 = rng.getColumn(), nR = rng.getNumRows(), nC = rng.getNumColumns();
  var tmp = tpl.copyTo(master);                        // exact copy (formats, merges, borders, formulas) inside this sheet
  try {
    setDates_(tmp, day);                               // new date in the titles of the COPY only
    var needRows = startRow + nR - 1;
    if (mt.getMaxRows() < needRows) mt.insertRowsAfter(mt.getMaxRows(), needRows - mt.getMaxRows());
    var needCols = col + nC - 1;
    if (mt.getMaxColumns() < needCols) mt.insertColumnsAfter(mt.getMaxColumns(), needCols - mt.getMaxColumns());
    tmp.getRange(r0, c0, nR, nC).copyTo(mt.getRange(startRow, col, nR, nC));
  } finally {
    master.deleteSheet(tmp);
  }
  return nR;
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
