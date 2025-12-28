# ZeitPal - German Leave Tracking SaaS Implementation Plan

> **AI Implementation Instructions**: This document contains detailed specifications for building ZeitPal. Follow each phase sequentially. Use the component recommendations in the UI/UX section. All code should follow existing MakerKit patterns found in `/packages/ui` and `/apps/web`.

---

## Overview

Transform the MakerKit SaaS template into a German-compliant leave tracking system using:
- **Cloudflare Pages** (deployment)
- **Cloudflare D1** (SQLite database)
- **Cloudflare R2** (file storage for sick notes)
- **Auth.js v5** (Google, Microsoft, Magic Link authentication)
- **Mailgun** (transactional emails for notifications)

## Key Design Decisions

| Decision | Choice |
|----------|--------|
| Multi-org per user | No - Single org per user (simpler) |
| Approval workflow | Configurable per organization |
| Email notifications | Yes - via Mailgun |
| Onboarding flow | Both: Create org OR join via invite |

---

## UI Components (Shadcn + MagicUI)

> **AI Instructions**: Use shadcn components as the foundation. Enhance with MagicUI for animations and visual appeal. The project already has shadcn installed via `@kit/ui`. Add MagicUI components as needed.

### Adding Components

```bash
# Add shadcn components (already configured in monorepo)
pnpm dlx shadcn@latest add button calendar card dialog

# Add MagicUI components for animations
pnpm dlx shadcn@latest add @magicui/animated-list
pnpm dlx shadcn@latest add @magicui/number-ticker
pnpm dlx shadcn@latest add @magicui/shimmer-button
```

### Shadcn Components Available

Use these from `@kit/ui` (already installed):

| Component | Use Case in ZeitPal |
|-----------|---------------------|
| `Accordion` | FAQ, collapsible leave details |
| `Alert` | Warnings (carryover expiry, policy violations) |
| `Avatar` | User profiles, team member lists |
| `Badge` | Leave status (pending, approved, rejected) |
| `Breadcrumb` | Navigation in admin sections |
| `Button` | All actions |
| `Calendar` | Date picker for leave requests |
| `Card` | Leave balance cards, request cards |
| `Carousel` | Onboarding wizard steps |
| `Chart` | Leave statistics, usage reports |
| `Checkbox` | Multi-select team members |
| `Combobox` | Searchable leave type selector |
| `Command` | Quick actions palette (Cmd+K) |
| `Data Table` | Leave requests list, team members, audit logs |
| `Date Picker` | Leave request date range |
| `Dialog` | Confirm actions, request details |
| `Drawer` | Mobile navigation, filters |
| `Dropdown Menu` | User menu, actions menu |
| `Form` | All forms (React Hook Form + Zod) |
| `Input` | Text inputs |
| `Label` | Form labels |
| `Popover` | Tooltips, date picker container |
| `Progress` | Leave balance visualization |
| `Radio Group` | Half-day selection (morning/afternoon) |
| `Select` | Bundesland, leave type dropdowns |
| `Separator` | Section dividers |
| `Sheet` | Side panels for details |
| `Skeleton` | Loading states |
| `Slider` | Policy configuration (days) |
| `Sonner` | Toast notifications |
| `Switch` | Toggle settings |
| `Table` | Data display |
| `Tabs` | Dashboard sections, settings tabs |
| `Textarea` | Leave request reason |
| `Tooltip` | Help text, abbreviations |

### MagicUI Components to Add

> **AI Instructions**: Install these MagicUI components to enhance the UI. Use sparingly for key interactions.

| Component | Installation | Use Case |
|-----------|--------------|----------|
| `Animated List` | `@magicui/animated-list` | Approval queue, notifications |
| `Number Ticker` | `@magicui/number-ticker` | Leave balance counters |
| `Confetti` | `@magicui/confetti` | Approval celebration |
| `Shimmer Button` | `@magicui/shimmer-button` | Primary CTAs |
| `Border Beam` | `@magicui/border-beam` | Highlight active cards |
| `Animated Gradient Text` | `@magicui/animated-gradient-text` | Marketing headlines |
| `Blur Fade` | `@magicui/blur-fade` | Page transitions |
| `Marquee` | `@magicui/marquee` | Team calendar ticker |
| `Ripple` | `@magicui/ripple` | Background effects |
| `Particles` | `@magicui/particles` | Celebration effects |
| `Globe` | `@magicui/globe` | Marketing page hero |
| `Bento Grid` | `@magicui/bento-grid` | Feature showcase |
| `Dock` | `@magicui/dock` | Quick actions bar |
| `Magic Card` | `@magicui/magic-card` | Dashboard cards with hover |
| `Neon Gradient Card` | `@magicui/neon-gradient-card` | Highlight important info |
| `Pulsating Button` | `@magicui/pulsating-button` | New request CTA |
| `Text Animate` | `@magicui/text-animate` | Welcome messages |
| `Typing Animation` | `@magicui/typing-animation` | Onboarding |

