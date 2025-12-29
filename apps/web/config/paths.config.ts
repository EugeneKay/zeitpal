import { z } from 'zod';

const PathsSchema = z.object({
  auth: z.object({
    signIn: z.string().min(1),
    signUp: z.string().min(1),
    verifyMfa: z.string().min(1),
    callback: z.string().min(1),
    passwordReset: z.string().min(1),
    passwordUpdate: z.string().min(1),
  }),
  app: z.object({
    home: z.string().min(1),
    profileSettings: z.string().min(1),
    accountSettings: z.string().min(1),
    // ZeitPal Leave Management
    leave: z.string().min(1),
    leaveRequest: z.string().min(1),
    leaveHistory: z.string().min(1),
    calendar: z.string().min(1),
    approvals: z.string().min(1),
    team: z.string().min(1),
    // Admin routes
    adminOrganization: z.string().min(1),
    adminMembers: z.string().min(1),
    adminLeaveTypes: z.string().min(1),
    adminPolicies: z.string().min(1),
    adminHolidays: z.string().min(1),
    adminApprovals: z.string().min(1),
    adminReports: z.string().min(1),
  }),
  legal: z.object({
    termsOfService: z.string().min(1),
    privacyPolicy: z.string().min(1),
  }),
  onboarding: z.object({
    root: z.string().min(1),
  }),
  invite: z.string().min(1),
});

const pathsConfig = PathsSchema.parse({
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    verifyMfa: '/auth/verify',
    callback: '/auth/callback',
    passwordReset: '/auth/password-reset',
    passwordUpdate: '/update-password',
  },
  app: {
    home: '/home',
    profileSettings: '/home/settings',
    accountSettings: '/home/settings',
    // ZeitPal Leave Management
    leave: '/home/leave',
    leaveRequest: '/home/leave/request',
    leaveHistory: '/home/leave/history',
    calendar: '/home/calendar',
    approvals: '/home/approvals',
    team: '/home/team',
    // Admin routes
    adminOrganization: '/home/admin/organization',
    adminMembers: '/home/admin/members',
    adminLeaveTypes: '/home/admin/leave-types',
    adminPolicies: '/home/admin/policies',
    adminHolidays: '/home/admin/holidays',
    adminApprovals: '/home/admin/approvals',
    adminReports: '/home/admin/reports',
  },
  legal: {
    termsOfService: '/terms',
    privacyPolicy: '/privacy',
  },
  onboarding: {
    root: '/onboarding',
  },
  invite: '/invite',
} satisfies z.infer<typeof PathsSchema>);

export default pathsConfig;
