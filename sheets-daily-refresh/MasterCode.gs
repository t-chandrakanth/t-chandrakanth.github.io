/**
 * FINAL SCRIPT - put it INSIDE the master sheet "DAILY 2026_27_Daily Position"
 * (open that sheet > Extensions > Apps Script > paste > Save > reload the sheet).
 *
 * A menu "DAILY POSITION" appears. One click on "Create today's blocks" takes EVERY tab of the "DAILY POSITION"
 * sheet and adds, at the bottom of the same-named tab of this sheet, a new full empty block with the new date
 * (all rows, columns, merges, borders, formulas). Tabs of this sheet that have no form in DAILY POSITION
 * (MIXED SPL DATA, TXR POSITION, ...) are not touched. Existing rows are never changed or deleted.
 * A few tabs start in another column or carry another date - see TAB_SETTINGS.
 */

// The sheet that holds the EMPTY forms (from its link: /d/<THIS PART>/edit)
var TEMPLATE_ID = '1QcVso_XejCeQolF__9fg_Pmx3maZGFjm_UEo6p3dzkA';

var DAY_OFFSET = 0;         // date in the new blocks: 0 = today, 1 = tomorrow  (a tab can override it below)
var GAP_ROWS = 2;           // blank rows left between two days

var CREATE_MISSING_TAB = true;   // a form tab with no same-named tab in this sheet gets a new tab here

// Special cases only - every other tab starts in column A with DAY_OFFSET's date.
// col = column where the new block starts, dayOffset = date of the block. Names ignore spaces and capital letters.
var TAB_SETTINGS = {
  'HQ IVVALID': { col: 'B' },                                  // "HQ INVALID" is accepted too
  'NUT SHELL':  { col: 'B' },
  'CC':         { col: 'B' },
  'SPL Trains': { col: 'D' },
  'HQ CRACK..': { col: 'B' },
  'BREAK VAN':  { col: 'C', dayOffset: 1 },                    // column C, TOMORROW's date
  'UNUSUAL':    { col: 'A', dayOffset: 0 }                     // column A, TODAY's date
};
var ALIASES = { 'HQINVALID': 'HQIVVALID' };                     // other spellings of a tab name

/* ---------- menu ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('DAILY POSITION')
    .addItem("Create today's blocks", 'menuCreateToday')
    .addItem('Create TXR POSITION block', 'menuCreateTxr')
    .addItem('Create TXR SUMMARY block', 'menuCreateSummary')
    .addItem('Create TXR POSITION + TXR SUMMARY', 'menuCreateBothTxr')
    .addItem('Create SR.IV DATA + SICK POH ROH blocks', 'menuCreateCopyTabs')
    .addToUi();
}

function menuCreateToday() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.alert('Create new dated blocks',
    'Add the new empty blocks (with the new date) at the bottom of every tab?',
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
  var special = {};
  Object.keys(TAB_SETTINGS).forEach(function (k) { special[key_(k)] = TAB_SETTINGS[k]; });

  tplBook.getSheets().forEach(function (tpl) {           // EVERY visible tab of DAILY POSITION
    if (tpl.isSheetHidden()) return;
    var name = tpl.getName().trim();
    var key = key_(name);
    var st = special[key] || {};
    var day = new Date();
    day.setDate(day.getDate() + (st.dayOffset === undefined ? DAY_OFFSET : st.dayOffset));
    var dayLabel = Utilities.formatDate(day, tz, 'dd-MM-yyyy');
    var dayKey = Utilities.formatDate(day, tz, 'yyyy-MM-dd');
    try {
      var mt = findTab_(master, name);
      if (!mt && CREATE_MISSING_TAB) mt = master.insertSheet(name);
      if (!mt) { log.push('- ' + name + ': no tab with this name in this sheet - skipped'); return; }
      if (props.getProperty('DONE_' + key) === dayKey) { log.push('- ' + name + ': already added for ' + dayLabel + ' - skipped'); return; }

      var startRow = mt.getLastRow() === 0 ? 1 : mt.getLastRow() + 1 + GAP_ROWS;
      var rows = paste_(tpl, mt, startRow, colIndex_(st.col || 'A'), master, day);
      props.setProperty('DONE_' + key, dayKey);
      log.push('- ' + name + ': block added (' + rows + ' rows, from row ' + startRow + ', column ' + (st.col || 'A') + ', date ' + dayLabel + ')');
    } catch (err) {
      log.push('- ' + name + ': ERROR ' + err.message);
    }
  });

  var text = log.join('\n');
  Logger.log(text);
  try { SpreadsheetApp.getUi().alert(text); } catch (e) { /* run without a screen: the log is enough */ }
}

