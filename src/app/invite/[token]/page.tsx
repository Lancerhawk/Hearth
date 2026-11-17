import type { Metadata } from "next";
import Link from "next/link";
import { Atmosphere } from "@/components/design/atmosphere";
import { BrandMark } from "@/components/design/brand-mark";
import { AcceptInviteForm } from "@/components/members/accept-invite-form";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
      <Atmosphere className="flex min-h-dvh flex-1 flex-col">
        <div className="hearth-enter mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
          <BrandMark href="/" size="md" />
          <h1 className="mt-8 font-heading text-3xl tracking-tight text-hearth-ink">
            Invite unavailable
          </h1>
          <p className="mt-2 text-base leading-relaxed text-hearth-ink/60">
            This invite is invalid or was revoked.
          </p>
          <Link
            href="/"
            className={cn(
              buttonVariants({
                variant: "outline",
                className: "mt-8 self-start",
              }),
            )}
          >
            Back to Hearth
          </Link>
        </div>
      </Atmosphere>
    );
  }

  const inviter = invite.invitedBy.name ?? invite.invitedBy.email;

  return (
    <Atmosphere className="flex min-h-dvh flex-1 flex-col">
      <div className="flex flex-1 flex-col lg:hidden">
        <header className="px-6 py-6">
          <BrandMark href="/" size="md" />
        </header>
        <main className="hearth-enter flex flex-1 flex-col justify-center px-6 pb-12">
          <div className="mx-auto w-full max-w-md">
            <InviteBody
              token={token}
              workspaceName={invite.workspace.name}
              inviter={inviter}
              email={invite.email}
              role={invite.role}
              signedIn={Boolean(session?.user)}
            />
          </div>
        </main>
      </div>

      <div className="hidden min-h-dvh flex-1 lg:grid lg:grid-cols-2">
        <aside className="relative flex flex-col justify-between overflow-hidden bg-[color-mix(in_srgb,var(--hearth-moss)_92%,black)] px-12 py-12 text-[color-mix(in_srgb,var(--hearth-paper)_96%,white)] xl:px-16">
          <BrandMark href="/" size="lg" tone="paper" />
          <div className="hearth-enter relative z-[1] max-w-md">
            <p className="font-heading text-[2.75rem] leading-[1.08] tracking-tight xl:text-5xl">
              You’re invited to the household ledger.
            </p>
            <p className="mt-6 text-base leading-relaxed text-[color-mix(in_srgb,var(--hearth-paper)_78%,transparent)]">
              Join {invite.workspace.name} to share bills, spend, and savings in
              one quiet place.
            </p>
          </div>
          <p className="relative z-[1] text-[11px] uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--hearth-paper)_45%,transparent)]">
            Hearth · Household money
          </p>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--hearth-ember)_35%,transparent),transparent_70%)]"
          />
        </aside>

        <section className="relative flex items-center justify-center bg-[color-mix(in_srgb,var(--hearth-paper)_55%,white)] px-12 py-12 xl:px-16">
          <div className="hearth-enter w-full max-w-[24rem]">
            <InviteBody
              token={token}
              workspaceName={invite.workspace.name}
              inviter={inviter}
              email={invite.email}
              role={invite.role}
              signedIn={Boolean(session?.user)}
            />
          </div>
        </section>
      </div>
    </Atmosphere>
  );
}

function InviteBody({
  token,
  workspaceName,
  inviter,
  email,
  role,
  signedIn,
}: {
  token: string;
  workspaceName: string;
  inviter: string;
  email: string;
  role: string;
  signedIn: boolean;
}) {
  return (
    <div>
      <h1 className="font-heading text-[2rem] tracking-tight text-hearth-ink md:text-3xl">
        Join {workspaceName}
      </h1>
      <p className="mt-2 text-base leading-relaxed text-hearth-ink/60">
        {inviter} invited{" "}
        <span className="font-medium text-hearth-ink">{email}</span> as{" "}
        {role.toLowerCase()}.
      </p>

      {!signedIn ? (
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={`/register?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
            className={cn(buttonVariants({ size: "lg", className: "w-full" }))}
          >
            Create account to join
          </Link>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
                className: "w-full",
              }),
            )}
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
