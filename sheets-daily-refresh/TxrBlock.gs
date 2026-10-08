/**
 * TXR POSITION - new daily block.   (add this as a SECOND FILE in the same Apps Script project as MasterCode.gs)
 *
 * Reads the LAST block of the tab "TXR POSITION" (title: TXR EXAMINATION PARTICULARS AS ON-dd-mm-yyyy) and writes
 * the next one below it, with the new date:
 *   - every depot table (BPA, RDM, SNF, DKJ, SEM, CT, KZJ ...) gets its header row again;
 *   - trains that are still there are carried over: a train whose DEP column shows a departure time (07-10 17:25)
 *     or BROKEN has gone and is dropped; DEP = TO LEAVE / SHG DUE / F/EOT / empty = still there, so it stays;
 *   - CUM NO is renumbered (rows marked * keep the star), SL NO runs 1,2,3...;
 *   - empty lines for the new day are added (DATE = new date, DPT = depot, LINE NO = STN for SEM/CT/KZJ);
 *   - the totals row of each table is rebuilt for the new rows.
 * Existing rows are never changed.
 */

var TXR_TAB = 'TXR POSITION';
var TXR_TITLE = 'TXR EXAMINATION PARTICULARS AS ON';
var TXR_DAY_OFFSET = 0;          // date of the new block: 0 = today, 1 = tomorrow
var TXR_GAP_ROWS = 2;            // blank rows between two days
var TXR_BLANK_ROWS = { BPA: 4, RDM: 6, SNF: 4, DKJ: 4, SEM: 2, CT: 1, KZJ: 2 };   // empty lines added per depot
var TXR_DEFAULT_BLANK = 3;       // for a depot not in the list above
var TXR_BLANK_LINE_NO = { SEM: 'STN', CT: 'STN', KZJ: 'STN' };                     // LINE NO written in the empty lines

function menuCreateTxr() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.alert('TXR POSITION', 'Add the new TXR block (new date, trains still present carried over) below the last block?', ui.ButtonSet.YES_NO);
  if (r === ui.Button.YES) createTxrBlock();
}

function createTxrBlock() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(TXR_TAB);
  var ui = SpreadsheetApp.getUi();
  if (!sh) { ui.alert('Tab "' + TXR_TAB + '" not found'); return; }

  var lastRow = sh.getLastRow(), nCols = Math.max(sh.getLastColumn(), 1);
  var values = sh.getRange(1, 1, lastRow, nCols).getValues();
  var day = new Date();
  day.setDate(day.getDate() + TXR_DAY_OFFSET);
  var plan = planTxr_(values, day);
  if (plan.error) { ui.alert(plan.error); return; }

  var p = lastRow + 1 + TXR_GAP_ROWS;
  var need = p + plan.rowCount - 1;
  if (sh.getMaxRows() < need) sh.insertRowsAfter(sh.getMaxRows(), need - sh.getMaxRows());

  function copyRow(src0, dst) { sh.getRange(src0 + 1, 1, 1, nCols).copyTo(sh.getRange(dst, 1, 1, nCols)); }

  // title
  copyRow(plan.titleRow, p);
  sh.getRange(p, 1).setValue(plan.newTitle);
  p++;

  var log = [plan.newTitle];
  plan.tables.forEach(function (t) {
    copyRow(t.hdrRow, p); p++;
    var first = p;

    t.carried.forEach(function (c, i) {
      copyRow(c.row, p);
      if (c.cum !== '*') sh.getRange(p, t.cols.cum + 1).setValue(c.cum);
      sh.getRange(p, t.cols.sl + 1).setValue(i + 1);
      p++;
    });

    t.blanks.forEach(function (b) {
      copyRow(t.templateRow, p);
      var rg = sh.getRange(p, 1, 1, nCols);
      var f = rg.getFormulas()[0];
      rg.setValues([f.map(function (x) { return x ? x : ''; })]);          // keep formulas, clear typed values
      sh.getRange(p, t.cols.cum + 1).setValue(b.cum);
      sh.getRange(p, t.cols.sl + 1).setValue(b.sl);
      sh.getRange(p, t.cols.date + 1).setValue(new Date(day.getFullYear(), day.getMonth(), day.getDate()));
      sh.getRange(p, t.cols.dpt + 1).setValue(t.depot);
      if (b.line) sh.getRange(p, t.cols.line + 1).setValue(b.line);
      p++;
    });
    var last = p - 1;

    if (t.totalRow !== null) {
      copyRow(t.totalRow, p);
      var tr = sh.getRange(p, 1, 1, nCols);
      var fm = tr.getFormulas()[0], vals = tr.getValues()[0];
      var out = fm.map(function (x, j) {
        var m = x && x.match(/^=\s*(SUM|AVERAGE)\s*\(/i);
        if (m) return '=' + m[1].toUpperCase() + '(' + colLetter_(j + 1) + first + ':' + colLetter_(j + 1) + last + ')';
        return x ? x : vals[j];
      });
      tr.setValues([out]);
      p++;
    }
    log.push('- ' + t.depot + ': ' + t.carried.length + ' carried, ' + t.blanks.length + ' empty lines added');
  });

  var text = log.join('\n');
  Logger.log(text);
  ui.alert(text);
}