/* ---------- helpers ---------- */
function key_(name) {
  var k = String(name).replace(/\s+/g, '').toUpperCase();
  return ALIASES[k] || k;
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
// "TITLE ON DATE-  07-08/10/2026" (two days) -> day-nextday/MM/yyyy
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

// one click: TXR POSITION and TXR SUMMARY together
function menuCreateBothTxr() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.alert('TXR POSITION + TXR SUMMARY', 'Add the new day block in both tabs?', ui.ButtonSet.YES_NO);
  if (r === ui.Button.YES) { createTxrBlock(); createSummaryBlock(); }
}

/* ================= SR.IV DATA and SICK POH ROH: next day = same block with the new date ================= */
// carry = true : OPENING (columns 1,2) = yesterday's CLOSING (the two columns after column 12), columns 3-12 emptied
// carry = false: everything stays exactly the same, only the date changes
var COPY_DAY_OFFSET = 0;          // 0 = today, 1 = tomorrow
var COPY_GAP_ROWS = 2;
var COPY_TABS = [
  { tab: 'SR.IV DATA',    carry: true },
  { tab: 'SICK POH ROH',  carry: false }
];

function menuCreateCopyTabs() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.alert('SR.IV DATA + SICK POH ROH', 'Add the new day block (new date) at the bottom of both tabs?', ui.ButtonSet.YES_NO);
  if (r === ui.Button.YES) createCopyTabs();
}

function createCopyTabs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var day = new Date();
  day.setDate(day.getDate() + COPY_DAY_OFFSET);
  var log = ['New blocks'];
  COPY_TABS.forEach(function (cfg) {
    var sh = findTab_(ss, cfg.tab);
    if (!sh) {
      log.push('- ' + cfg.tab + ': tab not found. Tabs here: ' + ss.getSheets().map(function (x) { return x.getName(); }).join(' | '));
      return;
    }
    try { log.push('- ' + sh.getName() + ': ' + addCopyBlock_(sh, cfg, day)); }
    catch (err) { log.push('- ' + cfg.tab + ': ERROR ' + err.message); }
  });
  var text = log.join('\n');
  Logger.log(text);
  try { SpreadsheetApp.getUi().alert(text); } catch (e) { }
}

function addCopyBlock_(sh, cfg, day) {
  var lastRow = sh.getLastRow(), nCols = Math.max(sh.getLastColumn(), 1);
  var all = sh.getRange(1, 1, lastRow, nCols);
  var plan = planCopy_(all.getValues(), all.getFormulas(), day, cfg.carry);
  if (plan.error) return plan.error;

  var start = lastRow + 1 + COPY_GAP_ROWS;
  var need = start + plan.nRows - 1;
  if (sh.getMaxRows() < need) sh.insertRowsAfter(sh.getMaxRows(), need - sh.getMaxRows());
  sh.getRange(plan.startRow + 1, 1, plan.nRows, nCols).copyTo(sh.getRange(start, 1, plan.nRows, nCols));

  function cell(r, c) { return sh.getRange(start + r, c + 1); }
  if (plan.clears.length) sh.getRangeList(plan.clears.map(function (x) { return cell(x[0], x[1]).getA1Notation(); })).clearContent();
  plan.sets.forEach(function (x) { cell(x[0], x[1]).setValue(x[2]); });
  return plan.nRows + ' rows added from row ' + start + ' (' + plan.newTitle + ')' + (plan.note ? ' - ' + plan.note : '');
}

