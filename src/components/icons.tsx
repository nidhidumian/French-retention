/**
 * Hand-drawn SVG icon set for the dock and section headers. All 24×24,
 * stroke-based, drawn for this app rather than pulled from a stock set:
 * Notes = stacked documents, Vocabulary = book with a magnifying glass
 * over a letter A, Verbs = scroll, Grammar = ticket with a check,
 * Quiz = stopwatch.
 */

type IconProps = {
  className?: string;
  strokeWidth?: number;
};

function IconBase({
  children,
  className,
  strokeWidth = 1.6,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Stacked documents — the Notes pile. */
export function NotesStackIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M17.6 6V5a2 2 0 0 0-2-2H5.9a2 2 0 0 0-2 2v12.5a2 2 0 0 0 2 2h.7" />
      <rect x="6.4" y="6.6" width="13.7" height="14.4" rx="2" />
      <path d="M9.7 11h7.1M9.7 14.3h7.1M9.7 17.6h4.2" />
    </IconBase>
  );
}

/** Closed book with a magnifying glass over a letter A — Vocabulary. */
export function BookMagnifierIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9.6 21H6.4A2.4 2.4 0 0 1 4 18.6V5.2A2.2 2.2 0 0 1 6.2 3h9.3a2 2 0 0 1 2 2v2.3" />
      <path d="M4 17.2a2.4 2.4 0 0 1 2.4-2.4h2.4" />
      <circle cx="14.6" cy="13.6" r="4.9" />
      <path d="m18.2 17.2 3.3 3.3" />
      <path d="m12.7 15.7 1.9-4.5 1.9 4.5" />
      <path d="M13.5 14.1h2.2" />
    </IconBase>
  );
}

/** Rolled parchment — Verbs. */
export function ScrollIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19.2 16.8V5.1A2.1 2.1 0 0 0 17.1 3H4.1" />
      <path d="M8.2 21h11.2a2.1 2.1 0 0 0 2.1-2.1v-.9a1 1 0 0 0-1-1h-9.4a1 1 0 0 0-1 1v.9a2.05 2.05 0 1 1-4.1 0V5.1a2.05 2.05 0 1 0-4.1 0V7a1 1 0 0 0 1 1h3.1" />
    </IconBase>
  );
}

/** Ticket with a check — Grammar rules, stamped valid. */
export function TicketCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2.5 9.3a2.8 2.8 0 0 1 0 5.4v2.2A2.1 2.1 0 0 0 4.6 19h14.8a2.1 2.1 0 0 0 2.1-2.1v-2.2a2.8 2.8 0 0 1 0-5.4V7.1A2.1 2.1 0 0 0 19.4 5H4.6a2.1 2.1 0 0 0-2.1 2.1Z" />
      <path d="m9.1 12.1 2 2 3.8-4" />
    </IconBase>
  );
}

/** Stopwatch — Quiz, against the clock. */
export function TimerIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="13.7" r="7.3" />
      <path d="M9.9 2.5h4.2" />
      <path d="M12 2.5v1.7" />
      <path d="M12 13.7l3-3" />
    </IconBase>
  );
}
