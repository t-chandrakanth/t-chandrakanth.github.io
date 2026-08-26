/**
 * The identity mark: a closed loop with a gate on it.
 *
 * Work goes round until it passes the gate. That is the whole thesis of the
 * site in a handful of strokes.
 */
export function Mark({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="15"
        rx="5.5"
        stroke="currentColor"
        strokeWidth="1.3"
        opacity="0.5"
      />
      <path
        d="M20.5 9.2v5.6"
        stroke="var(--accent)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14.2 4.5h2.2"
        stroke="var(--paper)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="3.5" cy="12" r="2" fill="var(--accent)" />
      <path d="M9.6 4.5 12.4 4.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5" />
    </svg>
  );
}
