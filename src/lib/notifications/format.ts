import { formatDistanceToNowStrict, format } from "date-fns";

/** Human bill-due copy for notification bodies (includes calendar due date). */
export function billDueBody(daysUntilDue: number, dueDate?: Date) {
  const dueBit = dueDate != null ? `Due ${format(dueDate, "d MMM")}` : null;

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
export function formatAlertedAt(iso: string) {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return iso;
  try {
    return `Alerted ${formatDistanceToNowStrict(at, { addSuffix: true })}`;
  } catch {
    return `Alerted ${iso.slice(0, 16).replace("T", " ")}`;
  }
}
