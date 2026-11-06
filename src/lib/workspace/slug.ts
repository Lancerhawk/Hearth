import slugify from "slugify";
import { prisma } from "@/lib/prisma";

export function baseSlug(name: string) {
  const slug = slugify(name, { lower: true, strict: true, trim: true });
  return slug || "workspace";
}

export async function uniqueWorkspaceSlug(name: string) {
  const root = baseSlug(name);
  let candidate = root;
  let n = 2;

  while (await prisma.workspace.findUnique({ where: { slug: candidate } })) {
    candidate = `${root}-${n}`;
    n += 1;
  }

  return candidate;
}
