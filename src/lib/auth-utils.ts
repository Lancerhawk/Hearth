/**
 * Only allow same-origin relative paths as post-login destinations.
 */
export function safeCallbackUrl(
  value: FormDataEntryValue | string | null | undefined,
  fallback = "/app",
): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://")) {
    return fallback;
  }
  return trimmed;
}
