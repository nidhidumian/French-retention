export function IconPlus({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconLibrary({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M6 6.5h12v13H8.2A2.2 2.2 0 0 1 6 17.3V6.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M6 6.5A2.2 2.2 0 0 1 8.2 4.3H18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconNotes({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M7 4.5h10A1.5 1.5 0 0 1 18.5 6v12A1.5 1.5 0 0 1 17 19.5H7A1.5 1.5 0 0 1 5.5 18V6A1.5 1.5 0 0 1 7 4.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconVocab({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M5 6.5h6.5v12H7A2 2 0 0 1 5 16.5v-10Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19 6.5h-6.5v12H17A2 2 0 0 0 19 16.5v-10Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconVerbs({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M5 16.5 9.5 7h2L16 16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.8 13h7.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 8.5v8M17 8.5c1.8 0 3 1 3 2.6 0 1.8-1.5 2.4-3 2.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconGrammar({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M6 7h12M6 12h8M6 17h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17.5" cy="12" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function IconQuiz({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <rect x="4.5" y="5.5" width="11" height="14" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="8.5" y="4.5" width="11" height="14" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconGear({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 4.5v1.6M12 17.9v1.6M4.5 12h1.6M17.9 12h1.6M6.4 6.4l1.1 1.1M16.5 16.5l1.1 1.1M17.6 6.4l-1.1 1.1M7.5 16.5l-1.1 1.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
