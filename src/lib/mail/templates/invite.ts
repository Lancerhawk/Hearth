import type { Locale } from "@/i18n/config";

const copy = {
  en: {
    heading: "You're invited to Hearth",
    invited: (inviter: string, workspace: string, role: string) =>
      `<strong>${inviter}</strong> invited you to join <strong>${workspace}</strong> as <strong>${role}</strong>.`,
    invitedText: (inviter: string, workspace: string, role: string) =>
      `${inviter} invited you to join ${workspace} as ${role}.`,
    cta: "Accept invite",
    orOpen: "Or open this link:",
  },
  hi: {
    heading: "आपको Hearth पर आमंत्रित किया गया है",
    invited: (inviter: string, workspace: string, role: string) =>
      `<strong>${inviter}</strong> ने आपको <strong>${workspace}</strong> में <strong>${role}</strong> के रूप में शामिल होने का निमंत्रण दिया है।`,
    invitedText: (inviter: string, workspace: string, role: string) =>
      `${inviter} ने आपको ${workspace} में ${role} के रूप में शामिल होने का निमंत्रण दिया है।`,
    cta: "निमंत्रण स्वीकार करें",
    orOpen: "या यह लिंक खोलें:",
  },
} as const;

export function inviteEmailHtml(opts: {
  workspaceName: string;
  inviterName: string;
  inviteUrl: string;
  role: string;
  locale?: Locale;
}) {
  const c = copy[opts.locale === "hi" ? "hi" : "en"];
  const role = opts.role.toLowerCase();
  return `
  <div style="font-family: Georgia, serif; color: #2f2a24; line-height: 1.5;">
    <h1 style="font-size: 28px; margin-bottom: 8px;">${c.heading}</h1>
    <p style="font-size: 16px; color: #5c564e;">
      ${c.invited(
        escapeHtml(opts.inviterName),
        escapeHtml(opts.workspaceName),
        escapeHtml(role),
      )}
    </p>
    <p style="margin: 24px 0;">
      <a href="${opts.inviteUrl}"
         style="background:#3f6f5a;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block;">
        ${c.cta}
      </a>
    </p>
    <p style="font-size: 13px; color: #7a736a;">
      ${c.orOpen} ${opts.inviteUrl}
    </p>
  </div>`;
}

export function inviteEmailText(opts: {
  workspaceName: string;
  inviterName: string;
  inviteUrl: string;
  role: string;
  locale?: Locale;
}) {
  const c = copy[opts.locale === "hi" ? "hi" : "en"];
  const role = opts.role.toLowerCase();
  return `${c.invitedText(opts.inviterName, opts.workspaceName, role)}\n\n${c.cta}: ${opts.inviteUrl}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
