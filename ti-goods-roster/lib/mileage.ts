import "server-only";
import ExcelJS from "exceljs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadMonth } from "./store";

export const KMS_PER_DUTY_DAY = 120;

type Part = { from: number; to: number };

// "07/13 21/24" -> [{7,13},{21,24}]. Anything that is not a time pair (REST, LEAVE, blank) -> [].
// A duty that runs past midnight is the night duty 21/24; the 00/07 that follows is its own entry.
function parts(code: string): Part[] {
  return code.trim().split(/\s+/).flatMap((t) => {
    const m = t.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (!m) return [];
    const from = +m[1], to = +m[2];
    return [{ from, to: to <= from && from >= 18 ? 24 : to }];
  });
}

// NDA hours are the hours worked between 22:00 and 06:00: 21/24 -> 2, 00/07 -> 6.
function nightHours({ from, to }: Part): number {
  const segs: [number, number][] = to > from ? [[from, to]] : [[from, 24], [0, to]];
  const overlap = (a: number, b: number, c: number, d: number) => Math.max(0, Math.min(b, d) - Math.max(a, c));
  return segs.reduce((s, [a, b]) => s + overlap(a, b, 0, 6) + overlap(a, b, 22, 24), 0);
}

export type Day = { date: string; code: string; c: string; d: string; kms: number | null; nda: number | null; leave: boolean };

export function dayRow(date: string, raw: string): Day {
  const code = raw.trim().toUpperCase();
  const p = parts(code);
  const base = { date, code, kms: null, nda: null, leave: false };
  if (code === "REST" || code === "CR") return { ...base, c: code, d: code };
  if (code === "LEAVE") return { ...base, c: "LAP", d: "LAP", leave: true };
  if (!p.length) return { ...base, c: "", d: "" };
  const two = (n: number) => String(n).padStart(2, "0");
  const t = p.map((x) => `${two(x.from)}/${two(x.to)}`);
  const [c, d] = t.length > 1 ? [t[0], t[1]] : [two(p[0].from), two(p[0].to)];
  const nda = p.reduce((s, x) => s + nightHours(x), 0);
  return { ...base, c, d, kms: KMS_PER_DUTY_DAY, nda: nda || null };
}

// Fills the blank statement of work done / kilometerage sheet for one person and month.
export async function buildMileage(month: string, personId: string, personName: string): Promise<Buffer> {
  const [y, mo] = month.split("-").map(Number);
  const count = new Date(y, mo, 0).getDate();
  const data = await loadMonth(month);
  const rows = Array.from({ length: count }, (_, i) => {
    const date = `${month}-${String(i + 1).padStart(2, "0")}`;
    return dayRow(date, data.entries[date]?.[personId] ?? "");
  });

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load((await readFile(path.join(process.cwd(), "assets", "mileage-template.xlsx"))) as unknown as ExcelJS.Buffer);
  const ws = wb.worksheets[0];
  ws.name = `${personName} ${month}`.slice(0, 31);

  // 22 days in the first block (rows 5-26), the rest in the second block from row 30.
  rows.forEach((r, i) => {
    const row = i < 22 ? 5 + i : 30 + (i - 22);
    const [Y, M, D] = r.date.split("-").map(Number);
    ws.getCell(row, 2).value = new Date(Date.UTC(Y, M - 1, D));
    ws.getCell(row, 2).numFmt = "dd-mm-yyyy";
    for (const [col, v] of [[4, r.c], [5, r.d]] as const) {
      if (!v) continue;
      const cell = ws.getCell(row, col);
      cell.value = v;
      cell.font = { ...cell.font, bold: true };
    }
    if (r.kms) ws.getCell(row, 15).value = r.kms;
    if (r.nda) ws.getCell(row, 16).value = r.nda;
  });

  const totalKms = rows.reduce((s, r) => s + (r.kms ?? 0), 0);
  const totalNda = rows.reduce((s, r) => s + (r.nda ?? 0), 0);
  const workDays = rows.filter((r) => r.kms).length;
  const leave = rows.filter((r) => r.leave).length;
  ws.getCell("O39").value = totalKms;
  ws.getCell("P39").value = totalNda;
  ws.getCell("O40").value = `${totalKms} OR ${workDays} ALKS`;
  ws.getCell("O40").font = { ...ws.getCell("O40").font, bold: true, size: 20 };
  ws.getRow(40).height = 32;
  ws.getCell("O41").value = "-";
  ws.getCell("O42").value = `${totalNda} HRS`;
  ws.getCell("O43").value = leave ? `${leave} LAP` : "-";

  return Buffer.from(await wb.xlsx.writeBuffer());
}
