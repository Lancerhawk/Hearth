/**
 * Dev-only timing helper for month loaders.
 *
 * Manual smoke checklist (instant nav):
 * - [ ] Spam-click sidebar: shell stays; skeleton flashes ≤ blink
 * - [ ] Alerts panel loads list only when opened
 * - [ ] Dashboard header paints before chart/activity
 * - [ ] Month counters/filters paint before calendar body
 * - [ ] Statement filters usable while document streams
 * - [ ] After adding an expense, layout chrome does not full-reload
 */
export async function withPerfLog<T>(
  label: string,
  run: () => Promise<T>,
): Promise<T> {
  if (process.env.NODE_ENV === "production") {
    return run();
  }
  const start = performance.now();
  try {
    return await run();
  } finally {
    const ms = performance.now() - start;
    if (ms >= 25) {
      console.info(`[hearth:perf] ${label} ${ms.toFixed(1)}ms`);
    }
  }
}