### Component Usage by Page

#### Dashboard (`/home`)
```tsx
// AI: Use these components for the dashboard
import { Card } from "@kit/ui/card"
import { Progress } from "@kit/ui/progress"
import { NumberTicker } from "@/components/ui/number-ticker" // MagicUI
import { MagicCard } from "@/components/ui/magic-card" // MagicUI
import { AnimatedList } from "@/components/ui/animated-list" // MagicUI

// Leave balance cards with magic hover effect
// Number ticker for remaining days
// Animated list for recent activity
```

#### Leave Request Form (`/home/leave/request`)
```tsx
// AI: Use these components for leave request
import { Calendar } from "@kit/ui/calendar"
import { Form, FormField } from "@kit/ui/form"
import { Select } from "@kit/ui/select"
import { RadioGroup } from "@kit/ui/radio-group"
import { Textarea } from "@kit/ui/textarea"
import { ShimmerButton } from "@/components/ui/shimmer-button" // MagicUI
import { Confetti } from "@/components/ui/confetti" // MagicUI - on submit success
```

#### Team Calendar (`/home/calendar`)
```tsx
// AI: Use these components for calendar view
import { Calendar } from "@kit/ui/calendar"
import { Avatar } from "@kit/ui/avatar"
import { Badge } from "@kit/ui/badge"
import { Tooltip } from "@kit/ui/tooltip"
import { BlurFade } from "@/components/ui/blur-fade" // MagicUI
```

#### Approval Queue (`/home/approvals`)
```tsx
// AI: Use these components for approvals
import { DataTable } from "@kit/ui/enhanced-data-table"
import { Button } from "@kit/ui/button"
import { Dialog } from "@kit/ui/dialog"
import { AnimatedList } from "@/components/ui/animated-list" // MagicUI
import { BorderBeam } from "@/components/ui/border-beam" // MagicUI - pending items
```

#### Admin Settings (`/home/admin/*`)
```tsx
// AI: Use these components for admin pages
import { Tabs } from "@kit/ui/tabs"
import { DataTable } from "@kit/ui/enhanced-data-table"
import { Form } from "@kit/ui/form"
import { Switch } from "@kit/ui/switch"
import { Slider } from "@kit/ui/slider"
import { Select } from "@kit/ui/select"
```

#### Marketing Page (`/`)
```tsx
// AI: Use these components for marketing/landing
import { Globe } from "@/components/ui/globe" // MagicUI
import { BentoGrid } from "@/components/ui/bento-grid" // MagicUI
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text" // MagicUI
import { Marquee } from "@/components/ui/marquee" // MagicUI - testimonials
import { ShimmerButton } from "@/components/ui/shimmer-button" // MagicUI
```

### Styling Guidelines

> **AI Instructions**: Follow these styling patterns consistently.

```tsx
// Badge variants for leave status
<Badge variant="default">Pending</Badge>      // Yellow/Orange
<Badge variant="success">Approved</Badge>     // Green
<Badge variant="destructive">Rejected</Badge> // Red
<Badge variant="secondary">Cancelled</Badge>  // Gray
<Badge variant="outline">Draft</Badge>        // Outline

// Leave type colors (use in cards and calendar)
const leaveTypeColors = {
  vacation: "#3B82F6",      // Blue
  sick: "#EF4444",          // Red
  child_sick: "#F97316",    // Orange
  maternity: "#EC4899",     // Pink
  parental: "#8B5CF6",      // Purple
  care: "#14B8A6",          // Teal
  special: "#F59E0B",       // Amber
  overtime: "#6366F1",      // Indigo
  education: "#10B981",     // Emerald
  unpaid: "#6B7280",        // Gray
}

// Card hover effect with MagicUI
<MagicCard className="cursor-pointer">
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</MagicCard>
```

---

