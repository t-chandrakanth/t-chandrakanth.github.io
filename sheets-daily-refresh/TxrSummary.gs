/**
 * TXR SUMMARY () - new daily block.   (3rd file in the same Apps Script project as MasterCode.gs and TxrBlock.gs)
 *
 * Takes the LAST block of the tab (title: TXR EXAMINATION AS ON DATE -dd-mm-yyyy) and writes the next day's block
 * below it, leaving SUM_GAP_ROWS empty rows, with the same layout, merges, borders and formulas:
 *   - new date in the title;
 *   - TARGET stays;
 *   - TOTAL CHECKED / CC / PREM / INTEN of the day, WAGONS DETACHED and REMARKS are emptied;
 *   - the first CUMM group (CC, PM, INTEN, TOTAL) is carried over as it is;
 *   - the second CUMM group (till previous day) becomes yesterday's first CUMM group;
 *   - SICK LINE PERFORMANCE: OB = yesterday's CB; FRESH, TOTAL, MADE FIT, CB and the wagon counts on the right are emptied.
 * Cells that hold formulas keep their formulas. Existing rows are never changed.
 */

var SUM_TAB = 'TXR SUMMARY ()';          // tab name; the name is matched ignoring spaces and capitals
var SUM_TITLE = 'TXR EXAMINATION AS ON DATE';
var SUM_DAY_OFFSET = 0;                  // 0 = today, 1 = tomorrow
var SUM_GAP_ROWS = 2;                    // empty rows between two days

function menuCreateSummary() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.alert('TXR SUMMARY', 'Add the new TXR SUMMARY block (new date, cumulative carried over) below the last block?', ui.ButtonSet.YES_NO);
  if (r === ui.Button.YES) createSummaryBlock();
}

function createSummaryBlock() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var want = String(SUM_TAB).replace(/\s+/g, '').toUpperCase(), sh = null;
  ss.getSheets().forEach(function (s) { if (!sh && s.getName().replace(/\s+/g, '').toUpperCase() === want) sh = s; });
  if (!sh) { ui.alert('Tab "' + SUM_TAB + '" not found'); return; }

  var lastRow = sh.getLastRow(), nCols = Math.max(sh.getLastColumn(), 1);
  var all = sh.getRange(1, 1, lastRow, nCols);
  var values = all.getValues(), formulas = all.getFormulas();
  var day = new Date();
  day.setDate(day.getDate() + SUM_DAY_OFFSET);

  var plan = planSummary_(values, formulas, day);
  if (plan.error) { ui.alert(plan.error); return; }

  var start = lastRow + 1 + SUM_GAP_ROWS;
  var need = start + plan.nRows - 1;
  if (sh.getMaxRows() < need) sh.insertRowsAfter(sh.getMaxRows(), need - sh.getMaxRows());

  sh.getRange(plan.titleRow + 1, 1, plan.nRows, nCols).copyTo(sh.getRange(start, 1, plan.nRows, nCols));

  function cell(r, c) { return sh.getRange(start + r, c + 1); }
  var clears = plan.clears.map(function (x) { return cell(x[0], x[1]).getA1Notation(); });
  if (clears.length) sh.getRangeList(clears).clearContent();
  plan.sets.forEach(function (x) { cell(x[0], x[1]).setValue(x[2]); });
  if (plan.title.value !== null) cell(plan.title.r, plan.title.c).setValue(plan.title.value);

  var text = plan.newTitle + ' added at row ' + start + '\n' + plan.info.join('\n');
  Logger.log(text);
  ui.alert(text);
}

