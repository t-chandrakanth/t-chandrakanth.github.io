/**
 * The site's one large graphic: two ledgers and the ties between them.
 *
 * Five clean correspondences, one split (a single debit answered by two
 * credits), one item with no counterpart. That asymmetry is the argument —
 * reconciliation is not a bijection, and the interesting mass sits in the
 * cases that are not.
 *
 * Both columns are left-aligned at the tie line so every endpoint meets a
 * record rather than floating in the gutter. Pure CSS animation, no JS, and it
 * degrades to a static figure under prefers-reduced-motion.
 */

const ROW_H = 38;
const TOP = 26;

const LEFT_W = [74, 92, 62, 84, 70, 96, 66];
const RIGHT_W = [68, 88, 58, 52, 50, 80, 72];

const LX = 112; // where left ties leave the page
const RX = 246; // where right ties arrive
const L_ORIGIN = 22;
const R_ORIGIN = 252;

const rowY = (i: number) => TOP + i * ROW_H;

/** [leftIndex, rightIndex, kind] */
const TIES: [number, number, "match" | "split"][] = [
  [0, 0, "match"],
  [1, 1, "match"],
  [2, 2, "match"],
  [3, 3, "split"],
  [3, 4, "split"],
  [5, 5, "match"],
  [6, 6, "match"],
];

const UNMATCHED = 4;

export function HeroFigure({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 306"
      className={className}
      role="img"
      aria-label="Two ledgers joined by correspondence ties: five clean matches, one payment split across two credits, and one item with no counterpart."
    >
      <defs>
        <style>{`
          @keyframes tie-draw { to { stroke-dashoffset: 0; } }
          @keyframes node-in { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: none; } }
          @keyframes row-in { from { opacity: 0; transform: translateX(var(--dx)); } to { opacity: 1; transform: none; } }
          @keyframes pulse-soft { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
          .hf-row { animation: row-in 700ms cubic-bezier(.22,1,.36,1) both; }
          .hf-tie { stroke-dasharray: 200; stroke-dashoffset: 200; animation: tie-draw 1000ms cubic-bezier(.65,0,.35,1) both; }
          .hf-node { transform-box: fill-box; transform-origin: center; animation: node-in 460ms cubic-bezier(.34,1.56,.64,1) both; }
          .hf-open { animation: pulse-soft 3.4s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .hf-row, .hf-tie, .hf-node, .hf-open {
              animation: none !important;
              stroke-dashoffset: 0 !important;
              opacity: 1 !important;
              transform: none !important;
            }
          }
        `}</style>
      </defs>

      <g stroke="var(--rule)" strokeWidth="1">
        <path d="M18 14v280" />
        <path d="M344 14v280" />
      </g>

      <g
        fontFamily="var(--font-mono)"
        fontSize="7.5"
        letterSpacing="1.4"
        fill="var(--ink-faint)"
      >
        <text x="18" y="9">SOURCE A</text>
        <text x="344" y="9" textAnchor="end">SOURCE B</text>
      </g>

      {LEFT_W.map((w, i) => (
        <g
          key={`l${i}`}
          className="hf-row"
          style={{ ["--dx" as string]: "-10px", animationDelay: `${i * 55}ms` }}
        >
          <rect x={L_ORIGIN} y={rowY(i)} width={w} height={9} fill="var(--rule-strong)" opacity="0.55" />
          <rect x={L_ORIGIN} y={rowY(i) + 13} width={w * 0.5} height={4} fill="var(--rule)" />
        </g>
      ))}

      {RIGHT_W.map((w, i) => (
        <g
          key={`r${i}`}
          className="hf-row"
          style={{ ["--dx" as string]: "10px", animationDelay: `${180 + i * 55}ms` }}
        >
          <rect x={R_ORIGIN} y={rowY(i)} width={w} height={9} fill="var(--rule-strong)" opacity="0.55" />
          <rect x={R_ORIGIN} y={rowY(i) + 13} width={w * 0.5} height={4} fill="var(--rule)" />
        </g>
      ))}

      {TIES.map(([li, ri, kind], i) => {
        const y1 = rowY(li) + 4.5;
        const y2 = rowY(ri) + 4.5;
        const mid = (LX + RX) / 2;
        return (
          <path
            key={`t${i}`}
            className="hf-tie"
            d={`M${LX} ${y1} C${mid} ${y1}, ${mid} ${y2}, ${RX} ${y2}`}
            fill="none"
            stroke={kind === "split" ? "var(--pending)" : "var(--accent)"}
            strokeWidth={kind === "split" ? 1 : 1.3}
            style={{ animationDelay: `${620 + i * 120}ms` }}
          />
        );
      })}

      {TIES.map(([li, ri], i) => (
        <g key={`n${i}`}>
          <circle
            className="hf-node"
            cx={LX}
            cy={rowY(li) + 4.5}
            r="2.4"
            fill="var(--accent)"
            style={{ animationDelay: `${760 + i * 120}ms` }}
          />
          <circle
            className="hf-node"
            cx={RX}
            cy={rowY(ri) + 4.5}
            r="2.4"
            fill="var(--accent)"
            style={{ animationDelay: `${860 + i * 120}ms` }}
          />
        </g>
      ))}

      {/* the split, labelled above its own origin so it clears the tie above */}
      <text
        x={LX + 9}
        y={rowY(3) - 5}
        fontFamily="var(--font-mono)"
        fontSize="7"
        letterSpacing="1.3"
        fill="var(--pending)"
      >
        SPLIT 1:2
      </text>

      {/* the unmatched item — the whole point of the picture */}
      <g className="hf-open">
        <circle
          cx={LX}
          cy={rowY(UNMATCHED) + 4.5}
          r="3.6"
          fill="var(--paper)"
          stroke="var(--variance)"
          strokeWidth="1.2"
        />
        <path
          d={`M${LX + 7} ${rowY(UNMATCHED) + 4.5}h34`}
          stroke="var(--variance)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <text
          x={LX + 9}
          y={rowY(UNMATCHED) + 21}
          fontFamily="var(--font-mono)"
          fontSize="7"
          letterSpacing="1.3"
          fill="var(--variance)"
        >
          NO COUNTERPART
        </text>
      </g>
    </svg>
  );
}