## Phase 1: Infrastructure Setup

### 1.1 Initialize Cloudflare Resources

```bash
# Create D1 database
wrangler d1 create zeitpal-db

# Create R2 bucket
wrangler r2 bucket create zeitpal-storage
```

### 1.2 Create `wrangler.toml`

**File:** `/apps/web/wrangler.toml`

```toml
name = "zeitpal"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[[d1_databases]]
binding = "DB"
database_name = "zeitpal-db"
database_id = "<YOUR_DB_ID>"

[[r2_buckets]]
binding = "R2"
bucket_name = "zeitpal-storage"
```

### 1.3 Environment Variables

```env
# Auth.js
AUTH_SECRET=<generate-secret>
AUTH_TRUST_HOST=true
AUTH_GOOGLE_ID=<google-client-id>
AUTH_GOOGLE_SECRET=<google-secret>
AUTH_MICROSOFT_ENTRA_ID_ID=<microsoft-client-id>
AUTH_MICROSOFT_ENTRA_ID_SECRET=<microsoft-secret>
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=common
AUTH_RESEND_KEY=<resend-api-key>
AUTH_EMAIL_FROM=noreply@zeitpal.de

# Mailgun (for notifications)
MAILGUN_API_KEY=<mailgun-api-key>
MAILGUN_DOMAIN=mg.zeitpal.de

# App
NEXT_PUBLIC_SITE_URL=https://zeitpal.de
NEXT_PUBLIC_PRODUCT_NAME=ZeitPal
NEXT_PUBLIC_DEFAULT_LOCALE=de
```

---

## Phase 2: Database Schema (D1)

> **AI Instructions**: Create the full SQL schema in a single migration file. Use SQLite syntax (D1 is SQLite-based). Include all tables, indexes, and seed data for German holidays and default leave types.

### 2.1 Create Migration File

**File:** `/apps/web/migrations/0001_initial_schema.sql`

**Core Tables:**
1. `organizations` - Multi-tenant orgs with German settings (Bundesland)
2. `users` - Extended with employment details (start_date, weekly_hours)
3. `organization_members` - Role-based membership (admin/manager/employee)
4. `teams` - Team structure within orgs
5. `team_members` - Team membership with lead flag
6. `leave_types` - German leave types (Urlaub, Krankheit, etc.)
7. `leave_requests` - Leave requests with half-day support
8. `leave_approvals` - Approval workflow
9. `leave_balances` - Per-user, per-year, per-type balances
10. `public_holidays` - German holidays by Bundesland
11. `audit_logs` - Compliance audit trail
12. Auth.js tables: `accounts`, `sessions`, `verification_tokens`

**Key German Leave Types to Seed:**

| Code | German Name | English Name | Default Days | Notes |
|------|-------------|--------------|--------------|-------|
| `vacation` | Urlaub | Vacation | 30 | Standard annual leave |
| `sick` | Krankheit | Sick Leave | - | Requires AU after 3 days |
| `child_sick` | Kind krank | Child Sick | 10/child/year | Per-child limit |
| `maternity` | Mutterschutz | Maternity | Auto | 6 weeks before + 8 after |
| `parental` | Elternzeit | Parental Leave | Up to 3 years | Job protection |
| `care` | Pflegezeit | Care Leave | Up to 6 months | Family care |
| `special` | Sonderurlaub | Special Leave | Per policy | Wedding, bereavement |
| `overtime` | Überstundenabbau | Overtime Comp | - | Time in lieu |
| `education` | Bildungsurlaub | Education Leave | 5/year | State-dependent |
| `unpaid` | Unbezahlter Urlaub | Unpaid Leave | - | No deduction |

---

## Phase 3: Auth.js Integration

> **AI Instructions**: This is the critical path. Remove all Supabase auth dependencies and replace with Auth.js v5 (NextAuth). The D1Adapter connects Auth.js to Cloudflare D1. Keep the existing UI patterns but swap the underlying auth logic.

### 3.1 Replace Supabase Auth Package

**Remove:** `@kit/supabase` package dependency on auth

**Create:** `/apps/web/lib/auth/`

| File | Purpose |
|------|---------|
| `auth.config.ts` | Provider configuration |
| `auth.ts` | NextAuth instance with D1Adapter |
| `middleware.ts` | Auth middleware helper |

### 3.2 Update Middleware

**File:** `/apps/web/middleware.ts`

