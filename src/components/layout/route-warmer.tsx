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

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(warm);
      return () => window.cancelIdleCallback(id);
    }

    const t = window.setTimeout(warm, 200);
    return () => window.clearTimeout(t);
  }, [router, workspaceSlug]);

  return null;
}
