export function inviteEmailHtml(opts: {
  workspaceName: string;
  inviterName: string;
  inviteUrl: string;
  role: string;
}) {
  return `
  <div style="font-family: Georgia, serif; color: #2f2a24; line-height: 1.5;">
    <h1 style="font-size: 28px; margin-bottom: 8px;">You're invited to Hearth</h1>
    <p style="font-size: 16px; color: #5c564e;">
      <strong>${escapeHtml(opts.inviterName)}</strong> invited you to join
      <strong>${escapeHtml(opts.workspaceName)}</strong> as
      <strong>${escapeHtml(opts.role.toLowerCase())}</strong>.
    </p>
    <p style="margin: 24px 0;">
      <a href="${opts.inviteUrl}"
         style="background:#3f6f5a;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block;">
        Accept invite
      </a>
    </p>
    <p style="font-size: 13px; color: #7a736a;">
      Or open this link: ${opts.inviteUrl}
    </p>
  </div>`;
}

export function inviteEmailText(opts: {
  workspaceName: string;
  inviterName: string;
  inviteUrl: string;
  role: string;
}) {
  return `${opts.inviterName} invited you to join ${opts.workspaceName} as ${opts.role.toLowerCase()}.\n\nAccept: ${opts.inviteUrl}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
