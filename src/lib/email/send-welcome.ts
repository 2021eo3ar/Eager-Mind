import "server-only";

import { Resend } from "resend";

type SendWelcomeEmailInput = {
  email: string;
  handle: string;
  confirmationUrl: string;
};

export async function sendWelcomeEmail({
  email,
  handle,
  confirmationUrl,
}: SendWelcomeEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { skipped: true };
  }

  const resend = new Resend(apiKey);

  return resend.emails.send({
    from: "Bookmarks <onboarding@resend.dev>",
    to: email,
    subject: `Welcome to Bookmarks, @${handle}!`,
    html: `
      <div style="margin:0;background:#f8fafc;padding:32px;font-family:Arial,sans-serif;color:#0f172a;">
        <table role="presentation" style="width:100%;max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;">
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;color:#0f172a;">Welcome, @${handle}</h1>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#475569;">Your personal bookmark collection awaits.</p>
              <a href="${confirmationUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">Confirm your account</a>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b;">If the button does not work, copy and paste this link into your browser:<br />${confirmationUrl}</p>
            </td>
          </tr>
        </table>
      </div>
    `,
  });
}
