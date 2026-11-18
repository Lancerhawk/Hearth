import { formatDistanceToNowStrict, format } from "date-fns";
import { enIN, hi } from "date-fns/locale";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/types";
import { t } from "@/i18n/get-dictionary";

const dateLocales = { en: enIN, hi } as const;

/** Human bill-due copy for notification bodies (includes calendar due date). */
export function billDueBody(
  daysUntilDue: number,
  dueDate?: Date,
  opts?: { locale?: Locale; dict?: Dictionary },
) {
  const locale = opts?.locale ?? "en";
  const dict = opts?.dict;
  const dateLocale = dateLocales[locale];
  const dueBit =
    dueDate != null
      ? `Due ${format(dueDate, "d MMM", { locale: dateLocale })}`
      : null;

  if (dict) {
    if (daysUntilDue < 0) {
      const overdue = Math.abs(daysUntilDue);
      const age = t(dict, "system.daysOverdue", { days: overdue });
      return dueBit ? `${dueBit} · ${age}` : age;
    }
    if (daysUntilDue === 0) {
      const msg = t(dict, "system.dueToday");
      return dueBit ? `${dueBit} · ${msg}` : msg;
    }
    if (daysUntilDue === 1) {
      const msg = t(dict, "system.dueTomorrow");
      return dueBit ? `${dueBit} · ${msg}` : msg;
    }
    const msg = t(dict, "system.dueInDays", { days: daysUntilDue });
    return dueBit ? `${dueBit} · ${msg}` : msg;
  }

  if (daysUntilDue < 0) {
    const overdue = Math.abs(daysUntilDue);
    const age = overdue === 1 ? "1 day overdue" : `${overdue} days overdue`;
    return dueBit ? `${dueBit} · ${age}` : `Was due ${age}.`;
  }

  if (daysUntilDue === 0) {
    return dueBit ? `${dueBit} · due today` : "Due today.";
  }

  if (daysUntilDue === 1) {
    return dueBit ? `${dueBit} · due tomorrow` : "Due tomorrow.";
  }

  return dueBit
    ? `${dueBit} · due in ${daysUntilDue} days`
    : `Due in ${daysUntilDue} days.`;
}

/** Label when the alert was created (not the bill due age). */
export function formatAlertedAt(
  iso: string,
  opts?: { locale?: Locale; dict?: Dictionary },
) {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return iso;
  const locale = opts?.locale ?? "en";
  const dateLocale = dateLocales[locale];
  try {
    const when = formatDistanceToNowStrict(at, {
      addSuffix: true,
      locale: dateLocale,
    });
    if (opts?.dict) return t(opts.dict, "notifications.alerted", { when });
    return `Alerted ${when}`;
  } catch {
    const fallback = iso.slice(0, 16).replace("T", " ");
    if (opts?.dict)
      return t(opts.dict, "notifications.alerted", { when: fallback });
    return `Alerted ${fallback}`;
  }
}
