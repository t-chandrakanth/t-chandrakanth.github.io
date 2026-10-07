/**
 * Daily refresh - copies YESTERDAY's block of every tab from the master sheet
 * ("DAILY 2026_27_Daily Position") into the same-named tab of THIS (daily work) sheet.
 *
 * Install: open the DAILY WORK sheet > Extensions > Apps Script > paste this > Save.
 * 1) Run `previewYesterday` first (shows what would be copied, changes nothing).
 * 2) Run `refreshYesterday` once (authorise) and check the tabs.
 * 3) Run `installDailyTrigger` once - it then runs by itself every morning.
 */

// Master sheet that holds the daily blocks (taken from its link: /d/<THIS PART>/edit)
var SOURCE_ID = '1MyG9mvgcofrB5hxKB409qj89qMm4CY4q_56faGrUpjg';

var DAY_OFFSET = -1;        // -1 = yesterday's block, 0 = today's block
var TRIGGER_HOUR = 5;       // trigger runs at about 05:00 (script time zone - set IST in Project Settings)
var ONLY_TABS = [];         // [] = every tab of this sheet that also exists in the master. Or e.g. ['TXR POSITION', 'MIXED SPL DATA']
var SKIP_TABS = [];         // tabs never touched, e.g. ['NOTES']
var NOTIFY_EMAIL = '';      // optional: e-mail address that gets the result summary

/* ---------- entry points ---------- */
function previewYesterday() { run_(true); }
function refreshYesterday() { run_(false); }

function installDailyTrigger() {
  removeDailyTrigger();
  ScriptApp.newTrigger('refreshYesterday').timeBased().everyDays(1).atHour(TRIGGER_HOUR).create();
  SpreadsheetApp.getActive().toast('Daily refresh set for about ' + TRIGGER_HOUR + ':00', 'Done', 5);
}
function removeDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'refreshYesterday') ScriptApp.deleteTrigger(t);
  });
}

/* ---------- main ---------- */
function run_(preview) {
  var dst = SpreadsheetApp.getActiveSpreadsheet();
  var src = SpreadsheetApp.openById(SOURCE_ID);
  var tz = dst.getSpreadsheetTimeZone();
  var target = new Date();
  target.setDate(target.getDate() + DAY_OFFSET);
  var label = Utilities.formatDate(target, tz, 'dd-MM-yyyy');
  var log = [(preview ? 'PREVIEW for ' : 'Refreshed for ') + label];

  dst.getSheets().forEach(function (dsh) {
    var name = dsh.getName();
    if (ONLY_TABS.length && ONLY_TABS.indexOf(name) < 0) return;
    if (SKIP_TABS.indexOf(name) > -1) return;
    var ssh = src.getSheetByName(name);
    if (!ssh) { log.push('- ' + name + ': no tab with this name in the master - skipped'); return; }
    try {
      var vals = ssh.getDataRange().getValues();
      var b = findBlock_(vals, target.getFullYear(), target.getMonth() + 1, target.getDate());
      if (!b) { log.push('- ' + name + ': no block dated ' + label + ' found - left unchanged'); return; }
      var nRows = b.end - b.start + 1;
      if (preview) { log.push('- ' + name + ': would copy master rows ' + (b.start + 1) + '-' + (b.end + 1) + ' (' + nRows + ' rows)'); return; }
      copyBlock_(ssh, b.start + 1, b.end + 1, dsh);
      log.push('- ' + name + ': copied ' + nRows + ' rows (master rows ' + (b.start + 1) + '-' + (b.end + 1) + ')');
    } catch (err) {
      log.push('- ' + name + ': ERROR ' + err.message);
    }
  });

  var text = log.join('\n');
  Logger.log(text);
  try { dst.toast(log.length - 1 + ' tab(s) checked - see View > Logs', preview ? 'Preview' : 'Refreshed', 8); } catch (e) { /* trigger run: no UI */ }
  if (NOTIFY_EMAIL && !preview) MailApp.sendEmail(NOTIFY_EMAIL, 'Daily refresh ' + label, text);
}

