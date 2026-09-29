// September 2026 muster, copied from the "MUSTER TI GOODS" sheet (SEP-2026 tab).
// Ravi left, so his column is not loaded. Narendra's duties come from the sheet's "NARENDAR" column.
// Columns: day | raghav | mahesh | vishnu | narendra | teja | subbareddy | remark   ("-" = empty)
const ROWS = `
01|00/07|07/13 21/04|REST|-|REST|07/13 21/04|
02|13/21|00/07|LEAVE|-|07/13|00/07|
03|07/13 21/04|13/21|LEAVE|-|21/24|13/21|
04|00/07|08/20|LEAVE|18/24|00/07|21/04|
05|LEAVE|07/13 21/04|13/21|00/07 20/24|07/13|00/07|
06|07/13 21/04|00/07|13/21|00/07|21/24|07/13 21/04|
07|00/07|REST|07/13 21/04|-|00/07|00/07|
08|REST|13/21|00/07|-|13/21|13/21|
09|LEAVE|07/13 21/04|13/21|-|07/13|07/13 21/04|
10|LEAVE|00/07|07/13 21/04|-|21/24|00/07|
11|13/21|LEAVE|00/07|-|00/07|13/21|
12|07/13|13/21|20/24|-|REST|07/13 21/04|Vishnu Adjustment for cancel Rest
13|13/21|07/13 21/04|00/07|-|13/21|00/07|
14|07/13|00/07|13/21|-|07/13 21/24|-|Vinayaka Chavithi. Vishnu & Ravi Asking
15|07/13 21/00|REST|13/21|-|00/07|13/21|
16|00/07|13/21|07/13 21/00|-|REST|13/21|
17|REST|07/13 21/24|00/07|-|13/21|07/13 21/24|
18|13/21|00/07|REST|21/24|13/21|00/07|
19|20/24|13/21|07/13|00/07 21/24|07/15|13/21|Mahesh Asking
20|00/07|REST|07/13 21/24|00/07|07/13 21/24|13/21|Mahesh Asking
21|REST|13/21|00/07|REST|00/07|07/13 21/24|
22|07/15|13/21|20/24|07/15|13/21|00/07|Vishnu & Narendra Adjustment
23|07/13 21/24|13/21|00/07|20/24|07/15|REST|
24|00/07|07/13 21/24|REST|00/07 20/24|07/13 21/24|-|
25|LEAVE|00/07|13/21|00/07|00/07|-|
26|13/21|REST|07/13 21/24|REST|REST|-|
27|07/13 21/24|13/21|00/07|CR|07/13 21/24|-|
28|00/07|-|-|-|00/07|-|
`;

const PEOPLE = ["raghav", "mahesh", "vishnu", "narendra", "teja", "subbareddy"];

export function seedSep2026() {
  const entries: Record<string, Record<string, string>> = {};
  const remarks: Record<string, string> = {};
  for (const line of ROWS.trim().split("\n")) {
    const [day, ...cells] = line.split("|");
    const date = `2026-09-${day}`;
    entries[date] = {};
    PEOPLE.forEach((p, i) => {
      if (cells[i] && cells[i] !== "-") entries[date][p] = cells[i];
    });
    if (cells[6]) remarks[date] = cells[6];
  }
  return { entries, remarks, requests: [] };
}
