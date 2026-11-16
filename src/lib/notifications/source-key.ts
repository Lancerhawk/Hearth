export function billAlertSourceKey(
  instanceId: string,
  type: "BILL_DUE_SOON" | "BILL_OVERDUE",
) {
  return `bill:${instanceId}:${type}`;
}

export function billAlertSourceKeys(instanceId: string) {
  return [
    billAlertSourceKey(instanceId, "BILL_OVERDUE"),
    billAlertSourceKey(instanceId, "BILL_DUE_SOON"),
  ] as const;
}