Replace Supabase auth checks with Auth.js:
```typescript
import { auth } from "@/lib/auth/auth";

// Replace getUser() with auth() call
const session = await auth();
if (!session?.user) {
  // redirect to sign-in
}
```

### 3.3 Update Auth Pages

| Route | Changes |
|-------|---------|
| `/auth/sign-in/page.tsx` | OAuth buttons (Google, Microsoft) + Magic Link form |
| `/auth/sign-up/page.tsx` | Redirect to sign-in (OAuth handles creation) |
| `/auth/verify/page.tsx` | Magic link verification |
| `/api/auth/[...nextauth]/route.ts` | Auth.js API handler |

---

## Phase 4: Core Application Routes

> **AI Instructions**: Follow the existing MakerKit route patterns. Use route groups for organization. Each page should use `withI18n()` wrapper. Protected routes are automatically handled by middleware. Use the Page/PageHeader/PageBody pattern from `@kit/ui/page`.

### 4.1 New Route Structure

```
/home/
├── page.tsx                    # Dashboard with leave balance overview
├── leave/
│   ├── page.tsx               # My leave overview
│   ├── request/page.tsx       # New leave request form
│   ├── [requestId]/page.tsx   # Request details
│   └── history/page.tsx       # Leave history
├── calendar/
│   └── page.tsx               # Team calendar view
├── approvals/
│   └── page.tsx               # Manager approval queue
├── team/
│   └── page.tsx               # Team members view
└── admin/
    ├── organization/page.tsx  # Org settings + Bundesland
    ├── members/page.tsx       # User management + invites
    ├── teams/page.tsx         # Team management
    ├── leave-types/page.tsx   # Configure leave types
    ├── policies/page.tsx      # Leave policies + carryover
    ├── holidays/page.tsx      # Public holidays management
    ├── approvals/page.tsx     # Approval workflow config
    └── reports/page.tsx       # Export + analytics
```

### 4.2 Navigation Config Update

**File:** `/apps/web/config/navigation.config.tsx`

Add new routes with icons:
- `Calendar` - Team calendar
- `ClipboardList` - Leave requests
- `CheckSquare` - Approvals (managers only)
- `Users` - Team view
- `Settings2` - Admin (admins only)

---

## Phase 5: API Routes

> **AI Instructions**: All API routes must use edge runtime for Cloudflare compatibility. Access D1 via the `env.DB` binding from `getRequestContext()`. Use Zod schemas for request validation. Return proper JSON responses with status codes.

### 5.1 API Structure

```
/api/
├── auth/[...nextauth]/route.ts
├── organizations/
│   ├── route.ts              # GET (list), POST (create)
│   └── [orgId]/
│       ├── route.ts          # GET, PATCH, DELETE
│       ├── members/route.ts  # GET, POST members
│       └── invite/route.ts   # POST invite email
├── teams/route.ts
├── leave-requests/
│   ├── route.ts              # GET (list), POST (create)
│   └── [requestId]/
│       ├── route.ts          # GET, PATCH, DELETE
│       ├── approve/route.ts  # POST
│       └── reject/route.ts   # POST
├── leave-types/route.ts
├── leave-balances/route.ts
├── holidays/route.ts
├── calendar/route.ts         # Team calendar events
├── exports/
│   ├── csv/route.ts
│   └── excel/route.ts
└── uploads/
    └── sick-note/route.ts    # R2 upload
```

### 5.2 Key API Patterns

All API routes must:
1. Use `export const runtime = "edge"`
2. Verify auth with `await auth()`
3. Access D1 via `env.DB` binding
4. Return proper error responses

---

## Phase 6: Key Components

> **AI Instructions**: Build components using React Hook Form + Zod for forms. Use TanStack React Query for data fetching. Follow the existing component patterns in `/packages/ui`. Place page-specific components in `_components` folders. Use the shadcn and MagicUI components specified in the UI Components section.

### 6.1 Leave Request Form

**File:** `/apps/web/app/home/leave/_components/leave-request-form.tsx`

Features:
- Leave type selector with balance preview
- Date range picker (Calendar component)
- Half-day support (morning/afternoon)
- Work days calculation (excludes weekends + holidays)
- Reason textarea
- File upload for sick notes (Krankheit)

### 6.2 Leave Balance Card

**File:** `/apps/web/app/home/leave/_components/leave-balance-card.tsx`

