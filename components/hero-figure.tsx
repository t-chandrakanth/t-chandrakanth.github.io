/**
 * The site's one large graphic: an agent control loop.
 *
 * Plan, act, observe, verify — and the branch that matters is the one that
 * fails the gate. Passing work leaves the loop and commits; failing work stays
 * inside it and goes round again. What an agent does when it is wrong is the
 * whole design, so that is what the picture is of.
 *
 * Pure CSS animation, no JS, and it degrades to a static figure under
 * prefers-reduced-motion.
 */

const L = 80;   // loop left
const R = 280;  // loop right
const T = 72;   // loop top
const B = 232;  // loop bottom
const MX = (L + R) / 2;
const MY = (T + B) / 2;

const STATIONS: { x: number; y: number; label: string; anchor: "middle" | "start" | "end"; lx: number; ly: number }[] = [
  { x: MX, y: T, label: "PLAN", anchor: "middle", lx: MX, ly: T - 14 },
  { x: R, y: MY, label: "ACT", anchor: "start", lx: R + 10, ly: MY - 4 },
  { x: MX, y: B, label: "OBSERVE", anchor: "middle", lx: MX, ly: B + 20 },
  { x: L, y: MY, label: "VERIFY", anchor: "end", lx: L - 10, ly: MY - 4 },
];

/** Clockwise direction markers, one per quadrant. */
const ARROWS = [
  { x: 236, y: 90, r: 42 },
  { x: 236, y: 214, r: 138 },
  { x: 124, y: 214, r: 222 },
  { x: 124, y: 90, r: 318 },
];

export function HeroFigure({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 300"
      className={className}
      role="img"
      aria-label="An agent control loop: plan, act, observe, verify. Work that passes the verification gate leaves the loop and commits; work that fails it stays inside and is retried."
    >
      <defs>
        <style>{`
          @keyframes loop-draw { to { stroke-dashoffset: 0; } }
          @keyframes node-in { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: none; } }
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes travel { to { stroke-dashoffset: -740; } }
          @keyframes gate-pulse { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
          .cl-loop { stroke-dasharray: 740; stroke-dashoffset: 740; animation: loop-draw 1400ms cubic-bezier(.65,0,.35,1) both; }
          .cl-run { stroke-dasharray: 26 714; stroke-dashoffset: 0; animation: travel 5.5s linear infinite; animation-delay: 1500ms; }
          .cl-node { transform-box: fill-box; transform-origin: center; animation: node-in 460ms cubic-bezier(.34,1.56,.64,1) both; }
          .cl-fade { animation: fade-in 620ms ease both; }
          .cl-gate { animation: gate-pulse 3.2s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .cl-loop, .cl-run, .cl-node, .cl-fade, .cl-gate {
              animation: none !important;
              stroke-dashoffset: 0 !important;
              stroke-dasharray: none !important;
              opacity: 1 !important;
              transform: none !important;
            }
          }
        `}</style>
      </defs>

      {/* context feeding plan */}
      <g className="cl-fade" style={{ animationDelay: "900ms" }}>
        <rect x={MX - 34} y={38} width={68} height={5} fill="var(--rule-strong)" opacity="0.6" />
        <rect x={MX - 34} y={46} width={40} height={3} fill="var(--rule)" />
        <path d={`M${MX} ${54}v${T - 58}`} stroke="var(--ink-faint)" strokeWidth="1" strokeDasharray="2 3" />
        <text
          x={MX}
          y={30}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="7.5"
          letterSpacing="1.4"
          fill="var(--ink-faint)"
        >
          CONTEXT
        </text>
      </g>

      {/* the loop */}
      <rect
        className="cl-loop"
        x={L}
        y={T}
        width={R - L}
        height={B - T}
        rx="34"
        fill="none"
        stroke="var(--rule-strong)"
        strokeWidth="1.25"
      />
      {/* a unit of work travelling the loop */}
      <rect
        className="cl-run"
        x={L}
        y={T}
        width={R - L}
        height={B - T}
        rx="34"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {ARROWS.map((a, i) => (
        <path
          key={i}
          className="cl-fade"
          style={{ animationDelay: `${1500 + i * 90}ms` }}
          d="M-4 -3.4 L3.6 0 L-4 3.4 Z"
          transform={`translate(${a.x} ${a.y}) rotate(${a.r})`}
          fill="var(--rule-strong)"
        />
      ))}

      {STATIONS.map((st, i) => (
        <g key={st.label}>
          <circle
            className="cl-node"
            cx={st.x}
            cy={st.y}
            r="4.5"
            fill="var(--paper)"
            stroke="var(--accent)"
            strokeWidth="1.6"
            style={{ animationDelay: `${1000 + i * 130}ms` }}
          />
          <text
            className="cl-fade"
            style={{ animationDelay: `${1080 + i * 130}ms` }}
            x={st.lx}
            y={st.ly}
            textAnchor={st.anchor}
            fontFamily="var(--font-mono)"
            fontSize="8.5"
            letterSpacing="1.5"
            fill="var(--ink-muted)"
          >
            {st.label}
          </text>
        </g>
      ))}

      {/* tool surface hanging off ACT */}
      <g className="cl-fade" style={{ animationDelay: "1700ms" }}>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={R + 10} y={MY + 12 + i * 9} width={26 - i * 5} height={3.5} fill="var(--rule-strong)" opacity="0.7" />
        ))}
        <text
          x={R + 10}
          y={MY + 52}
          fontFamily="var(--font-mono)"
          fontSize="7.5"
          letterSpacing="1.4"
          fill="var(--ink-faint)"
        >
          TOOLS
        </text>
      </g>

      {/* the gate at VERIFY: pass leaves the loop, fail goes round again */}
      <g className="cl-gate">
        <rect x={L - 7} y={MY - 7} width={14} height={14} fill="none" stroke="var(--verified)" strokeWidth="1.2" />
      </g>

      <g className="cl-fade" style={{ animationDelay: "1900ms" }}>
        <path
          d={`M${L - 9} ${MY + 6} L34 ${MY + 34}`}
          stroke="var(--verified)"
          strokeWidth="1.3"
          fill="none"
        />
        <path d="M-4 -3.4 L3.6 0 L-4 3.4 Z" transform={`translate(34 ${MY + 34}) rotate(150)`} fill="var(--verified)" />
        <text
          x={22}
          y={MY + 50}
          fontFamily="var(--font-mono)"
          fontSize="7.5"
          letterSpacing="1.4"
          fill="var(--verified)"
        >
          COMMIT
        </text>
      </g>

      {/* failing work stays in the loop: an explicit upward arrow on the
          left edge, so "fail" reads as "go round again" rather than "stop". */}
      <g className="cl-fade" style={{ animationDelay: "2050ms" }}>
        <path
          d={`M${L} ${MY - 16}v-22`}
          stroke="var(--variance)"
          strokeWidth="1.3"
          strokeDasharray="3 3"
        />
        <path
          d="M-4 -3.4 L3.6 0 L-4 3.4 Z"
          transform={`translate(${L} ${T + 52}) rotate(-90)`}
          fill="var(--variance)"
        />
        <text
          x={L + 11}
          y={T + 62}
          fontFamily="var(--font-mono)"
          fontSize="7.5"
          letterSpacing="1.4"
          fill="var(--variance)"
        >
          RETRY
        </text>
      </g>
    </svg>
  );
}
