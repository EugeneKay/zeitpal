/**
 * Email Templates - ZeitPal
 *
 * Centralized exports for all email templates.
 * Use these functions to send transactional emails.
 */

// Leave Request Emails
export { sendLeaveRequestSubmittedEmail } from './templates/leave-request-submitted';
export { sendLeaveRequestApprovedEmail } from './templates/leave-request-approved';
export { sendLeaveRequestRejectedEmail } from './templates/leave-request-rejected';

// Member Emails
export { sendMemberInvitationEmail } from './templates/member-invitation';

// Reminder Emails
export { sendLeaveReminderEmail } from './templates/leave-reminder';

// Team Emails
export { sendTeamAbsenceNotificationEmail } from './templates/team-absence-notification';

// Re-export types from email service
export type {
  LeaveRequestEmailData,
  InviteEmailData,
  LeaveReminderEmailData,
  TeamAbsenceEmailData,
} from '~/lib/services/email.service';
