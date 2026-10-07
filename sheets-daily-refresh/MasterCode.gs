/**
 * Put this script INSIDE the master sheet "DAILY 2026_27_Daily Position"
 * (open that sheet > Extensions > Apps Script > paste > Save > reload the sheet).
 *
 * A menu "DAILY POSITION" appears. One click on "Create today's blocks (all tabs)" adds, at the bottom of EVERY
 * report tab of this sheet, a new empty block with today's date - copied from the empty form tabs of the
 * "DAILY POSITION" sheet (same tab names). Tabs that have no form there (MIXED SPL DATA, TXR POSITION, ...)
 * are not touched. Nothing existing is changed or deleted; blocks are only added below the last row.
 */

// The sheet that holds the EMPTY forms (from its link: /d/<THIS PART>/edit)
var TEMPLATE_ID = '1QcVso_XejCeQolF__9fg_Pmx3maZGFjm_UEo6p3dzkA';

var DAY_OFFSET = 0;         // 0 = today's date in the new block, 1 = tomorrow's
var GAP_ROWS = 2;           // blank rows left between two days
var ONLY_TABS = [];         // [] = every tab that has a form in DAILY POSITION. Or e.g. ['ALL TRAINS', 'CC']
var SKIP_TABS = [];         // tabs never touched

/* ---------- menu ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('DAILY POSITION')
    .addItem("Create today's blocks (all tabs)", 'menuCreateToday')
    .addToUi();
}

function menuCreateToday() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.alert('Create new dated blocks',
    "Add today's empty blocks (with the new date) at the bottom of every report tab?",
    ui.ButtonSet.YES_NO);
  if (r === ui.Button.YES) createToday();
}

/* ---------- main ---------- */
function createToday() {
  var master = SpreadsheetApp.getActiveSpreadsheet();
  var tplBook = SpreadsheetApp.openById(TEMPLATE_ID);
  var tz = master.getSpreadsheetTimeZone();
  var day = new Date();
  day.setDate(day.getDate() + DAY_OFFSET);
  var dayLabel = Utilities.formatDate(day, tz, 'dd-MM-yyyy');
  var dayKey = Utilities.formatDate(day, tz, 'yyyy-MM-dd');
  var props = PropertiesService.getScriptProperties();
  var log = ['New blocks for ' + dayLabel];

  master.getSheets().forEach(function (mt) {
    var name = mt.getName();
    if (ONLY_TABS.length && ONLY_TABS.indexOf(name) < 0) return;
    if (SKIP_TABS.indexOf(name) > -1) return;
    var tpl = findTab_(tplBook, name);
    if (!tpl) return;                                  // not a report tab - leave it alone
    try {
      if (props.getProperty('DONE_' + name) === dayKey) { log.push('- ' + name + ': already added for ' + dayLabel + ' - skipped'); return; }
      var startRow = mt.getLastRow() === 0 ? 1 : mt.getLastRow() + 1 + GAP_ROWS;
      var rows = paste_(tpl, mt, startRow, master, day);
      props.setProperty('DONE_' + name, dayKey);
      log.push('- ' + name + ': new block added (' + rows + ' rows, from row ' + startRow + ')');
    } catch (err) {
      log.push('- ' + name + ': ERROR ' + err.message);
    }
  });

  var text = log.join('\n');
  Logger.log(text);
  try { SpreadsheetApp.getUi().alert(text); } catch (e) { /* run without a screen: the log is enough */ }
}

function findTab_(book, name) {
  var want = name.trim().toUpperCase();
  var all = book.getSheets();
  for (var i = 0; i < all.length; i++) if (all[i].getName().trim().toUpperCase() === want) return all[i];
  return null;
}

// Pastes a dated copy of the empty form below the last row of the master tab. Returns the number of rows pasted.
function paste_(tpl, mt, startRow, master, day) {
  var rng = tpl.getDataRange();
  var r0 = rng.getRow(), c0 = rng.getColumn(), nR = rng.getNumRows(), nC = rng.getNumColumns();
  var tmp = tpl.copyTo(master);                        // exact copy (formats, merges, borders, formulas) inside this sheet
  try {
    setDates_(tmp, day);                               // new date in the titles of the COPY only
    var needRows = startRow + nR - 1;
    if (mt.getMaxRows() < needRows) mt.insertRowsAfter(mt.getMaxRows(), needRows - mt.getMaxRows());
    if (mt.getMaxColumns() < c0 + nC - 1) mt.insertColumnsAfter(mt.getMaxColumns(), c0 + nC - 1 - mt.getMaxColumns());
    tmp.getRange(r0, c0, nR, nC).copyTo(mt.getRange(startRow, c0, nR, nC));
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
