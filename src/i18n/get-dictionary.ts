import type { Dictionary } from "@/i18n/dictionaries/types";
import type { Locale } from "@/i18n/config";
import { getLocale } from "@/i18n/get-locale";
import { dictionaryFor } from "@/i18n/translate";

export { dictionaryFor, makeT, t, type Translate } from "@/i18n/translate";

export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  return dictionaryFor(locale ?? (await getLocale()));
}
