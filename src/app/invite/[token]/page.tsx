import type { Metadata } from "next";
import Link from "next/link";
import { AcceptInviteForm } from "@/components/members/accept-invite-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Accept invite" };

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    include: { workspace: true, invitedBy: true },
  });
  const session = await auth();

  if (!invite || invite.status === "REVOKED") {
    return (
      <div className="mx-auto max-w-lg px-6 py-20">
        <h1 className="font-heading text-3xl">Invite unavailable</h1>
        <p className="mt-2 text-muted-foreground">This invite is invalid or revoked.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-20">
      <p className="font-heading text-4xl tracking-tight">Hearth</p>
      <h1 className="mt-4 font-heading text-2xl">Join {invite.workspace.name}</h1>
      <p className="mt-2 text-muted-foreground">
        {(invite.invitedBy.name ?? invite.invitedBy.email) + " "}
        invited <strong>{invite.email}</strong> as {invite.role.toLowerCase()}.
      </p>

      {!session?.user ? (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/register?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
            className={cn(buttonVariants())}
          >
            Create account to join
          </Link>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Sign in
          </Link>
        </div>
      ) : (
        <AcceptInviteForm token={token} />
      )}
    </div>
  );
}
