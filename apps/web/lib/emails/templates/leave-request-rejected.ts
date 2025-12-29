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
 * Email translations for leave request rejected notification
 */
const translations = {
  en: {
    subject: 'Your Leave Request Has Been Declined',
    heading: 'Leave Request Declined',
    intro: 'Unfortunately, your leave request has been declined.',
    rejectedBy: 'Reviewed by',
    leaveType: 'Leave Type',
    dateRange: 'Date Range',
    workDays: 'Working Days',
    reason: 'Reason for Decline',
    buttonText: 'View Details',
    footer:
      'If you have questions about this decision, please contact your manager or HR department.',
    newRequest: 'You can submit a new request with different dates if needed.',
  },
  de: {
    subject: 'Ihr Urlaubsantrag wurde abgelehnt',
    heading: 'Urlaubsantrag abgelehnt',
    intro: 'Leider wurde Ihr Urlaubsantrag abgelehnt.',
    rejectedBy: 'Geprüft von',
    leaveType: 'Abwesenheitsart',
    dateRange: 'Zeitraum',
    workDays: 'Arbeitstage',
    reason: 'Ablehnungsgrund',
    buttonText: 'Details anzeigen',
    footer:
      'Bei Fragen zu dieser Entscheidung wenden Sie sich bitte an Ihren Vorgesetzten oder die Personalabteilung.',
    newRequest:
      'Sie können bei Bedarf einen neuen Antrag mit anderen Daten einreichen.',
  },
};

/**
 * Generate HTML content for leave request rejected email
 */
function generateHtml(data: LeaveRequestEmailData, locale: Locale): string {
  const t = translations[locale];
  const siteUrl = getSiteUrl();
  const requestUrl = data.requestUrl || `${siteUrl}/home/leave`;

  const dateRange = `${formatDate(data.startDate, locale)} - ${formatDate(data.endDate, locale)}`;
  const workDaysText = locale === 'de'
    ? `${data.workDays} ${data.workDays === 1 ? 'Tag' : 'Tage'}`
    : `${data.workDays} ${data.workDays === 1 ? 'day' : 'days'}`;

  const content = `
    <h2 style="color: #DC2626; margin-top: 0;">✗ ${t.heading}</h2>

    <p style="color: #4b5563;">
      ${t.intro}
    </p>

    ${createInfoBox(`
      ${createDetailRow(t.leaveType, data.leaveType)}
      ${createDetailRow(t.dateRange, dateRange)}
      ${createDetailRow(t.workDays, workDaysText)}
      ${data.approverName ? createDetailRow(t.rejectedBy, data.approverName) : ''}
    `)}

    ${data.rejectionReason ? `
    <div style="background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #991B1B; font-weight: 600;">${t.reason}</p>
      <p style="margin: 10px 0 0 0; color: #7F1D1D;">${data.rejectionReason}</p>
    </div>
    ` : ''}

    <p style="color: #6b7280; font-size: 14px;">
      ${t.newRequest}
    </p>

    ${createEmailButton(t.buttonText, requestUrl, '#6B7280')}

    <p style="color: #6b7280; font-size: 14px;">
      ${t.footer}
    </p>
  `;

  return wrapEmailHtml(content, locale);
}

/**
 * Generate plain text content for leave request rejected email
 */
function generateText(data: LeaveRequestEmailData, locale: Locale): string {
  const t = translations[locale];
  const siteUrl = getSiteUrl();
  const requestUrl = data.requestUrl || `${siteUrl}/home/leave`;

  const dateRange = `${formatDate(data.startDate, locale)} - ${formatDate(data.endDate, locale)}`;
  const workDaysText = locale === 'de'
    ? `${data.workDays} ${data.workDays === 1 ? 'Tag' : 'Tage'}`
    : `${data.workDays} ${data.workDays === 1 ? 'day' : 'days'}`;

  const rejectionLine = data.rejectionReason
    ? `\n${t.reason}: ${data.rejectionReason}`
    : '';

  return `
${t.heading}

${t.intro}

${t.leaveType}: ${data.leaveType}
${t.dateRange}: ${dateRange}
${t.workDays}: ${workDaysText}
${data.approverName ? `${t.rejectedBy}: ${data.approverName}` : ''}${rejectionLine}

${t.newRequest}

${t.buttonText}: ${requestUrl}

${t.footer}
  `.trim();
}

/**
 * Send leave request rejected notification email to employee
 */
export async function sendLeaveRequestRejectedEmail(
  env: CloudflareEnv,
  data: LeaveRequestEmailData
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