// "07-08/10/2026" / "07-10-2026" / "07/10/2026" found in a text, or null
function titleKey_(s) {
  var m = String(s).match(/(\d{1,2})\s*-\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})/) ||
          String(s).match(/(\d{1,2})-(\d{1,2})-(\d{4})/) || String(s).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return m ? m[0] : null;
}

// pure: works on the values/formulas arrays
function planCopy_(values, formulas, day, carry) {
  function up(v) { return String(v === null || v === undefined ? '' : v).trim().toUpperCase(); }
  var nCols = values[0].length, titles = [];
  for (var r = 0; r < values.length; r++) {
    for (var c = 0; c < Math.min(nCols, 4); c++) {
      if (typeof values[r][c] === 'string' && titleKey_(values[r][c])) { titles.push({ r: r, c: c, text: values[r][c], key: titleKey_(values[r][c]) }); break; }
    }
  }
  if (!titles.length) return { error: 'no title with a date (like INVALID DATA- 07-08/10/2026) found' };
  var last = titles[titles.length - 1];
  var newText = newTitle_(last.text, day);
  if (titles.some(function (t) { return t.text === newText; })) return { error: 'a block with this date already exists - nothing added' };

  var first = titles.length - 1;                                   // a block may have several titled rows with the same date
  while (first > 0 && titles[first - 1].key === last.key) first--;
  var startRow = titles[first].r, nRows = values.length - startRow;
  var B = values.slice(startRow), F = formulas.slice(startRow);
  var plan = { startRow: startRow, nRows: nRows, sets: [], clears: [], newTitle: newText, note: '' };

  // new date everywhere in the block
  for (var i = 0; i < nRows; i++) for (var j = 0; j < nCols; j++) {
    var v = B[i][j];
    if (typeof v === 'string') {
      var nv = newTitle_(v, day);
      if (nv === v && j < 3 && /^\d{1,2}-\d{1,2}$/.test(v.trim())) nv = p2_(day.getDate()) + '-' + p2_(day.getMonth() + 1);
      if (nv !== v) plan.sets.push([i, j, nv]);
    } else if (v instanceof Date && j < 3) {
      plan.sets.push([i, j, new Date(day.getFullYear(), day.getMonth(), day.getDate())]);
    }
  }
  if (!carry) return plan;

  // find the numbering row 1,2,...,12
  var nr = -1, c1 = -1;
  for (var a = 0; a < nRows && nr < 0; a++) for (var b = 0; b + 13 < nCols; b++) {
    var ok = true;
    for (var k = 0; k < 12; k++) if (Number(B[a][b + k]) !== k + 1 || B[a][b + k] === '') { ok = false; break; }
    if (ok) { nr = a; c1 = b; break; }
  }
  if (nr < 0 || c1 < 1) { plan.note = 'numbering row 1..12 not found - only the date was changed'; return plan; }
  var label = c1 - 1, cl = c1 + 12;                                 // label column, first CLOSING column
  var rowsT = [], totalR = -1;
  for (var q = nr + 1; q < nRows; q++) {
    var lb = B[q][label];
    var t = up(lb);
    if (t === '' || lb instanceof Date || /^\d{1,2}-\d{1,2}$/.test(t)) continue;
    if (t === 'TOTAL') { totalR = q; continue; }
    rowsT.push(q);
  }
  var sums = [];
  for (var z = 0; z < 14; z++) sums.push(0);
  rowsT.forEach(function (q) {
    for (var o = 0; o < 2; o++) {
      var cv = B[q][cl + o];
      plan.sets.push([q, c1 + o, cv === '' ? '' : cv]);              // opening = yesterday's closing
      sums[o] += Number(cv) || 0;
      sums[12 + o] += Number(cv) || 0;
    }
    for (var m = 2; m < 12; m++) if (!F[q][c1 + m] && up(B[q][c1 + m]) !== '') plan.clears.push([q, c1 + m]);
  });
  if (totalR > -1) for (var w = 0; w < 14; w++) {
    if (!F[totalR][c1 + w]) plan.sets.push([totalR, c1 + w, sums[w]]);
  }
  plan.note = 'opening = yesterday\'s closing, columns 3-12 emptied';
  return plan;
}