Display:
- Annual entitlement + carryover
- Used / Pending / Remaining
- Progress bar visualization
- Carryover expiry warning

### 6.3 Team Calendar

**File:** `/apps/web/app/home/calendar/_components/team-calendar.tsx`

Features:
- Monthly grid view
- Team member absences with colors
- Public holiday display
- Weekend highlighting
- Filter by team

### 6.4 Approval Queue

**File:** `/apps/web/app/home/approvals/_components/approval-list.tsx`

Features:
- Pending requests list
- Quick approve/reject actions
- Comment on rejection
- Request details modal

---

## Phase 7: Configurable Approval Workflow

> **AI Instructions**: The approval system should be flexible. Store conditions as JSON in the database. When a leave request is created, evaluate all active rules to determine the approval chain. Support team lead, manager, HR, or specific user as approvers.

### 7.1 Approval Rules Table

**Add to schema:**
```sql
CREATE TABLE approval_rules (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,

    -- Conditions (JSON)
    conditions TEXT NOT NULL DEFAULT '{}',
    -- e.g., {"leave_type": ["vacation"], "days_threshold": 5}

    -- Approvers (ordered)
    approver_type TEXT NOT NULL, -- 'team_lead', 'manager', 'hr', 'specific_user'
    approver_user_id TEXT REFERENCES users(id), -- if specific_user

    -- Order in workflow
    level INTEGER NOT NULL DEFAULT 1,

    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 7.2 Admin UI for Approval Configuration

**File:** `/apps/web/app/home/admin/approvals/page.tsx`

Features:
- Create/edit approval rules
- Set conditions (leave type, duration threshold)
- Define approver chain (team lead → HR)
- Enable/disable rules

### 7.3 Approval Logic

**File:** `/apps/web/lib/services/approval-workflow.service.ts`

```typescript
// Determine approvers based on rules
async function getApproversForRequest(request: LeaveRequest): Promise<Approver[]> {
  const rules = await getActiveRules(request.organizationId);
  const matchingRules = rules.filter(rule => matchesConditions(rule, request));
  return matchingRules.map(rule => resolveApprover(rule, request));
}
```

---

## Phase 8: Email Notifications (Mailgun)

> **AI Instructions**: Use Mailgun's Node.js SDK. Create React Email templates for consistent styling. Queue emails asynchronously to avoid blocking requests. Include unsubscribe links for GDPR compliance.

### 8.1 Mailgun Service

**File:** `/apps/web/lib/services/email.service.ts`

```typescript
import Mailgun from 'mailgun.js';

const mg = new Mailgun(formData).client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
});

