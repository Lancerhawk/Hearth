export const locales = ["en", "hi"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "hearth_locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "hi";
}

export function intlLocale(locale: Locale) {
  return locale === "hi" ? "hi-IN" : "en-IN";
}
