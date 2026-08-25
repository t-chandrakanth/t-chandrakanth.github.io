/**
 * The identity mark: two ledger columns, one tie between them.
 * That is the whole thesis of the site in nine strokes.
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
      <path d="M4 3.5v17M20 3.5v17" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <path d="M4 8h3M4 12.5h3M4 17h3" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <path d="M17 8h3M17 12.5h3M17 17h3" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <path
        d="M6.6 8.4 17.4 16.6"
        stroke="var(--accent)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="6.4" cy="8.2" r="1.5" fill="var(--accent)" />
      <circle cx="17.6" cy="16.8" r="1.5" fill="var(--accent)" />
    </svg>
  );
}