export async function sendEmail(to: string, subject: string, html: string) {
  return mg.messages.create(process.env.MAILGUN_DOMAIN!, {
    from: 'ZeitPal <noreply@zeitpal.de>',
    to,
    subject,
    html,
  });
}
```

### 8.2 Email Templates

**File:** `/apps/web/lib/emails/templates/`

| Template | Trigger |
|----------|---------|
| `leave-request-submitted.tsx` | Employee submits request |
| `leave-request-approved.tsx` | Manager approves |
| `leave-request-rejected.tsx` | Manager rejects |
| `leave-reminder.tsx` | Carryover expiry warning |
| `team-absence-notification.tsx` | Team member out |
| `invite.tsx` | User invited to org |

### 8.3 Notification Settings

**Per-user preferences:**
- Email on approval/rejection
- Daily digest vs. immediate
- Team absence notifications

---

## Phase 9: Onboarding Flow

> **AI Instructions**: Use MagicUI components for a polished onboarding experience. The MultiStepForm component from `@kit/ui` is perfect for the wizard. Check if user has an organization on login - if not, redirect to onboarding.

### 9.1 New User Options

**File:** `/apps/web/app/onboarding/page.tsx`

After first login, user sees:
1. **Create Organization** - For admins starting fresh
2. **Join via Invite Code** - For employees with invite

### 9.2 Create Organization Flow

**File:** `/apps/web/app/onboarding/_components/create-org-wizard.tsx`

Steps:
1. Organization name + slug
2. Select Bundesland (for holidays)
3. Configure default leave policy
4. Invite first team members (optional)

### 9.3 Join via Invite

**File:** `/apps/web/app/invite/[token]/page.tsx`

- Validate invite token
- Show organization name
- Accept to join
- Redirect to dashboard

---

## Phase 10: German Compliance Features

> **AI Instructions**: German labor law compliance is critical. The minimum annual leave is 20 days (5-day week) or 24 days (6-day week). Carryover must expire by March 31 of the following year. Sick leave requires a doctor's note (AU) after 3 days. Pre-seed all 16 Bundesländer holidays for 2024-2026.

### 10.1 Public Holidays by Bundesland

**File:** `/apps/web/lib/utils/german-holidays.ts`

16 German states with different holidays:

| State Code | State Name | Extra Holidays |
|------------|------------|----------------|
| BW | Baden-Württemberg | Epiphany, Corpus Christi, All Saints |
| BY | Bayern | Epiphany, Corpus Christi, Assumption, All Saints |
| BE | Berlin | Women's Day |
| BB | Brandenburg | Reformation Day |
| HB | Bremen | Reformation Day |
| HH | Hamburg | Reformation Day |
| HE | Hessen | Corpus Christi |
| MV | Mecklenburg-Vorpommern | Reformation Day |
| NI | Niedersachsen | Reformation Day |
| NW | Nordrhein-Westfalen | Corpus Christi, All Saints |
| RP | Rheinland-Pfalz | Corpus Christi, All Saints |
| SL | Saarland | Corpus Christi, Assumption, All Saints |
| SN | Sachsen | Reformation Day, Repentance Day |
| ST | Sachsen-Anhalt | Epiphany, Reformation Day |
| SH | Schleswig-Holstein | Reformation Day |
| TH | Thüringen | Reformation Day, Children's Day |

### 10.2 Leave Calculations

**File:** `/apps/web/lib/utils/leave-calculations.ts`

Functions:
- `calculateWorkDays(start, end, holidays)` - Exclude weekends + holidays
- `calculateProRata(startDate, annualDays)` - For new hires
- `calculatePartTimeProRata(weeklyHours, fullTimeDays)` - Part-time adjustment
- `calculateCarryover(balance, maxDays, expiryDate)` - Carryover rules

### 10.3 Sick Leave Specifics

- 3-day threshold for AU requirement
- 6-week continuous tracking per illness
- Document upload to R2
- eAU integration ready (future)

---

## Phase 11: i18n (German + English)

> **AI Instructions**: The project uses react-i18next with the existing setup in `@kit/i18n`. Add German translations for all new strings. Use the `t()` function and `Trans` component. Date formatting should use `date-fns` with German locale.

### 11.1 Translation Files

**Files:** `/apps/web/public/locales/{en,de}/`

| File | Content |
|------|---------|
| `common.json` | Shared strings |
| `leave.json` | Leave-specific terms |
| `admin.json` | Admin panel strings |

### 11.2 Key German Terms

```json
{
  "leaveTypes": {
    "vacation": "Urlaub",
    "sick": "Krankheit",
    "childSick": "Kind krank",
    "maternity": "Mutterschutz",
    "parental": "Elternzeit",
    "care": "Pflegezeit",
    "special": "Sonderurlaub",
    "overtime": "Überstundenabbau",
    "education": "Bildungsurlaub",
    "unpaid": "Unbezahlter Urlaub"
  }
}
```

---

## Phase 12: Export Functionality

> **AI Instructions**: CSV export should work in edge runtime (no Node.js fs). Use the `xlsx` library for Excel exports. Stream large exports to avoid memory issues. Include proper German date formatting and UTF-8 BOM for Excel compatibility.

### 12.1 CSV Export

**File:** `/apps/web/app/api/exports/csv/route.ts`

Export user leave data:
- Date range filter
- Leave type filter
- Columns: Date, Type, Days, Status

### 12.2 Excel Export

**File:** `/apps/web/app/api/exports/excel/route.ts`

Use `xlsx` library for:
- Formatted spreadsheet
- Summary sheet
- Detail sheet
- Styling

---

## Phase 13: Deployment

> **AI Instructions**: Use `@cloudflare/next-on-pages` for the build. Ensure all routes use edge runtime. Test locally with `wrangler pages dev`. Set all environment variables in Cloudflare Pages dashboard. D1 and R2 bindings are configured in `wrangler.toml`.

### 13.1 Build Configuration

**File:** `/apps/web/next.config.mjs`

Add for Cloudflare Pages:
```javascript
experimental: {
  runtime: 'edge',
}
```

### 13.2 Deploy Commands

```bash
# Run D1 migrations
wrangler d1 execute zeitpal-db --file=./migrations/0001_initial_schema.sql

