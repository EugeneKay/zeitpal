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
  type LeaveRequestEmailData,
} from '~/lib/services/email.service';

/**
 * Email translations for leave request submitted notification
 */
const translations = {
  en: {
    subject: (employeeName: string) =>
      `New Leave Request from ${employeeName} - Action Required`,
    heading: 'New Leave Request',
    intro: (employeeName: string) =>
      `${employeeName} has submitted a new leave request that requires your approval.`,
    leaveType: 'Leave Type',
    dateRange: 'Date Range',
    workDays: 'Working Days',
    reason: 'Reason',
    noReason: 'No reason provided',
    buttonText: 'Review Request',
    footer:
      'Please review this request at your earliest convenience.',
  },
  de: {
    subject: (employeeName: string) =>
      `Neuer Urlaubsantrag von ${employeeName} - Aktion erforderlich`,
    heading: 'Neuer Urlaubsantrag',
    intro: (employeeName: string) =>
      `${employeeName} hat einen neuen Urlaubsantrag eingereicht, der Ihre Genehmigung erfordert.`,
    leaveType: 'Abwesenheitsart',
    dateRange: 'Zeitraum',
    workDays: 'Arbeitstage',
    reason: 'Begründung',
    noReason: 'Keine Begründung angegeben',
    buttonText: 'Antrag prüfen',
    footer:
      'Bitte prüfen Sie diesen Antrag bei nächster Gelegenheit.',
  },
};

/**
 * Generate HTML content for leave request submitted email
 */
function generateHtml(data: LeaveRequestEmailData, locale: Locale): string {
  const t = translations[locale];
  const siteUrl = getSiteUrl();
  const requestUrl = data.requestUrl || `${siteUrl}/home/approvals`;

  const dateRange = `${formatDate(data.startDate, locale)} - ${formatDate(data.endDate, locale)}`;
  const workDaysText = locale === 'de'
    ? `${data.workDays} ${data.workDays === 1 ? 'Tag' : 'Tage'}`
    : `${data.workDays} ${data.workDays === 1 ? 'day' : 'days'}`;

  const content = `
    <h2 style="color: #1f2937; margin-top: 0;">${t.heading}</h2>

    <p style="color: #4b5563;">
      ${t.intro(data.employeeName)}
    </p>

    ${createInfoBox(`
      ${createDetailRow(t.leaveType, data.leaveType)}
      ${createDetailRow(t.dateRange, dateRange)}
      ${createDetailRow(t.workDays, workDaysText)}
      ${createDetailRow(t.reason, data.reason || t.noReason)}
    `)}

    ${createEmailButton(t.buttonText, requestUrl)}

    <p style="color: #6b7280; font-size: 14px;">
      ${t.footer}
    </p>
  `;

  return wrapEmailHtml(content, locale);
}

/**
 * Generate plain text content for leave request submitted email
 */
function generateText(data: LeaveRequestEmailData, locale: Locale): string {
  const t = translations[locale];
  const siteUrl = getSiteUrl();
  const requestUrl = data.requestUrl || `${siteUrl}/home/approvals`;

  const dateRange = `${formatDate(data.startDate, locale)} - ${formatDate(data.endDate, locale)}`;
  const workDaysText = locale === 'de'
    ? `${data.workDays} ${data.workDays === 1 ? 'Tag' : 'Tage'}`
    : `${data.workDays} ${data.workDays === 1 ? 'day' : 'days'}`;

  return `
${t.heading}

${t.intro(data.employeeName)}

${t.leaveType}: ${data.leaveType}
${t.dateRange}: ${dateRange}
${t.workDays}: ${workDaysText}
${t.reason}: ${data.reason || t.noReason}

${t.buttonText}: ${requestUrl}

${t.footer}
  `.trim();
}

/**
 * Send leave request submitted notification email to approvers
 */
export async function sendLeaveRequestSubmittedEmail(
  env: CloudflareEnv,
  approverEmail: string,
  data: LeaveRequestEmailData
): Promise<void> {
  const locale = getLocale();
  const t = translations[locale];

  await sendEmail(env, {
    to: approverEmail,
    subject: t.subject(data.employeeName),
    html: generateHtml(data, locale),
    text: generateText(data, locale),
  });
}
