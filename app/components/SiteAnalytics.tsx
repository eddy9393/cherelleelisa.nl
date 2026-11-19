"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const storageKey = "cherelle-visitor-session";

function getSessionId() {
  try {
    const current = window.localStorage.getItem(storageKey);
    if (current) return current;

    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.localStorage.setItem(storageKey, generated);
    return generated;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export default function SiteAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/account") ||
      pathname.startsWith("/mijn-account") ||
      pathname.startsWith("/api/")
    ) {
      return;
    }

    const query = searchParams?.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    void fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        session_id: getSessionId(),
        path,
        referrer: document.referrer || null,
      }),
    }).catch(() => undefined);
  }, [pathname, searchParams]);

  return null;
}