/* ---------- block finding (pure) ---------- */
// all dd-mm-yyyy / dd/mm/yyyy / dd.mm.yyyy dates inside a text
function datesIn_(text) {
  var out = [], re = /(\d{1,2})\s*[-\/.]\s*(\d{1,2})\s*[-\/.]\s*(\d{4})/g, m;
  while ((m = re.exec(String(text))) !== null) out.push({ d: +m[1], m: +m[2], y: +m[3] });
  return out;
}

// A title row = text with a date in column A and nothing in the other columns,
// e.g. "TXR EXAMINATION PARTICULARS AS ON-03-10-2026" or "MIXED SPL DATA OF-04/04/2026".
function isTitleRow_(row) {
  var a = row[0];
  if (a === null || a === undefined || a === '' || a instanceof Date || typeof a === 'number') return false;
  if (!datesIn_(a).length) return false;
  for (var c = 1; c < row.length; c++) if (String(row[c]).trim() !== '') return false;
  return true;
}

function rowEmpty_(row) {
  for (var c = 0; c < row.length; c++) if (String(row[c]).trim() !== '') return false;
  return true;
}

// Returns {start, end} (0-based, inclusive) of the LAST block whose title carries the date, or null.
function findBlock_(values, y, mo, d) {
  var titles = [];
  for (var r = 0; r < values.length; r++) if (isTitleRow_(values[r])) titles.push(r);
  var pick = -1;
  for (var i = 0; i < titles.length; i++) {
    var ds = datesIn_(values[titles[i]][0]);
    for (var k = 0; k < ds.length; k++) if (ds[k].y === y && ds[k].m === mo && ds[k].d === d) pick = i;
  }
  if (pick < 0) return null;
  var start = titles[pick];
  var end = (pick + 1 < titles.length ? titles[pick + 1] : values.length) - 1;
  while (end > start && rowEmpty_(values[end])) end--;
  return { start: start, end: end };
}

/* ---------- copy ---------- */
function copyBlock_(ssh, r1, r2, dsh) {
  var nRows = r2 - r1 + 1, nCols = Math.max(ssh.getLastColumn(), 1);
  var rng = ssh.getRange(r1, 1, nRows, nCols);

  dsh.clear();                                            // contents + formats
  var merged = dsh.getRange(1, 1, dsh.getMaxRows(), dsh.getMaxColumns()).getMergedRanges();
  merged.forEach(function (m) { m.breakApart(); });
  if (dsh.getMaxRows() < nRows) dsh.insertRowsAfter(dsh.getMaxRows(), nRows - dsh.getMaxRows());
  if (dsh.getMaxColumns() < nCols) dsh.insertColumnsAfter(dsh.getMaxColumns(), nCols - dsh.getMaxColumns());

  var t = dsh.getRange(1, 1, nRows, nCols);
  t.setNumberFormats(rng.getNumberFormats());             // formats first, so text such as 03/27 stays text
  t.setValues(rng.getValues());
  t.setBackgrounds(rng.getBackgrounds());
  t.setFontColors(rng.getFontColors());
  t.setFontWeights(rng.getFontWeights());
  t.setFontStyles(rng.getFontStyles());
  t.setFontSizes(rng.getFontSizes());
  t.setHorizontalAlignments(rng.getHorizontalAlignments());
  t.setVerticalAlignments(rng.getVerticalAlignments());
  t.setWrapStrategies(rng.getWrapStrategies());

  rng.getMergedRanges().forEach(function (m) {
    dsh.getRange(m.getRow() - r1 + 1, m.getColumn(), m.getNumRows(), m.getNumColumns()).merge();
  });
  for (var c = 1; c <= nCols; c++) dsh.setColumnWidth(c, ssh.getColumnWidth(c));
  if (nRows <= 300) for (var r = 0; r < nRows; r++) dsh.setRowHeight(r + 1, ssh.getRowHeight(r1 + r));
}
