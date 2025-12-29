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
  type TeamAbsenceEmailData,
} from '~/lib/services/email.service';

/**
 * Email translations for team absence notification
 */
const translations = {
  en: {
    subject: (employeeName: string, teamName: string) =>
      `${employeeName} will be away from ${teamName}`,
    heading: 'Team Member Absence',
    intro: (recipientName: string) =>
      `Hi ${recipientName}, this is to let you know about an upcoming absence on your team.`,
    employee: 'Team Member',
    team: 'Team',
    leaveType: 'Absence Type',
    dateRange: 'Date Range',
    buttonText: 'View Team Calendar',
    footer: 'Plan accordingly and reach out if you need to arrange coverage.',
    coverageNote:
      'Consider reviewing tasks and responsibilities during this period.',
  },
  de: {
    subject: (employeeName: string, teamName: string) =>
      `${employeeName} wird abwesend sein (${teamName})`,
    heading: 'Teammitglied-Abwesenheit',
    intro: (recipientName: string) =>
      `Hallo ${recipientName}, hiermit informieren wir Sie über eine bevorstehende Abwesenheit in Ihrem Team.`,
    employee: 'Teammitglied',
    team: 'Team',
    leaveType: 'Abwesenheitsart',
    dateRange: 'Zeitraum',
    buttonText: 'Team-Kalender anzeigen',
    footer:
      'Planen Sie entsprechend und wenden Sie sich bei Bedarf wegen einer Vertretung an die zuständigen Personen.',
    coverageNote:
      'Überprüfen Sie die Aufgaben und Verantwortlichkeiten während dieses Zeitraums.',
  },
};

/**
 * Generate HTML content for team absence notification email
 */
function generateHtml(data: TeamAbsenceEmailData, locale: Locale): string {
  const t = translations[locale];
  const siteUrl = getSiteUrl();
  const calendarUrl = `${siteUrl}/home/calendar`;

  const dateRange = `${formatDate(data.startDate, locale)} - ${formatDate(data.endDate, locale)}`;

  const content = `
    <h2 style="color: #6366F1; margin-top: 0;">📅 ${t.heading}</h2>

    <p style="color: #4b5563;">
      ${t.intro(data.recipientName)}
    </p>

    ${createInfoBox(`
      ${createDetailRow(t.employee, data.employeeName)}
      ${createDetailRow(t.team, data.teamName)}
      ${createDetailRow(t.leaveType, data.leaveType)}
      ${createDetailRow(t.dateRange, dateRange)}
    `)}

    <div style="background: #EEF2FF; border-left: 4px solid #6366F1; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #4338CA; font-size: 14px;">
        💡 ${t.coverageNote}
      </p>
    </div>

    ${createEmailButton(t.buttonText, calendarUrl, '#6366F1')}

    <p style="color: #6b7280; font-size: 14px;">
      ${t.footer}
    </p>
  `;

  return wrapEmailHtml(content, locale);
}

/**
 * Generate plain text content for team absence notification email
 */
function generateText(data: TeamAbsenceEmailData, locale: Locale): string {
  const t = translations[locale];
  const siteUrl = getSiteUrl();
  const calendarUrl = `${siteUrl}/home/calendar`;

  const dateRange = `${formatDate(data.startDate, locale)} - ${formatDate(data.endDate, locale)}`;

  return `
${t.heading}

${t.intro(data.recipientName)}

${t.employee}: ${data.employeeName}
${t.team}: ${data.teamName}
${t.leaveType}: ${data.leaveType}
${t.dateRange}: ${dateRange}

${t.coverageNote}

${t.buttonText}: ${calendarUrl}

${t.footer}
  `.trim();
}

/**
 * Send team absence notification email
 */
export async function sendTeamAbsenceNotificationEmail(
  env: CloudflareEnv,
  data: TeamAbsenceEmailData
): Promise<void> {
  const locale = getLocale();
  const t = translations[locale];

  await sendEmail(env, {
    to: data.recipientEmail,
    subject: t.subject(data.employeeName, data.teamName),
    html: generateHtml(data, locale),
    text: generateText(data, locale),
  });
}
