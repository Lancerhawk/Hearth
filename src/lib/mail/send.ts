import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST ?? "localhost";
const port = Number(process.env.SMTP_PORT ?? "1025");
const from = process.env.SMTP_FROM ?? "Hearth <noreply@hearth.local>";
const secure = process.env.SMTP_SECURE === "true";

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  return transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}
