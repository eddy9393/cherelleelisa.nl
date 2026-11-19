export default function AccountLink({
  className = "",
  label = "Inloggen",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <a
      className={`accountHeaderLink ${className}`.trim()}
      href="/account"
      aria-label={label}
      title={label}
    >
      {label}
    </a>
  );
}
