// CloudflareEnv is defined globally in env.d.ts

/**
 * Email Service for ZeitPal
 *
 * Handles all transactional email sending via Mailgun.
 * Uses native fetch API for edge runtime compatibility.
 * Supports English and German locales.
 */

export type Locale = 'en' | 'de';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface LeaveRequestEmailData {
  employeeName: string;
  employeeEmail: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  workDays: number;
  reason?: string;
  status?: string;
  approverName?: string;
  rejectionReason?: string;
  requestUrl?: string;
}

export interface InviteEmailData {
  inviteeName: string;
  inviteeEmail: string;
  organizationName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
  expiresAt: string;
}

export interface LeaveReminderEmailData {
  employeeName: string;
  employeeEmail: string;
  remainingDays: number;
  expiryDate: string;
  leaveType: string;
}

export interface TeamAbsenceEmailData {
  recipientName: string;
  recipientEmail: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  teamName: string;
}

/**
 * Get Mailgun configuration from environment
 */
function getMailgunConfig(env: CloudflareEnv) {
  return {
    apiKey: env.MAILGUN_API_KEY ?? '',
    domain: env.MAILGUN_DOMAIN ?? 'mg.zeitpal.com',
    from: env.AUTH_EMAIL_FROM ?? 'ZeitPal <hello@mg.zeitpal.com>',
  };
}

/**
 * Send an email via Mailgun using native fetch (edge-compatible)
 */
export async function sendEmail(
  env: CloudflareEnv,
  options: EmailOptions
): Promise<void> {
  const config = getMailgunConfig(env);

  if (!config.apiKey) {
    console.error('Mailgun API key not configured');
    throw new Error('Email service not configured');
  }

  const url = `https://api.eu.mailgun.net/v3/${config.domain}/messages`;

  const formData = new FormData();
  formData.append('from', config.from);
  formData.append('to', options.to);
  formData.append('subject', options.subject);
  formData.append('text', options.text);
  formData.append('html', options.html);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`api:${config.apiKey}`)}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mailgun API error:', response.status, errorText);
      throw new Error(`Mailgun API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Get current locale from environment
 */
export function getLocale(): Locale {
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'en';
  return defaultLocale === 'de' ? 'de' : 'en';
}

/**
 * Format date for display based on locale
 */
export function formatDate(dateString: string, locale: Locale): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', options);
}

/**
 * Get site URL for links
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zeitpal.com';
}

/**
 * Get site name
 */
export function getSiteName(): string {
  return process.env.NEXT_PUBLIC_PRODUCT_NAME ?? 'ZeitPal';
}

/**
 * Base HTML email template wrapper
 */
export function wrapEmailHtml(
  content: string,
  locale: Locale = 'en'
): string {
  const siteName = getSiteName();

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">${siteName}</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    ${content}
  </div>

  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${siteName}. ${locale === 'de' ? 'Alle Rechte vorbehalten.' : 'All rights reserved.'}</p>
    <p style="margin: 5px 0 0 0;">
      <a href="${getSiteUrl()}" style="color: #6b7280; text-decoration: none;">${getSiteUrl()}</a>
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Create a styled button for emails
 */
export function createEmailButton(
  text: string,
  url: string,
  color: string = '#3B82F6'
): string {
  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}"
         style="display: inline-block; background: ${color}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        ${text}
      </a>
    </div>
  `;
}

/**
 * Create a styled info box for emails
 */
export function createInfoBox(content: string): string {
  return `
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      ${content}
    </div>
  `;
}

/**
 * Create a detail row for email info boxes
 */
export function createDetailRow(label: string, value: string): string {
  return `
    <p style="margin: 8px 0; color: #4b5563;">
      <strong style="color: #1f2937;">${label}:</strong> ${value}
    </p>
  `;
}
