"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addDays } from "date-fns";
import { requireMembership, requireUser } from "@/lib/budget/access";
import { getDictionary, t } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { sendMail } from "@/lib/mail/send";
import { inviteEmailHtml, inviteEmailText } from "@/lib/mail/templates/invite";
import {
  createNotification,
  notifyWorkspaceAdmins,
} from "@/lib/notifications/create";
import { prisma } from "@/lib/prisma";
import { inviteMemberSchema } from "@/lib/validators/invite";

export type InviteActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

function appUrl() {
  return (
    process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  );
}

export async function inviteMemberAction(
  workspaceSlug: string,
  _prev: InviteActionState,
  formData: FormData,
): Promise<InviteActionState> {
  const { workspace, user } = await requireMembership(workspaceSlug, "ADMIN");

  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") || "MEMBER",
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Please fix the highlighted fields.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  if (email === user.email.toLowerCase()) {
    return { error: "You can't invite yourself." };
  }

  const existingMember = await prisma.workspaceMembership.findFirst({
    where: {
      workspaceId: workspace.id,
      user: { email },
    },
  });
  if (existingMember) {
    return { error: "That person is already a member." };
  }

  const token = randomBytes(32).toString("hex");
  const invite = await prisma.workspaceInvite.create({
    data: {
      email,
      token,
      role: parsed.data.role,
      expiresAt: addDays(new Date(), 7),
      workspaceId: workspace.id,
      invitedById: user.id,
    },
  });

  const inviteUrl = `${appUrl()}/invite/${invite.token}`;
  const inviterName = user.name ?? user.email;
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  let mailSent = true;
  try {
    await sendMail({
      to: email,
      subject: t(dict, "invite.emailSubject", { name: workspace.name }),
      html: inviteEmailHtml({
        workspaceName: workspace.name,
        inviterName,
        inviteUrl,
        role: parsed.data.role,
        locale,
      }),
      text: inviteEmailText({
        workspaceName: workspace.name,
        inviterName,
        inviteUrl,
        role: parsed.data.role,
        locale,
      }),
    });
  } catch (err) {
    mailSent = false;
    console.error("Invite email failed (invite still created):", err);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    await createNotification({
      userId: existingUser.id,
      workspaceId: workspace.id,
      type: "INVITE_RECEIVED",
      title: `Invite to ${workspace.name}`,
      body: `${inviterName} invited you to join as ${parsed.data.role.toLowerCase()}.`,
      href: `/invite/${invite.token}`,
    });
  }

  revalidatePath(`/app/${workspaceSlug}/members`);
  if (!mailSent) {
    return {
      success: `Invite created for ${email}, but email could not be sent yet. Share this link: ${inviteUrl}`,
    };
  }
  return { success: t(dict, "system.inviteSent") };
}

export async function revokeInviteAction(
  workspaceSlug: string,
  inviteId: string,
) {
  await requireMembership(workspaceSlug, "ADMIN");
  await prisma.workspaceInvite.updateMany({
    where: { id: inviteId, status: "PENDING" },
    data: { status: "REVOKED" },
  });
  revalidatePath(`/app/${workspaceSlug}/members`);
}

export async function acceptInviteAction(token: string) {
  const user = await requireUser();
  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invite || invite.status !== "PENDING") {
    return { error: "This invite is no longer valid." };
  }
  if (invite.expiresAt < new Date()) {
    await prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });
    return { error: "This invite has expired." };
  }
  if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
    return {
      error: `Sign in as ${invite.email} to accept this invite.`,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.workspaceMembership.upsert({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: invite.workspaceId,
        },
      },
      create: {
        userId: user.id,
        workspaceId: invite.workspaceId,
        role: invite.role,
      },
      update: {},
    });
    await tx.workspaceInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    });
  });

  const joiner = user.name ?? user.email;
  await notifyWorkspaceAdmins({
    workspaceId: invite.workspaceId,
    excludeUserId: user.id,
    type: "INVITE_ACCEPTED",
    title: `${joiner} joined ${invite.workspace.name}`,
    body: `${joiner} accepted the invite.`,
    href: `/app/${invite.workspace.slug}/members`,
  });

  redirect(`/app/${invite.workspace.slug}/dashboard`);
}

export async function updateMemberRoleAction(
  workspaceSlug: string,
  membershipId: string,
  role: "ADMIN" | "MEMBER",
) {
  const { membership: actor } = await requireMembership(workspaceSlug, "OWNER");
  const target = await prisma.workspaceMembership.findFirst({
    where: { id: membershipId, workspaceId: actor.workspaceId },
  });
  if (!target || target.role === "OWNER") return;
  await prisma.workspaceMembership.update({
    where: { id: membershipId },
    data: { role },
  });
  revalidatePath(`/app/${workspaceSlug}/members`);
}

export async function removeMemberAction(
  workspaceSlug: string,
  membershipId: string,
) {
  const { membership: actor, user } = await requireMembership(
    workspaceSlug,
    "ADMIN",
  );
  const target = await prisma.workspaceMembership.findFirst({
    where: { id: membershipId, workspaceId: actor.workspaceId },
  });
  if (!target || target.role === "OWNER") return;
  if (actor.role === "ADMIN" && target.role === "ADMIN") return;
  if (target.userId === user.id) return;

  await prisma.workspaceMembership.delete({ where: { id: membershipId } });
  revalidatePath(`/app/${workspaceSlug}/members`);
}
