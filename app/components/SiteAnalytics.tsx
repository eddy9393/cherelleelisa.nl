"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const storageKey = "cherelle-visitor-session";
const sentPrefix = "cherelle-analytics-sent:";

function isAutomatedBrowser() {
  if (typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent.toLowerCase();
  const botLike =
    /bot|crawler|spider|headless|lighthouse|pagespeed|preview|prerender|facebookexternalhit|whatsapp|slackbot|discordbot/.test(userAgent);

  return navigator.webdriver || botLike;
}

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
    return "";
  }
}

function alreadySent(path: string) {
  try {
    return window.sessionStorage.getItem(`${sentPrefix}${path}`) === "1";
  } catch {
    return false;
  }
}

function markSent(path: string) {
  try {
    window.sessionStorage.setItem(`${sentPrefix}${path}`, "1");
  } catch {
    // Session storage is only a duplicate guard; analytics can still continue without it.
  }
}

export default function SiteAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || isAutomatedBrowser()) return;
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

    if (alreadySent(path)) return;

    let cancelled = false;
    let timer: number | null = null;

    const send = () => {
      if (cancelled || document.visibilityState !== "visible") return;

      const sessionId = getSessionId();
      if (!sessionId) return;

      markSent(path);

      void fetch("/api/analytics/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          session_id: sessionId,
          path,
          referrer: document.referrer || null,
          engaged: true,
        }),
      }).catch(() => undefined);
    };

    const schedule = () => {
      if (timer !== null || alreadySent(path)) return;
      timer = window.setTimeout(send, 4500);
    };

    if (document.visibilityState === "visible") {
      schedule();
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") schedule();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  return null;
}
