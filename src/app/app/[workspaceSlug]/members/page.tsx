import type { Metadata } from "next";
import {
  inviteMemberAction,
  removeMemberAction,
  revokeInviteAction,
  updateMemberRoleAction,
} from "@/actions/invites";
import { PageHeader } from "@/components/design/page-header";
import { QuietList, QuietListItem } from "@/components/design/quiet-list";
import { SectionTitle } from "@/components/design/section-title";
import { InviteForm } from "@/components/members/invite-form";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { requireMembership } from "@/lib/budget/access";
import { prisma } from "@/lib/prisma";

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
        description="Family access, roles, and invites for this household."
      />

      {canAdmin ? <InviteForm action={invite} /> : null}

      <section className="space-y-3">
        <SectionTitle>Household</SectionTitle>
        <QuietList>
          {members.map((m) => (
            <QuietListItem key={m.id}>
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--hearth-moss)_12%,white)] font-heading text-sm text-hearth-moss"
                >
                  {(m.user.name ?? m.user.email).charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-hearth-ink">
                    {m.user.name ?? m.user.email}
                  </p>
                  <p className="text-xs text-hearth-ink/55">{m.user.email}</p>
                </div>
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
                    <PendingSubmitButton
                      size="sm"
                      variant="outline"
                      pendingLabel="Updating…"
                    >
                      Make {m.role === "ADMIN" ? "member" : "admin"}
                    </PendingSubmitButton>
                  </form>
                ) : (
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-hearth-ink/45">
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
                    <PendingSubmitButton
                      size="sm"
                      variant="ghost"
                      pendingLabel="Removing…"
                    >
                      Remove
                    </PendingSubmitButton>
                  </form>
                ) : null}
              </div>
            </QuietListItem>
          ))}
        </QuietList>
      </section>

      {canAdmin ? (
        <section className="space-y-3">
          <SectionTitle>Pending invites</SectionTitle>
          {invites.length === 0 ? (
            <p className="text-sm text-hearth-ink/55">No pending invites.</p>
          ) : (
            <QuietList>
              {invites.map((inv) => (
                <QuietListItem key={inv.id}>
                  <span className="text-sm text-hearth-ink">
                    {inv.email}
                    <span className="text-hearth-ink/50">
                      {" "}
                      · {inv.role.toLowerCase()}
                    </span>
                  </span>
                  <form
                    action={async () => {
                      "use server";
                      await revokeInviteAction(workspaceSlug, inv.id);
                    }}
                  >
                    <PendingSubmitButton
                      size="sm"
                      variant="outline"
                      pendingLabel="Revoking…"
                    >
                      Revoke
                    </PendingSubmitButton>
                  </form>
                </QuietListItem>
              ))}
            </QuietList>
          )}
        </section>
      ) : null}
    </div>
  );
}
