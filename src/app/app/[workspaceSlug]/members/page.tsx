import type { Metadata } from "next";
import {
  inviteMemberAction,
  removeMemberAction,
  revokeInviteAction,
  updateMemberRoleAction,
} from "@/actions/invites";
import { PageHeader } from "@/components/design/page-header";
import { SectionTitle } from "@/components/design/section-title";
import { InviteForm } from "@/components/members/invite-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { requireMembership } from "@/lib/budget/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const { workspace, membership } = await requireMembership(workspaceSlug);
  const canAdmin = membership.role === "OWNER" || membership.role === "ADMIN";
  const isOwner = membership.role === "OWNER";

  const [members, invites] = await Promise.all([
    prisma.workspaceMembership.findMany({
      where: { workspaceId: workspace.id },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    canAdmin
      ? prisma.workspaceInvite.findMany({
          where: { workspaceId: workspace.id, status: "PENDING" },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const invite = inviteMemberAction.bind(null, workspaceSlug);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        title="Members"
        description="Family access, roles, and Mailpit invites."
      />

      {canAdmin ? <InviteForm action={invite} /> : null}

      <section className="space-y-3">
        <SectionTitle>Household</SectionTitle>
        <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/80 bg-card/70">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium">{m.user.name ?? m.user.email}</p>
                <p className="text-xs text-muted-foreground">{m.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {isOwner && m.role !== "OWNER" ? (
                  <form
                    action={async () => {
                      "use server";
                      await updateMemberRoleAction(
                        workspaceSlug,
                        m.id,
                        m.role === "ADMIN" ? "MEMBER" : "ADMIN",
                      );
                    }}
                  >
                    <Button type="submit" size="sm" variant="outline">
                      Make {m.role === "ADMIN" ? "member" : "admin"}
                    </Button>
                  </form>
                ) : (
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {m.role.toLowerCase()}
                  </span>
                )}
                {canAdmin && m.role !== "OWNER" ? (
                  <form
                    action={async () => {
                      "use server";
                      await removeMemberAction(workspaceSlug, m.id);
                    }}
                  >
                    <Button type="submit" size="sm" variant="ghost">
                      Remove
                    </Button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {canAdmin ? (
        <section className="space-y-3">
          <SectionTitle>Pending invites</SectionTitle>
          {invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending invites.</p>
          ) : (
            <ul className="space-y-2">
              {invites.map((inv) => (
                <li
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm"
                >
                  <span>
                    {inv.email} · {inv.role.toLowerCase()}
                  </span>
                  <form
                    action={async () => {
                      "use server";
                      await revokeInviteAction(workspaceSlug, inv.id);
                    }}
                  >
                    <button
                      type="submit"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      Revoke
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
