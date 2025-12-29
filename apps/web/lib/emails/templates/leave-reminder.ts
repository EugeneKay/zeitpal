// CloudflareEnv is defined globally in env.d.ts
import {
  sendEmail,
  formatDate,
  getSiteUrl,
  wrapEmailHtml,
  createEmailButton,
  createInfoBox,
  createDetailRow,
  getLocale,
  type Locale,
  type LeaveReminderEmailData,
} from '~/lib/services/email.service';

/**
 * Email translations for leave reminder (carryover expiry)
 */
const translations = {
  en: {
    subject: (days: number) =>
      `Reminder: ${days} leave days expiring soon`,
    heading: 'Leave Balance Reminder',
    intro: (name: string) =>
      `Hi ${name}, this is a friendly reminder about your leave balance.`,
    remainingDays: 'Days Remaining',
    leaveType: 'Leave Type',
    expiryDate: 'Expiry Date',
    message: (days: number, date: string) =>
      `You have <strong>${days} day${days === 1 ? '' : 's'}</strong> of carried-over leave that will expire on <strong>${date}</strong>.`,
    buttonText: 'Request Leave',
    footer:
      "Don't let your leave days go to waste! Plan your time off today.",
    tip: 'Tip: You can also view your full leave balance in the ZeitPal dashboard.',
  },
  de: {
    subject: (days: number) =>
      `Erinnerung: ${days} Urlaubstage laufen bald ab`,
    heading: 'Erinnerung an Ihren Urlaubsanspruch',
    intro: (name: string) =>
      `Hallo ${name}, dies ist eine freundliche Erinnerung an Ihren Urlaubsanspruch.`,
    remainingDays: 'Verbleibende Tage',
    leaveType: 'Abwesenheitsart',
    expiryDate: 'Verfallsdatum',
    message: (days: number, date: string) =>
      `Sie haben <strong>${days} ${days === 1 ? 'Tag' : 'Tage'}</strong> übertragenen Urlaub, der am <strong>${date}</strong> verfällt.`,
    buttonText: 'Urlaub beantragen',
    footer:
      'Lassen Sie Ihre Urlaubstage nicht verfallen! Planen Sie Ihre Auszeit heute.',
    tip: 'Tipp: Sie können Ihren vollständigen Urlaubsanspruch auch im ZeitPal-Dashboard einsehen.',
  },
};

/**
 * Generate HTML content for leave reminder email
 */
function generateHtml(data: LeaveReminderEmailData, locale: Locale): string {
  const t = translations[locale];
  const siteUrl = getSiteUrl();
  const requestUrl = `${siteUrl}/home/leave/request`;

  const formattedExpiryDate = formatDate(data.expiryDate, locale);

  const content = `
    <h2 style="color: #F59E0B; margin-top: 0;">⏰ ${t.heading}</h2>

    <p style="color: #4b5563;">
      ${t.intro(data.employeeName)}
    </p>

    <div style="background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #92400E;">
        ${t.message(data.remainingDays, formattedExpiryDate)}
      </p>
    </div>

    ${createInfoBox(`
      ${createDetailRow(t.leaveType, data.leaveType)}
      ${createDetailRow(t.remainingDays, data.remainingDays.toString())}
      ${createDetailRow(t.expiryDate, formattedExpiryDate)}
    `)}

    ${createEmailButton(t.buttonText, requestUrl, '#F59E0B')}

    <p style="color: #6b7280; font-size: 14px;">
      ${t.footer}
    </p>

    <p style="color: #9ca3af; font-size: 12px; font-style: italic;">
      ${t.tip}
    </p>
  `;

  return wrapEmailHtml(content, locale);
}

/**
 * Generate plain text content for leave reminder email
 */
function generateText(data: LeaveReminderEmailData, locale: Locale): string {
  const t = translations[locale];
  const siteUrl = getSiteUrl();
  const requestUrl = `${siteUrl}/home/leave/request`;

  const formattedExpiryDate = formatDate(data.expiryDate, locale);
  // Strip HTML tags for plain text version
  const messageClean = t
    .message(data.remainingDays, formattedExpiryDate)
    .replace(/<[^>]*>/g, '');

  return `
${t.heading}

${t.intro(data.employeeName)}

${messageClean}

${t.leaveType}: ${data.leaveType}
${t.remainingDays}: ${data.remainingDays}
${t.expiryDate}: ${formattedExpiryDate}

${t.buttonText}: ${requestUrl}

${t.footer}

${t.tip}
  `.trim();
}

/**
 * Send leave reminder email to employee
 */
export async function sendLeaveReminderEmail(
  env: CloudflareEnv,
  data: LeaveReminderEmailData
): Promise<void> {
  const locale = getLocale();
  const t = translations[locale];

  await sendEmail(env, {
    to: data.employeeEmail,
    subject: t.subject(data.remainingDays),
    html: generateHtml(data, locale),
    text: generateText(data, locale),
  });
}