# Build for Cloudflare
pnpm build

# Deploy to Pages
wrangler pages deploy .vercel/output/static
```

---

## Critical Files to Modify

| File | Changes |
|------|---------|
| `/apps/web/middleware.ts` | Replace Supabase with Auth.js |
| `/apps/web/config/navigation.config.tsx` | Add leave routes |
| `/apps/web/config/paths.config.ts` | Add new path constants |
| `/apps/web/package.json` | Add next-auth, xlsx deps |
| `/packages/supabase/` | Remove or repurpose |

## New Packages to Create

| Package | Purpose |
|---------|---------|
| `@kit/d1` | D1 database client + utilities |
| `@kit/r2` | R2 storage client |
| `@kit/leave` | Leave management logic |

## Dependencies to Add

```json
{
  "next-auth": "^5.0.0-beta.25",
  "@auth/d1-adapter": "^1.0.0",
  "xlsx": "^0.18.5",
  "@cloudflare/next-on-pages": "^1.13.0",
  "mailgun.js": "^10.2.0",
  "form-data": "^4.0.0"
}
```

---

## Implementation Order

1. **Phase 1-2**: Cloudflare setup + D1 schema
2. **Phase 3**: Auth.js integration (critical path)
3. **Phase 4-5**: Routes + API structure
4. **Phase 6**: Core UI components
5. **Phase 7**: Configurable approval workflow
6. **Phase 8**: Email notifications (Mailgun)
7. **Phase 9**: Onboarding flow
8. **Phase 10**: German compliance logic
9. **Phase 11**: i18n translations
10. **Phase 12-13**: Export + Deployment

---

## Estimated Scope

- ~60 new files
- ~15 modified files
- Complete replacement of auth system
- New database schema
- Email notification system
- Configurable workflows

---

## Checklist

### Phase 1-2: Infrastructure
- [ ] Create Cloudflare account
- [ ] Run `wrangler d1 create zeitpal-db`
- [ ] Run `wrangler r2 bucket create zeitpal-storage`
- [ ] Create `wrangler.toml`
- [ ] Create D1 migration file
- [ ] Seed German holidays
- [ ] Seed default leave types

### Phase 3: Auth.js
- [ ] Install next-auth and @auth/d1-adapter
- [ ] Create auth configuration files
- [ ] Update middleware
- [ ] Update sign-in page
- [ ] Configure OAuth providers (Google, Microsoft)
- [ ] Set up magic link with Resend

### Phase 4-5: Routes & API
- [ ] Create route structure
- [ ] Update navigation config
- [ ] Implement organization API
- [ ] Implement team API
- [ ] Implement leave request API
- [ ] Implement leave balance API
- [ ] Implement calendar API

### Phase 6: Components
- [ ] Leave request form
- [ ] Leave balance card
- [ ] Team calendar
- [ ] Approval queue

### Phase 7-9: Workflows
- [ ] Approval rules table
- [ ] Approval configuration UI
- [ ] Mailgun integration
- [ ] Email templates
- [ ] Onboarding wizard
- [ ] Invite flow

### Phase 10-11: Compliance & i18n
- [ ] German holidays data
- [ ] Leave calculation utilities
- [ ] German translations
- [ ] English translations

### Phase 12-13: Export & Deploy
- [ ] CSV export
- [ ] Excel export
- [ ] Build configuration
- [ ] Deploy to Cloudflare Pages

---

## AI Implementation Quick Reference

> **Summary of patterns and conventions for AI implementation**

### File Naming Conventions
```
Components:     kebab-case.tsx      (leave-request-form.tsx)
Hooks:          use-*.ts            (use-leave-balance.ts)
Services:       *.service.ts        (email.service.ts)
Schemas:        *.schema.ts         (leave-request.schema.ts)
Utils:          kebab-case.ts       (leave-calculations.ts)
API Routes:     route.ts            (always)
Pages:          page.tsx            (always)
Layouts:        layout.tsx          (always)
```

### Import Patterns
```tsx
// Kit UI (shadcn)
import { Button } from "@kit/ui/button"
import { Card, CardHeader, CardContent } from "@kit/ui/card"
import { Form, FormField, FormItem } from "@kit/ui/form"

// MagicUI (after installing)
import { NumberTicker } from "@/components/ui/number-ticker"
import { MagicCard } from "@/components/ui/magic-card"