/* ---------- planning (pure: works on the values array, no sheet calls) ---------- */
function planTxr_(values, day) {
  var titles = [];
  for (var r = 0; r < values.length; r++) {
    if (String(values[r][0] === null || values[r][0] === undefined ? '' : values[r][0]).toUpperCase().indexOf(TXR_TITLE) > -1) titles.push(r);
  }
  if (!titles.length) return { error: 'No title "' + TXR_TITLE + '-dd-mm-yyyy" found in ' + TXR_TAB };

  for (var i = 0; i < titles.length; i++) {
    var ds = datesIn_(values[titles[i]][0]);
    for (var k = 0; k < ds.length; k++) {
      if (ds[k].y === day.getFullYear() && ds[k].m === day.getMonth() + 1 && ds[k].d === day.getDate()) {
        return { error: 'A block for ' + p2_(day.getDate()) + '-' + p2_(day.getMonth() + 1) + '-' + day.getFullYear() + ' already exists - nothing added.' };
      }
    }
  }

  var titleRow = titles[titles.length - 1];
  var plan = { titleRow: titleRow, newTitle: newTitle_(String(values[titleRow][0]), day), tables: [], rowCount: 1 };

  // split the last block into tables: header row ("CUM NO") ... up to the next header
  var hdrs = [];
  for (var q = titleRow + 1; q < values.length; q++) if (String(values[q][0]).trim().toUpperCase() === 'CUM NO') hdrs.push(q);
  for (var h = 0; h < hdrs.length; h++) {
    var from = hdrs[h], to = (h + 1 < hdrs.length ? hdrs[h + 1] : values.length) - 1;
    var cols = headerCols_(values[from]);
    if (cols.dpt < 0 || cols.tr < 0) continue;

    var data = [];
    for (var x = from + 1; x <= to; x++) if (String(values[x][cols.dpt]).trim() !== '') data.push(x);
    var totalRow = (to > from && String(values[to][cols.dpt]).trim() === '') ? to : null;
    if (!data.length) continue;

    var depot = String(values[data[0]][cols.dpt]).trim().toUpperCase();
    var filled = data.filter(function (row) { return String(values[row][cols.tr]).trim() !== ''; });

    var lastFilled = 0;
    filled.forEach(function (row) { var n = cumNum_(values[row][cols.cum]); if (n !== null && n > lastFilled) lastFilled = n; });
    if (!lastFilled) data.forEach(function (row) { var n = cumNum_(values[row][cols.cum]); if (n !== null && n > lastFilled) lastFilled = n; });

    var kept = filled.filter(function (row) { return keepTxrRow_(cols.dep >= 0 ? values[row][cols.dep] : ''); });
    var nNum = kept.filter(function (row) { return cumNum_(values[row][cols.cum]) !== null; }).length;
    var n = 0;
    var carried = kept.map(function (row) {
      if (cumNum_(values[row][cols.cum]) === null) return { row: row, cum: '*' };
      n++;
      return { row: row, cum: lastFilled - nNum + n };
    });

    var nBlank = TXR_BLANK_ROWS.hasOwnProperty(depot) ? TXR_BLANK_ROWS[depot] : TXR_DEFAULT_BLANK;
    var blanks = [];
    for (var b = 0; b < nBlank; b++) blanks.push({ cum: lastFilled + 1 + b, sl: carried.length + b + 1, line: TXR_BLANK_LINE_NO[depot] || '' });

    plan.tables.push({ depot: depot, hdrRow: from, cols: cols, carried: carried, blanks: blanks, templateRow: data[data.length - 1], totalRow: totalRow });
    plan.rowCount += 1 + carried.length + blanks.length + (totalRow !== null ? 1 : 0);
  }
  if (!plan.tables.length) return { error: 'No depot tables found in the last block.' };
  return plan;
}

// all dd-mm-yyyy dates inside a text
function datesIn_(text) {
  var out = [], re = /(\d{1,2})\s*[-\/.]\s*(\d{1,2})\s*[-\/.]\s*(\d{4})/g, m;
  while ((m = re.exec(String(text))) !== null) out.push({ d: +m[1], m: +m[2], y: +m[3] });
  return out;
}

function headerCols_(row) {
  var up = row.map(function (v) { return String(v === null || v === undefined ? '' : v).trim().toUpperCase(); });
  function at(names) { for (var i = 0; i < names.length; i++) { var k = up.indexOf(names[i]); if (k > -1) return k; } return -1; }
  return { cum: at(['CUM NO']), sl: at(['SL NO']), date: at(['DATE']), dpt: at(['DPT']), line: at(['LINE NO']), tr: at(['TR.NO', 'TR NO']), dep: at(['DEP']) };
}

function cumNum_(v) {
  if (v === '' || v === null || v === undefined || String(v).trim() === '*') return null;
  var n = Number(v);
  return isNaN(n) ? null : n;
}

// a train stays in the next block unless its DEP shows a departure time or BROKEN
function keepTxrRow_(dep) {
  if (dep instanceof Date) return false;
  var s = String(dep === null || dep === undefined ? '' : dep).trim();
  if (/^\d{1,2}[-\/]\d{1,2}\s+\d{1,2}:\d{2}/.test(s)) return false;
  if (s.toUpperCase() === 'BROKEN') return false;
  return true;
}

function colLetter_(n) {
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}
