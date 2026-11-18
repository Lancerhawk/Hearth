"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/i18n/config";
import { prisma } from "@/lib/prisma";

export async function setLocaleAction(locale: string) {
  const next: Locale = isLocale(locale) ? locale : defaultLocale;
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const session = await auth();
  const userId = session?.user?.id;
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { locale: next },
    });
  }

  revalidatePath("/", "layout");
}