/* ---------- planning (pure: works on arrays only) ---------- */
// Returns offsets relative to the first row of the block: titleRow (0-based in the sheet), nRows,
// clears [[r,c]...], sets [[r,c,value]...], title {r,c,value}.
function planSummary_(values, formulas, day) {
  var T = SUM_TITLE.toUpperCase();
  var titles = [];
  for (var r = 0; r < values.length; r++) for (var c = 0; c < values[r].length; c++) {
    if (String(values[r][c]).toUpperCase().indexOf(T) > -1) { titles.push([r, c]); break; }
  }
  if (!titles.length) return { error: 'No title "' + SUM_TITLE + ' -dd-mm-yyyy" found in ' + SUM_TAB };
  for (var i = 0; i < titles.length; i++) {
    var ds = datesIn_(values[titles[i][0]][titles[i][1]]);
    for (var k = 0; k < ds.length; k++) if (ds[k].y === day.getFullYear() && ds[k].m === day.getMonth() + 1 && ds[k].d === day.getDate()) {
      return { error: 'A block for ' + p2_(day.getDate()) + '-' + p2_(day.getMonth() + 1) + '-' + day.getFullYear() + ' already exists - nothing added.' };
    }
  }

  var tr = titles[titles.length - 1][0], tc = titles[titles.length - 1][1];
  var nRows = values.length - tr;
  var nCols = values[0].length;
  var B = values.slice(tr), F = formulas.slice(tr);                  // the block
  function isConst(r, c) { return !F[r][c]; }
  function up(v) { return String(v === null || v === undefined ? '' : v).trim().toUpperCase(); }

  var raw = B[0][tc];
  var plan = { titleRow: tr, nRows: nRows, clears: [], sets: [], info: [], title: { r: 0, c: tc, value: null } };
  plan.newTitle = (raw instanceof Date) ? p2_(day.getDate()) + '-' + p2_(day.getMonth() + 1) + '-' + day.getFullYear() : newTitle_(String(raw), day);
  plan.title.value = (raw instanceof Date) ? new Date(day.getFullYear(), day.getMonth(), day.getDate()) : plan.newTitle;

  // where the sick line section starts
  var sickRow = nRows;
  for (var s = 1; s < nRows; s++) if (B[s].some(function (v) { return up(v).indexOf('SICK LINE') > -1; })) { sickRow = s; break; }

  // header rows = rows before the first wagon-type row (BOXN, JUMBO, ...)
  var firstData = 1;
  for (var h = 1; h < sickRow; h++) {
    if (B[h].some(function (v) { return /^(BOXN|JUMBO|LOADS|BOBR|C\/S)/.test(up(v)); })) { firstData = h; break; }
  }
  var cls = [];                                                       // per column: 'daily' | 'left' | 'right' | 'clear' | ''
  var cummN = 0, names = { daily: [], left: [], right: [], clear: [] };
  for (var c = 0; c < nCols; c++) {
    var t = '';
    for (var hr = 1; hr < firstData; hr++) t += ' ' + up(B[hr][c]);
    t = t.trim();
    var k = '';
    if (t.indexOf('CUMM') > -1 || /^TOTAL CU/.test(t)) { k = cummN < 4 ? 'left' : 'right'; cummN++; }
    else if (t.indexOf('CHECKED') > -1) k = 'daily';
    else if (t.indexOf('WAGON') > -1 || t.indexOf('REMARK') > -1) k = 'clear';
    else if (cummN === 0 && (t === 'CC' || t === 'PREM' || t === 'INTEN')) k = 'daily';
    cls.push(k);
    if (k) names[k].push(colLetter_(c + 1) + '(' + t + ')');
  }
  var left = [], right = [];
  cls.forEach(function (k, c) { if (k === 'left') left.push(c); if (k === 'right') right.push(c); });
  plan.info.push('Daily columns emptied: ' + names.daily.join(', '));
  plan.info.push('Carried CUMM columns: ' + names.left.join(', '));
  plan.info.push('Previous-day CUMM columns (= yesterday\'s CUMM): ' + names.right.join(', '));
  plan.info.push('Emptied (wagons detached / remarks): ' + names.clear.join(', '));

  for (var rr = firstData; rr < sickRow; rr++) {
    for (var cc = 0; cc < nCols; cc++) {
      var kind = cls[cc];
      if (kind === 'daily' || kind === 'clear') { if (isConst(rr, cc) && up(B[rr][cc]) !== '') plan.clears.push([rr, cc]); }
    }
    right.forEach(function (rc, i) {
      var lc = left[i];
      if (lc === undefined) return;
      var v = B[rr][lc];
      if (up(v) === '' && up(B[rr][rc]) === '') return;
      plan.sets.push([rr, rc, v === '' ? '' : v]);
    });
  }

  // SICK LINE PERFORMANCE
  if (sickRow < nRows) {
    var hdr = -1;
    for (var q = sickRow + 1; q < nRows; q++) if (B[q].some(function (v) { return up(v) === 'OB'; })) { hdr = q; break; }
    if (hdr > -1) {
      var col = {};
      B[hdr].forEach(function (v, c) { var u = up(v); if (['OB', 'FRESH', 'TOTAL', 'MADE FIT', 'CB'].indexOf(u) > -1 && col[u] === undefined) col[u] = c; });
      if (col.OB !== undefined && col.CB !== undefined) {
        for (var d = hdr + 1; d < nRows; d++) {
          var any = B[d].some(function (v) { return up(v) !== ''; });
          if (!any) continue;
          var cb = B[d][col.CB];
          plan.sets.push([d, col.OB, cb === '' ? '' : cb]);
          ['FRESH', 'TOTAL', 'MADE FIT', 'CB'].forEach(function (n) {
            if (col[n] !== undefined && isConst(d, col[n]) && up(B[d][col[n]]) !== '') plan.clears.push([d, col[n]]);
          });
        }
        for (var d2 = hdr; d2 < nRows; d2++) {                       // wagon counts on the right of the table
          for (var c2 = col.CB + 1; c2 < nCols; c2++) {
            var s2 = up(B[d2][c2]);
            if (d2 > hdr - 1 && s2 !== '' && isConst(d2, c2) && (/^-?\d+(\.\d+)?$/.test(s2) || /^\d+\s*=/.test(s2))) plan.clears.push([d2, c2]);
          }
        }
        plan.info.push('Sick line: OB = yesterday\'s CB; FRESH, TOTAL, MADE FIT, CB and wagon counts emptied');
      } else plan.info.push('Sick line table not recognised (headings OB / CB) - left as copied');
    }
  }
  return plan;
}
