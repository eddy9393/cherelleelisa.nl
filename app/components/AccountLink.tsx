export default function AccountLink({ className = "" }: { className?: string }) {
  return (
    <a
      className={`accountHeaderLink ${className}`.trim()}
      href="/account"
      aria-label="Persoonlijke omgeving"
      title="Persoonlijke omgeving"
    >
      <svg
        viewBox="0 0 24 24"
        width="19"
        height="19"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.7 19.2c.7-3.2 3-5.1 6.3-5.1s5.6 1.9 6.3 5.1" />
      </svg>
    </a>
  );
}
