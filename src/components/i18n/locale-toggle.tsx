"use client";

import { useTransition } from "react";
import { setLocaleAction } from "@/actions/locale";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LocaleToggle({
  locale,
  className,
  tone = "ink",
}: {
  locale: Locale;
  className?: string;
  tone?: "ink" | "paper";
}) {
  const [pending, start] = useTransition();

  function pick(next: Locale) {
    if (next === locale || pending) return;
    start(async () => {
      await setLocaleAction(next);
    });
  }

  const active =
    tone === "paper"
      ? "bg-white/20 text-white"
      : "bg-[color-mix(in_srgb,var(--hearth-moss)_16%,var(--hearth-paper))] text-hearth-ink";
  const idle =
    tone === "paper"
      ? "text-white/65 hover:text-white"
      : "text-hearth-ink/55 hover:text-hearth-ink";

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border p-0.5",
        tone === "paper" ? "border-white/25" : "border-border/80",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        disabled={pending}
        aria-pressed={locale === "en"}
        onClick={() => pick("en")}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          locale === "en" ? active : idle,
        )}
      >
        EN
      </button>
      <button
        type="button"
        disabled={pending}
        aria-pressed={locale === "hi"}
        onClick={() => pick("hi")}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          locale === "hi" ? active : idle,
        )}
      >
        हिं
      </button>
    </div>
  );
}
