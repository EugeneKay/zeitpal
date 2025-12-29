import type { EmailConfig } from 'next-auth/providers/email';

/**
 * Email templates for magic link authentication
 */
const emailTemplates = {
  en: {
    subject: (siteName: string) => `Your sign-in link for ${siteName}`,
    greeting: 'Hello,',
    clickLink: (siteName: string) => `Click the link below to sign in to ${siteName}:`,
    buttonText: 'Sign in now',
    validFor: 'This link is valid for <strong>1 hour</strong>.',
    ignoreMessage: "If you didn't request this email, you can safely ignore it.",
    signature: (siteName: string) => `Best regards,<br>The ${siteName} Team`,
    fallbackText: "If the button doesn't work, copy this link into your browser:",
    heading: 'Confirm sign-in',
    textEmail: (siteName: string, url: string) => `
Hello,

Click the following link to sign in to ${siteName}:

${url}

This link is valid for 1 hour.

If you didn't request this email, you can safely ignore it.

Best regards,
The ${siteName} Team
    `.trim(),
  },
  de: {
    subject: (siteName: string) => `Ihr Anmeldelink für ${siteName}`,
    greeting: 'Hallo,',
    clickLink: (siteName: string) => `Klicken Sie auf den Button unten, um sich bei ${siteName} anzumelden:`,
    buttonText: 'Jetzt anmelden',
    validFor: 'Dieser Link ist <strong>1 Stunde</strong> gültig.',
    ignoreMessage: 'Falls Sie diese E-Mail nicht angefordert haben, können Sie sie einfach ignorieren.',
    signature: (siteName: string) => `Mit freundlichen Grüßen,<br>Ihr ${siteName} Team`,
    fallbackText: 'Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:',
    heading: 'Anmeldung bestätigen',
    textEmail: (siteName: string, url: string) => `
Hallo,

klicken Sie auf den folgenden Link, um sich bei ${siteName} anzumelden:

${url}

Dieser Link ist 1 Stunde gültig.

Falls Sie diese E-Mail nicht angefordert haben, können Sie sie ignorieren.

Mit freundlichen Grüßen,
Ihr ${siteName} Team
    `.trim(),
  },
};

/**
 * Generate HTML email template
 */
function generateHtmlEmail(
  siteName: string,
  url: string,
  locale: 'en' | 'de'
): string {
  const t = emailTemplates[locale];

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">${siteName}</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">${t.heading}</h2>

    <p style="color: #4b5563;">
      ${t.clickLink(siteName)}
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}"
         style="display: inline-block; background: #3B82F6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        ${t.buttonText}
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px;">
      ${t.validFor}
    </p>

    <p style="color: #6b7280; font-size: 14px;">
      ${t.ignoreMessage}
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
      ${t.signature(siteName)}
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">
      ${t.fallbackText}
    </p>
    <p style="word-break: break-all; color: #6b7280;">
      ${url}
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Mailgun Email Provider for NextAuth
 *
 * Sends magic link authentication emails via Mailgun API.
 * Supports English and German based on NEXT_PUBLIC_DEFAULT_LOCALE.
 */
export function MailgunProvider(options: {
  apiKey: string;
  domain: string;
  from?: string;
}): EmailConfig {
  return {
    id: 'mailgun',
    type: 'email',
    name: 'Email',
    server: {},
    from: options.from ?? 'ZeitPal <noreply@zeitpal.com>',
    maxAge: 60 * 60, // 1 hour

    async sendVerificationRequest({
      identifier: email,
      url,
      provider: { from },
    }) {
      const siteName = process.env.NEXT_PUBLIC_PRODUCT_NAME ?? 'ZeitPal';
      const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'en';
      const locale = (defaultLocale === 'de' ? 'de' : 'en') as 'en' | 'de';

      const t = emailTemplates[locale];
      const fromAddress = from ?? options.from ?? 'ZeitPal <noreply@zeitpal.com>';

      // Use native fetch for edge runtime compatibility
      const apiUrl = `https://api.eu.mailgun.net/v3/${options.domain}/messages`;

      const formData = new FormData();
      formData.append('from', fromAddress);
      formData.append('to', email);
      formData.append('subject', t.subject(siteName));
      formData.append('text', t.textEmail(siteName, url));
      formData.append('html', generateHtmlEmail(siteName, url, locale));

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${btoa(`api:${options.apiKey}`)}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Mailgun API error:', response.status, errorText);
          throw new Error(`Mailgun API error: ${response.status}`);
        }
      } catch (error) {
        console.error('Mailgun send error:', error);
        throw new Error('Failed to send verification email');
      }
    },
  };
}
