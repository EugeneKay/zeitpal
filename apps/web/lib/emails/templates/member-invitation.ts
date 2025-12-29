// CloudflareEnv is defined globally in env.d.ts
import {
  sendEmail,
  formatDate,
  wrapEmailHtml,
  createEmailButton,
  createInfoBox,
  createDetailRow,
  getLocale,
  type Locale,
  type InviteEmailData,
} from '~/lib/services/email.service';

/**
 * Email translations for member invitation
 */
const translations = {
  en: {
    subject: (orgName: string) => `You've been invited to join ${orgName}`,
    heading: 'Team Invitation',
    intro: (inviterName: string, orgName: string) =>
      `${inviterName} has invited you to join ${orgName} on ZeitPal.`,
    organization: 'Organization',
    role: 'Your Role',
    invitedBy: 'Invited by',
    expiresAt: 'Invite expires',
    buttonText: 'Accept Invitation',
    footer:
      "If you don't recognize this invitation, you can safely ignore this email.",
    whatIsZeitPal:
      'ZeitPal is a modern leave management system for German companies, helping teams track vacation, sick leave, and more.',
    roles: {
      admin: 'Administrator',
      manager: 'Manager',
      member: 'Team Member',
    },
  },
  de: {
    subject: (orgName: string) => `Sie wurden zu ${orgName} eingeladen`,
    heading: 'Team-Einladung',
    intro: (inviterName: string, orgName: string) =>
      `${inviterName} hat Sie eingeladen, ${orgName} auf ZeitPal beizutreten.`,
    organization: 'Organisation',
    role: 'Ihre Rolle',
    invitedBy: 'Eingeladen von',
    expiresAt: 'Einladung gültig bis',
    buttonText: 'Einladung annehmen',
    footer:
      'Falls Sie diese Einladung nicht kennen, können Sie diese E-Mail ignorieren.',
    whatIsZeitPal:
      'ZeitPal ist ein modernes Urlaubsverwaltungssystem für deutsche Unternehmen, das Teams bei der Verwaltung von Urlaub, Krankheit und mehr unterstützt.',
    roles: {
      admin: 'Administrator',
      manager: 'Manager',
      member: 'Teammitglied',
    },
  },
};

/**
 * Get localized role name
 */
function getLocalizedRole(role: string, locale: Locale): string {
  const t = translations[locale];
  return t.roles[role as keyof typeof t.roles] || role;
}

/**
 * Generate HTML content for member invitation email
 */
function generateHtml(data: InviteEmailData, locale: Locale): string {
  const t = translations[locale];
  const localizedRole = getLocalizedRole(data.role, locale);

  const content = `
    <h2 style="color: #1f2937; margin-top: 0;">${t.heading}</h2>

    <p style="color: #4b5563;">
      ${t.intro(data.inviterName, data.organizationName)}
    </p>

    ${createInfoBox(`
      ${createDetailRow(t.organization, data.organizationName)}
      ${createDetailRow(t.role, localizedRole)}
      ${createDetailRow(t.invitedBy, data.inviterName)}
      ${createDetailRow(t.expiresAt, formatDate(data.expiresAt, locale))}
    `)}

    ${createEmailButton(t.buttonText, data.inviteUrl)}

    <p style="color: #6b7280; font-size: 14px; font-style: italic;">
      ${t.whatIsZeitPal}
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

    <p style="color: #9ca3af; font-size: 12px;">
      ${t.footer}
    </p>
  `;

  return wrapEmailHtml(content, locale);
}

/**
 * Generate plain text content for member invitation email
 */
function generateText(data: InviteEmailData, locale: Locale): string {
  const t = translations[locale];
  const localizedRole = getLocalizedRole(data.role, locale);

  return `
${t.heading}

${t.intro(data.inviterName, data.organizationName)}

${t.organization}: ${data.organizationName}
${t.role}: ${localizedRole}
${t.invitedBy}: ${data.inviterName}
${t.expiresAt}: ${formatDate(data.expiresAt, locale)}

${t.buttonText}: ${data.inviteUrl}

${t.whatIsZeitPal}

${t.footer}
  `.trim();
}

/**
 * Send member invitation email
 */
export async function sendMemberInvitationEmail(
  env: CloudflareEnv,
  data: InviteEmailData
): Promise<void> {
  const locale = getLocale();
  const t = translations[locale];

  await sendEmail(env, {
    to: data.inviteeEmail,
    subject: t.subject(data.organizationName),
    html: generateHtml(data, locale),
    text: generateText(data, locale),
  });
}
