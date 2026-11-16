"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Idle-prefetch the two most common workspace landings. */
export function RouteWarmer({ workspaceSlug }: { workspaceSlug: string }) {
  const router = useRouter();

  useEffect(() => {
    const base = `/app/${workspaceSlug}`;
    const warm = () => {
      router.prefetch(`${base}/dashboard`);
      router.prefetch(`${base}/month`);
    };

    const w = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void) => number;
        cancelIdleCallback?: (id: number) => void;
      };

    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(warm);
      return () => w.cancelIdleCallback?.(id);
    }

    const t = globalThis.setTimeout(warm, 200);
    return () => globalThis.clearTimeout(t);
  }, [router, workspaceSlug]);

  return null;
}