// Internal
import { LeaveRequestForm } from "./_components/leave-request-form"
import { useLeaveBalance } from "@/lib/hooks/use-leave-balance"
```

### Page Template
```tsx
// /apps/web/app/home/leave/page.tsx
import { PageBody, PageHeader } from "@kit/ui/page";
import { withI18n } from "~/lib/i18n/with-i18n";
import { Trans } from "@kit/i18n/trans";

function LeavePage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey="leave:title" />}
        description={<Trans i18nKey="leave:description" />}
      />
      <PageBody>
        {/* Content */}
      </PageBody>
    </>
  );
}

export default withI18n(LeavePage);
```

### API Route Template
```tsx
// /apps/web/app/api/leave-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

export const runtime = "edge";

const createSchema = z.object({
  leaveTypeId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { env } = getRequestContext();
  const db = env.DB;

  const results = await db
    .prepare("SELECT * FROM leave_requests WHERE user_id = ?")
    .bind(session.user.id)
    .all();

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { env } = getRequestContext();
  // ... create record

  return NextResponse.json({ id: "..." }, { status: 201 });
}
```

### React Query Hook Template
```tsx
// /apps/web/lib/hooks/use-leave-requests.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useLeaveRequests(organizationId: string) {
  return useQuery({
    queryKey: ["leave-requests", organizationId],
    queryFn: async () => {
      const res = await fetch(`/api/leave-requests?orgId=${organizationId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeaveRequestInput) => {
      const res = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
    },
  });
}
```

### Form Template
```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@kit/ui/form";
import { Input } from "@kit/ui/input";
import { Button } from "@kit/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button"; // MagicUI

const schema = z.object({
  name: z.string().min(1, "Required"),
});

type FormData = z.infer<typeof schema>;

export function MyForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (data: FormData) => {
    // Handle submit
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <ShimmerButton type="submit">Submit</ShimmerButton>
      </form>
    </Form>
  );
}
```

### D1 Database Patterns
```typescript
// Get D1 binding in edge runtime
import { getRequestContext } from "@cloudflare/next-on-pages";

const { env } = getRequestContext();
const db = env.DB;

// Select
const user = await db
  .prepare("SELECT * FROM users WHERE id = ?")
  .bind(userId)
  .first();

// Select all
const users = await db
  .prepare("SELECT * FROM users WHERE organization_id = ?")
  .bind(orgId)
  .all();

// Insert
const id = crypto.randomUUID();
await db
  .prepare("INSERT INTO users (id, email, name) VALUES (?, ?, ?)")
  .bind(id, email, name)
  .run();

// Update
await db
  .prepare("UPDATE users SET name = ? WHERE id = ?")
  .bind(name, id)
  .run();

// Delete
await db
  .prepare("DELETE FROM users WHERE id = ?")
  .bind(id)
  .run();

// Transaction (batch)
await db.batch([
  db.prepare("INSERT INTO ...").bind(...),
  db.prepare("UPDATE ...").bind(...),
]);
```

### Key Files Reference
```
/apps/web/
├── middleware.ts                    # Auth middleware (update for Auth.js)
├── lib/
│   ├── auth/auth.ts                # Auth.js configuration
│   ├── auth/auth.config.ts         # Providers config
│   └── i18n/with-i18n.tsx          # i18n wrapper (existing)
├── config/
│   ├── navigation.config.tsx       # Add new routes
│   └── paths.config.ts             # Add path constants
└── app/
    ├── api/auth/[...nextauth]/     # Auth.js handler
    └── home/                        # Protected routes
```

### MagicUI Installation Commands
```bash
# Essential for dashboard
pnpm dlx shadcn@latest add @magicui/number-ticker
pnpm dlx shadcn@latest add @magicui/magic-card
pnpm dlx shadcn@latest add @magicui/animated-list

# For forms and CTAs
pnpm dlx shadcn@latest add @magicui/shimmer-button
pnpm dlx shadcn@latest add @magicui/confetti

# For marketing page
pnpm dlx shadcn@latest add @magicui/globe
pnpm dlx shadcn@latest add @magicui/bento-grid
pnpm dlx shadcn@latest add @magicui/animated-gradient-text

# For polish
pnpm dlx shadcn@latest add @magicui/blur-fade
pnpm dlx shadcn@latest add @magicui/border-beam
```
