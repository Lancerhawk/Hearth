import { en } from "@/i18n/dictionaries/en";
import { hi } from "@/i18n/dictionaries/hi";
import type { Dictionary } from "@/i18n/dictionaries/types";
import type { Locale } from "@/i18n/config";

const catalogs: Record<Locale, Dictionary> = { en, hi };

export function dictionaryFor(locale: Locale): Dictionary {
  return catalogs[locale] ?? en;
}

type Vars = Record<string, string | number>;

/** Resolve a dotted path on the dictionary and interpolate `{vars}`. */
export function t(dict: Dictionary, path: string, vars?: Vars): string {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return path;
    cur = (cur as Record<string, unknown>)[part];
  }
  if (typeof cur !== "string") return path;
  if (!vars) return cur;
  return cur.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] != null ? String(vars[key]) : `{${key}}`,
  );
}

export type Translate = (path: string, vars?: Vars) => string;

export function makeT(dict: Dictionary): Translate {
  return (path, vars) => t(dict, path, vars);
}
