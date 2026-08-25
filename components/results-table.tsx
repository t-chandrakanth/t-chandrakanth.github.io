import type { ResultsTable as ResultsTableData } from "@/content/publications";
import { Kicker } from "./primitives";

/**
 * Results tables are set in mono with tabular figures and a hairline rule
 * system, so a reader can compare a column down the page. The winning row is
 * marked rather than coloured in, because these are claims, not a scoreboard.
 */
export function ResultsTable({ data, n }: { data: ResultsTableData; n?: number }) {
  return (
    <figure className="my-10">
      <figcaption className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-rule-strong pt-3">
        {n !== undefined ? (
          <Kicker as="span" className="text-ink-faint tabular-nums">
            Table {String(n).padStart(2, "0")}
          </Kicker>
        ) : null}
        <span className="text-ink-muted text-[0.95rem] leading-snug">{data.caption}</span>
      </figcaption>

      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[34rem] border-collapse font-mono text-[0.8125rem] tabular-nums">
          <thead>
            <tr>
              {data.columns.map((c, i) => (
                <th
                  key={c + i}
                  scope="col"
                  className={`font-kicker text-ink-muted border-b border-rule-strong pb-2 pr-4 align-bottom font-medium ${
                    i === 0 ? "text-left" : "text-right"
                  }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr
                key={row.label + ri}
                className={row.highlight ? "bg-accent-wash" : undefined}
              >
                <th
                  scope="row"
                  className={`border-b border-rule py-2.5 pr-4 text-left font-normal ${
                    row.highlight ? "text-accent" : "text-ink-muted"
                  }`}
                >
                  {row.label}
                </th>
                {row.values.map((v, vi) => (
                  <td
                    key={vi}
                    className={`border-b border-rule py-2.5 pr-4 text-right ${
                      row.highlight ? "text-ink font-medium" : "text-ink-muted"
                    }`}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.note ? (
        <p className="font-kicker text-ink-faint mt-3 leading-relaxed normal-case tracking-normal [font-size:0.75rem]">
          {data.note}
        </p>
      ) : null}
    </figure>
  );
}
