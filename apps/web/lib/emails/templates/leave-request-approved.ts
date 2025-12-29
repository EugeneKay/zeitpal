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
 * Email translations for leave request approved notification
 */
const translations = {
  en: {
    subject: 'Your Leave Request Has Been Approved',
    heading: 'Leave Request Approved',
    intro: 'Great news! Your leave request has been approved.',
    approvedBy: 'Approved by',
    leaveType: 'Leave Type',
    dateRange: 'Date Range',
    workDays: 'Working Days',
    buttonText: 'View Details',
    footer: 'Enjoy your time off!',
    comment: 'Comment',
  },
  de: {
    subject: 'Ihr Urlaubsantrag wurde genehmigt',
    heading: 'Urlaubsantrag genehmigt',
    intro: 'Gute Nachrichten! Ihr Urlaubsantrag wurde genehmigt.',
    approvedBy: 'Genehmigt von',
    leaveType: 'Abwesenheitsart',
    dateRange: 'Zeitraum',
    workDays: 'Arbeitstage',
    buttonText: 'Details anzeigen',
    footer: 'Genießen Sie Ihre freie Zeit!',
    comment: 'Kommentar',
  },
};

/**
 * Generate HTML content for leave request approved email
 */
function generateHtml(
  data: LeaveRequestEmailData & { comment?: string },
  locale: Locale
): string {
  const t = translations[locale];
  const siteUrl = getSiteUrl();
  const requestUrl = data.requestUrl || `${siteUrl}/home/leave`;

  const dateRange = `${formatDate(data.startDate, locale)} - ${formatDate(data.endDate, locale)}`;
  const workDaysText = locale === 'de'
    ? `${data.workDays} ${data.workDays === 1 ? 'Tag' : 'Tage'}`
    : `${data.workDays} ${data.workDays === 1 ? 'day' : 'days'}`;

  const commentSection = data.comment
    ? createDetailRow(t.comment, data.comment)
    : '';

  const content = `
    <h2 style="color: #059669; margin-top: 0;">✓ ${t.heading}</h2>

    <p style="color: #4b5563;">
      ${t.intro}
    </p>

    ${createInfoBox(`
      ${createDetailRow(t.leaveType, data.leaveType)}
      ${createDetailRow(t.dateRange, dateRange)}
      ${createDetailRow(t.workDays, workDaysText)}
      ${data.approverName ? createDetailRow(t.approvedBy, data.approverName) : ''}
      ${commentSection}
    `)}

    ${createEmailButton(t.buttonText, requestUrl, '#059669')}

    <p style="color: #6b7280; font-size: 14px;">
      ${t.footer}
    </p>
  `;

  return wrapEmailHtml(content, locale);
}

/**
 * Generate plain text content for leave request approved email
 */
function generateText(
  data: LeaveRequestEmailData & { comment?: string },
  locale: Locale
): string {
  const t = translations[locale];
  const siteUrl = getSiteUrl();
  const requestUrl = data.requestUrl || `${siteUrl}/home/leave`;

  const dateRange = `${formatDate(data.startDate, locale)} - ${formatDate(data.endDate, locale)}`;
  const workDaysText = locale === 'de'
    ? `${data.workDays} ${data.workDays === 1 ? 'Tag' : 'Tage'}`
    : `${data.workDays} ${data.workDays === 1 ? 'day' : 'days'}`;

  const commentLine = data.comment ? `\n${t.comment}: ${data.comment}` : '';

  return `
${t.heading}

${t.intro}

${t.leaveType}: ${data.leaveType}
${t.dateRange}: ${dateRange}
${t.workDays}: ${workDaysText}
${data.approverName ? `${t.approvedBy}: ${data.approverName}` : ''}${commentLine}

${t.buttonText}: ${requestUrl}

${t.footer}
  `.trim();
}

/**
 * Send leave request approved notification email to employee
 */
export async function sendLeaveRequestApprovedEmail(
  env: CloudflareEnv,
  data: LeaveRequestEmailData & { comment?: string }
): Promise<void> {
  const locale = getLocale();
  const t = translations[locale];

  await sendEmail(env, {
    to: data.employeeEmail,
    subject: t.subject,
    html: generateHtml(data, locale),
    text: generateText(data, locale),
  });
}
