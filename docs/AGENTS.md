# ZeitPal Development Guidelines for AI Agents

> **Purpose**: This document ensures consistent, high-quality code across all AI-assisted development. Follow these practices strictly.

---

## Core Principles

1. **Read Before Write** - Always read existing code before modifying. Understand patterns first.
2. **Minimal Changes** - Make the smallest change that solves the problem. Avoid over-engineering.
3. **Test Your Work** - Verify changes work before marking complete.
4. **Security First** - Never introduce vulnerabilities. Validate all inputs.
5. **Consistency** - Follow existing patterns in the codebase.
6. **DRY (Don't Repeat Yourself)** - Extract repeated code into reusable functions, hooks, or components.
7. **Document in `/docs`** - When implementing new features or significant changes that require documentation, store that documentation in the `/docs` folder. Keep implementation details, architectural decisions, and feature documentation centralized there.

---

## DRY Principle (Don't Repeat Yourself)

> Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.

### Identifying Repetition

```typescript
// ❌ BAD: Same logic repeated in multiple places
// file: leave-request-form.tsx
const workDays = calculateWorkDays(startDate, endDate, holidays);
const isValid = workDays > 0 && workDays <= balance.remaining;

// file: leave-calendar.tsx
const workDays = calculateWorkDays(startDate, endDate, holidays);
const isValid = workDays > 0 && workDays <= balance.remaining;

// ✅ GOOD: Extract to a reusable hook
// file: use-leave-validation.ts
export function useLeaveValidation(startDate: string, endDate: string) {
  const { data: holidays } = useHolidays();
  const { data: balance } = useLeaveBalance();

  const workDays = useMemo(
    () => calculateWorkDays(startDate, endDate, holidays ?? []),
    [startDate, endDate, holidays]
  );

  const isValid = workDays > 0 && workDays <= (balance?.remaining ?? 0);

  return { workDays, isValid };
}
```

### Where to Apply DRY

| Repeated Code | Extract To | Location |
|---------------|------------|----------|
| API fetch logic | React Query hooks | `/lib/hooks/use-*.ts` |
| Form validation | Zod schemas | `/lib/schemas/*.schema.ts` |
| Date calculations | Utility functions | `/lib/utils/*.ts` |
| UI patterns | Reusable components | `/app/**/_components/` or `@kit/ui` |
| Type definitions | Shared types | `/lib/types/*.ts` |
| Constants | Config files | `/config/*.ts` |
| Database queries | Service functions | `/lib/services/*.service.ts` |

### Component Extraction

```typescript
// ❌ BAD: Repeated card structure across pages
// page1.tsx
<Card>
  <CardHeader>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
      <CardTitle>{type.name}</CardTitle>
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">{balance.remaining}</div>
    <Progress value={usedPercentage} />
  </CardContent>
</Card>

// page2.tsx - Same structure repeated!

// ✅ GOOD: Extract to reusable component
// _components/leave-balance-card.tsx
interface LeaveBalanceCardProps {
  leaveType: LeaveType;
  balance: LeaveBalance;
}

export function LeaveBalanceCard({ leaveType, balance }: LeaveBalanceCardProps) {
  const usedPercentage = (balance.used / balance.total) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: leaveType.color }}
          />
          <CardTitle>{leaveType.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{balance.remaining}</div>
        <Progress value={usedPercentage} />
      </CardContent>
    </Card>
  );
}
```

### Schema Reuse

```typescript
// ❌ BAD: Duplicate validation logic
// create-leave-request.ts
const schema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// update-leave-request.ts
const schema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// ✅ GOOD: Shared schema building blocks
// /lib/schemas/common.schema.ts
export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format');

export const dateRangeSchema = z.object({
  startDate: dateString,
  endDate: dateString,
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: 'End date must be after start date' }
);

// /lib/schemas/leave-request.schema.ts
import { dateRangeSchema } from './common.schema';

export const createLeaveRequestSchema = dateRangeSchema.extend({
  leaveTypeId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

export const updateLeaveRequestSchema = createLeaveRequestSchema.partial();
```

### Constants & Configuration

```typescript
// ❌ BAD: Magic numbers scattered across codebase
if (sickDays > 3) { /* require AU */ }
if (carryoverDays > 5) { /* warn user */ }
if (remainingDays < 5) { /* show warning */ }

// ✅ GOOD: Centralized configuration
// /config/leave-policy.config.ts
export const LEAVE_POLICY = {
  SICK_LEAVE: {
    DAYS_BEFORE_AU_REQUIRED: 3,
    MAX_CONTINUOUS_WEEKS: 6,
  },
  CARRYOVER: {
    MAX_DAYS: 5,
    EXPIRY_MONTH: 3, // March
    EXPIRY_DAY: 31,
  },
  WARNINGS: {
    LOW_BALANCE_THRESHOLD: 5,
  },
} as const;

// Usage
import { LEAVE_POLICY } from '@/config/leave-policy.config';

if (sickDays > LEAVE_POLICY.SICK_LEAVE.DAYS_BEFORE_AU_REQUIRED) {
  // require AU
}
```

### API Response Formatting

```typescript
// ❌ BAD: Repeated response handling
// route1.ts
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// route2.ts
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// ✅ GOOD: Shared response helpers
// /lib/api/responses.ts
export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message, code: 'UNAUTHORIZED' }, { status: 401 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, code: 'BAD_REQUEST', details }, { status: 400 });
}

export function notFound(resource = 'Resource') {
  return NextResponse.json({ error: `${resource} not found`, code: 'NOT_FOUND' }, { status: 404 });
}

export function success<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

// Usage
import { unauthorized, badRequest, success } from '@/lib/api/responses';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const data = await fetchData();
  return success(data);
}
```

### When NOT to Apply DRY

DRY is not about eliminating all duplication. Sometimes duplication is acceptable:

```typescript
// ✅ OK to duplicate: Simple, self-contained logic that might evolve differently
// Admin form validation (stricter)
const adminSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'employee']),
});

// Public signup validation (different rules)
const signupSchema = z.object({
  email: z.string().email(),
  acceptTerms: z.literal(true),
});

// These look similar but serve different purposes and may diverge
```

**Don't apply DRY when:**
- The "duplication" is coincidental, not conceptual
- Extracting would create tight coupling between unrelated features
- The abstraction would be harder to understand than the duplication
- You're prematurely optimizing before patterns emerge

### Rule of Three

> Before extracting, wait until you see the pattern **three times**:
> 1. First occurrence: Just write it
> 2. Second occurrence: Note the duplication, consider if it's coincidental
> 3. Third occurrence: Now extract to a shared abstraction

---

## Code Quality Standards

### TypeScript Best Practices

```typescript
// ✅ DO: Use explicit types
interface LeaveRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
}

type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// ❌ DON'T: Use `any` type
function processRequest(data: any) { } // Bad

// ✅ DO: Use proper typing
function processRequest(data: LeaveRequest): Promise<void> { }
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (components) | kebab-case | `leave-request-form.tsx` |
| Files (hooks) | camelCase with use- prefix | `useLeaveBalance.ts` |
| Files (utils) | kebab-case | `date-calculations.ts` |
| Components | PascalCase | `LeaveRequestForm` |
| Functions | camelCase | `calculateWorkDays` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_LEAVE_DAYS` |
| Types/Interfaces | PascalCase | `LeaveRequest` |
| Database tables | snake_case | `leave_requests` |
| API routes | kebab-case | `/api/leave-requests` |

### Code Organization

```
// Component file structure
leave-request-form.tsx
├── Imports (external libraries first, then internal)
├── Types/Interfaces
├── Constants
├── Helper functions (if small, otherwise separate file)
├── Component definition
└── Export
```

```typescript
// ✅ Correct import order
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 3. Internal packages (@kit/*)
import { Button } from '@kit/ui/button';
import { Form } from '@kit/ui/form';

// 4. Local imports (relative)
import { useLeaveBalance } from '@/lib/hooks/use-leave-balance';
import { LeaveTypeSelect } from './_components/leave-type-select';
```

---

## Security Guidelines

### Input Validation

```typescript
// ✅ ALWAYS validate user input with Zod
const createLeaveRequestSchema = z.object({
  leaveTypeId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(500).optional(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: "End date must be after start date" }
);

// ✅ Validate in API routes
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createLeaveRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Use parsed.data - it's now type-safe
}
```

### SQL Injection Prevention

```typescript
// ✅ ALWAYS use parameterized queries
const user = await db
  .prepare("SELECT * FROM users WHERE id = ?")
  .bind(userId)
  .first();

// ❌ NEVER concatenate user input into SQL
const user = await db
  .prepare(`SELECT * FROM users WHERE id = '${userId}'`) // DANGEROUS!
  .first();
```

### Authentication & Authorization

```typescript
// ✅ ALWAYS check authentication
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Continue with authenticated user
}

// ✅ ALWAYS check authorization (user can only access their own data)
const leaveRequest = await db
  .prepare("SELECT * FROM leave_requests WHERE id = ? AND user_id = ?")
  .bind(requestId, session.user.id)
  .first();

if (!leaveRequest) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

### Environment Files

**Never commit `.env` files to version control.** These files contain secrets and credentials.

```bash
# ✅ Files that SHOULD be committed (templates without real values)
.env.example
.env.local.example

# ❌ Files that should NEVER be committed
.env
.env.local
.env.development
.env.production
```

These are already in `.gitignore`, but always verify before committing:
- API keys
- Database credentials
- OAuth secrets
- Encryption keys
- Any sensitive configuration

### Sensitive Data Handling

```typescript
// ✅ Never log sensitive data
console.log('Processing request for user:', userId); // OK
console.log('User data:', userData); // BAD - might contain PII

// ✅ Never expose internal errors to users
try {
  await processRequest();
} catch (error) {
  console.error('Internal error:', error); // Log for debugging
  return NextResponse.json(
    { error: 'An error occurred' }, // Generic message to user
    { status: 500 }
  );
}

// ✅ Sanitize data before returning
const sanitizedUser = {
  id: user.id,
  name: user.name,
  email: user.email,
  // Don't include: passwordHash, internalNotes, etc.
};
```

---

## Error Handling

### API Routes

```typescript
// ✅ Consistent error response format
interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

// ✅ Use try-catch with proper error handling
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiError>(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiError>(
        { error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await createLeaveRequest(parsed.data);
    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Failed to create leave request:', error);
    return NextResponse.json<ApiError>(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

### Client-Side Error Handling

```typescript
// ✅ Use React Query error handling
const { data, error, isLoading } = useQuery({
  queryKey: ['leave-requests'],
  queryFn: fetchLeaveRequests,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

// ✅ Show user-friendly error messages
if (error) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error loading leave requests</AlertTitle>
      <AlertDescription>
        Please try again later or contact support if the problem persists.
      </AlertDescription>
    </Alert>
  );
}
```

---

## Performance Guidelines

### Database Queries

```typescript
// ✅ Select only needed columns
const users = await db
  .prepare("SELECT id, name, email FROM users WHERE organization_id = ?")
  .bind(orgId)
  .all();

// ❌ Don't select everything if not needed
const users = await db
  .prepare("SELECT * FROM users WHERE organization_id = ?")
  .bind(orgId)
  .all();

// ✅ Use pagination for large datasets
const PAGE_SIZE = 20;
const offset = (page - 1) * PAGE_SIZE;

const results = await db
  .prepare(`
    SELECT * FROM leave_requests
    WHERE organization_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `)
  .bind(orgId, PAGE_SIZE, offset)
  .all();

// ✅ Use indexes for frequently queried columns
// Ensure indexes exist in migration:
// CREATE INDEX idx_leave_requests_user ON leave_requests(user_id);
// CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
```

### React Performance

```typescript
// ✅ Use React.memo for expensive components
const LeaveCalendar = React.memo(function LeaveCalendar({ events }: Props) {
  // Expensive rendering
});

// ✅ Use useMemo for expensive calculations
const workDays = useMemo(() => {
  return calculateWorkDays(startDate, endDate, holidays);
}, [startDate, endDate, holidays]);

// ✅ Use useCallback for event handlers passed to children
const handleApprove = useCallback((requestId: string) => {
  approveMutation.mutate(requestId);
}, [approveMutation]);

// ✅ Avoid creating objects/arrays in render
// ❌ Bad - creates new array every render
<Select options={[{ value: '1', label: 'One' }]} />

// ✅ Good - stable reference
const OPTIONS = [{ value: '1', label: 'One' }];
<Select options={OPTIONS} />
```

### Data Fetching

```typescript
// ✅ Use React Query for caching and deduplication
const { data } = useQuery({
  queryKey: ['leave-balance', userId, year],
  queryFn: () => fetchLeaveBalance(userId, year),
  staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
});

// ✅ Prefetch data for better UX
const queryClient = useQueryClient();

// Prefetch next month's calendar data
useEffect(() => {
  queryClient.prefetchQuery({
    queryKey: ['calendar', nextMonth],
    queryFn: () => fetchCalendarEvents(nextMonth),
  });
}, [currentMonth]);
```

---

## Testing Guidelines

### What to Test

| Priority | What | Why |
|----------|------|-----|
| High | API routes | Business logic, auth, validation |
| High | Utility functions | Calculations, date handling |
| Medium | React hooks | Data fetching logic |
| Medium | Form validation | User input handling |
| Lower | UI components | Covered by E2E tests |

### Test Structure

```typescript
// ✅ Descriptive test names
describe('calculateWorkDays', () => {
  it('should exclude weekends from the count', () => {
    const result = calculateWorkDays('2024-01-01', '2024-01-07', []);
    expect(result).toBe(5); // Mon-Fri
  });

  it('should exclude public holidays', () => {
    const holidays = ['2024-01-01']; // New Year
    const result = calculateWorkDays('2024-01-01', '2024-01-07', holidays);
    expect(result).toBe(4);
  });

  it('should handle same-day requests', () => {
    const result = calculateWorkDays('2024-01-02', '2024-01-02', []);
    expect(result).toBe(1);
  });

  it('should return 0 for weekend-only ranges', () => {
    const result = calculateWorkDays('2024-01-06', '2024-01-07', []); // Sat-Sun
    expect(result).toBe(0);
  });
});
```

### E2E Test Patterns

```typescript
// ✅ Test user flows, not implementation
test('user can submit a leave request', async ({ page }) => {
  // Login
  await page.goto('/auth/sign-in');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');

  // Navigate to leave request
  await page.goto('/home/leave/request');

  // Fill form
  await page.selectOption('[name="leaveType"]', 'vacation');
  await page.fill('[name="startDate"]', '2024-03-01');
  await page.fill('[name="endDate"]', '2024-03-05');
  await page.fill('[name="reason"]', 'Family vacation');

  // Submit
  await page.click('button[type="submit"]');

  // Verify success
  await expect(page.locator('.toast-success')).toBeVisible();
  await expect(page).toHaveURL('/home/leave');
});
```

---

## Git & Commit Guidelines

### Commit Messages

```bash
# Format: <type>(<scope>): <description>

# Types:
feat     # New feature
fix      # Bug fix
docs     # Documentation
style    # Formatting (no code change)
refactor # Code restructuring
test     # Adding tests
chore    # Maintenance

# Examples:
feat(leave): add half-day leave support
fix(calendar): correct holiday display for Bavaria
docs(api): add leave-request endpoint documentation
refactor(auth): migrate from Supabase to Auth.js
test(utils): add tests for work day calculations
chore(deps): update next-auth to v5.0.0-beta.25
```

### Branch Naming

```bash
# Format: <type>/<description>

feature/leave-request-form
feature/team-calendar
fix/holiday-calculation
fix/auth-redirect
refactor/database-schema
docs/api-documentation
```

### Pull Request Checklist

Before submitting PR, verify:

- [ ] Code follows project conventions
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] No lint errors (`pnpm lint`)
- [ ] Tests pass (`pnpm test`)
- [ ] New features have tests
- [ ] API changes are documented
- [ ] No sensitive data in code
- [ ] No console.logs in production code
- [ ] Migrations are reversible

---

## Documentation Standards

### Documentation Location

All significant documentation must be stored in the `/docs` folder at the project root. This ensures documentation is:
- Centralized and easy to find
- Version controlled alongside the code
- Accessible to both humans and AI agents

**What goes in `/docs`:**

| Documentation Type | Filename Convention | When to Create |
|--------------------|---------------------|----------------|
| Feature documentation | `FEATURE-[name].md` | New feature implementation |
| Architecture decisions | `ADR-[number]-[title].md` | Significant architectural changes |
| API documentation | `API-[name].md` | New API endpoints or changes |
| Integration guides | `INTEGRATION-[name].md` | Third-party integrations |
| Implementation notes | `IMPLEMENTATION.md` | Complex implementation details |
| Agent guidelines | `AGENTS.md` | AI development guidelines |

**Example:** When implementing a new calendar sync feature:
```
/docs/
├── AGENTS.md                    # This file
├── IMPLEMENTATION.md            # Existing implementation notes
├── FEATURE-calendar-sync.md     # New feature documentation
└── ADR-001-calendar-provider.md # Decision record for provider choice
```

**Documentation Requirements:**
- Document the **why**, not just the **what**
- Include usage examples where applicable
- Update existing documentation when modifying features
- Cross-reference related documentation files

### Code Comments

```typescript
// ✅ Explain WHY, not WHAT
// Calculate pro-rata entitlement for employees who started mid-year
// German law requires proportional leave calculation based on months worked
function calculateProRataEntitlement(startDate: Date, annualDays: number): number {
  const monthsWorked = 12 - startDate.getMonth();
  return Math.round((annualDays / 12) * monthsWorked);
}

// ❌ Don't explain obvious code
// Loop through users
for (const user of users) {
  // Check if user is active
  if (user.isActive) {
    // Add to list
    activeUsers.push(user);
  }
}
```

### JSDoc for Public APIs

```typescript
/**
 * Calculate the number of working days between two dates.
 * Excludes weekends and public holidays.
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param holidays - Array of holiday dates in YYYY-MM-DD format
 * @returns Number of working days
 *
 * @example
 * calculateWorkDays('2024-01-01', '2024-01-07', ['2024-01-01'])
 * // Returns 4 (excludes weekend + New Year)
 */
export function calculateWorkDays(
  startDate: string,
  endDate: string,
  holidays: string[]
): number {
  // Implementation
}
```

---

## Accessibility Guidelines

### Component Accessibility

```tsx
// ✅ Use semantic HTML
<button onClick={handleClick}>Submit</button>

// ❌ Don't use divs as buttons
<div onClick={handleClick}>Submit</div>

// ✅ Include ARIA labels for icons
<Button variant="ghost" size="icon" aria-label="Approve request">
  <Check className="h-4 w-4" />
</Button>

// ✅ Use proper heading hierarchy
<h1>Leave Management</h1>
<h2>My Requests</h2>
<h3>Pending</h3>

// ✅ Provide form labels
<FormField
  control={form.control}
  name="reason"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Reason for leave</FormLabel>
      <FormControl>
        <Textarea {...field} />
      </FormControl>
      <FormDescription>
        Optional: Provide a reason for your leave request
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Keyboard Navigation

```tsx
// ✅ Ensure all interactive elements are keyboard accessible
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button> {/* Focusable by default */}
  </DialogTrigger>
  <DialogContent>
    {/* Focus trapped inside dialog */}
    {/* ESC closes dialog */}
  </DialogContent>
</Dialog>

// ✅ Add keyboard shortcuts for common actions
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## i18n Guidelines

### Translation Keys

```typescript
// ✅ Use hierarchical, descriptive keys
{
  "leave": {
    "title": "Leave Management",
    "balance": {
      "remaining": "Remaining Days",
      "used": "Used",
      "pending": "Pending Approval"
    },
    "request": {
      "submit": "Submit Request",
      "cancel": "Cancel",
      "success": "Leave request submitted successfully"
    },
    "types": {
      "vacation": "Vacation",
      "sick": "Sick Leave"
    }
  }
}

// ❌ Don't use flat, unclear keys
{
  "btn1": "Submit",
  "msg": "Success"
}
```

### Using Translations

```tsx
// ✅ Use Trans component for JSX
import { Trans } from '@kit/i18n/trans';

<Trans i18nKey="leave:balance.remaining" />

// ✅ Use useTranslation hook for dynamic values
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('leave');
const message = t('request.daysSelected', { count: selectedDays });

// ✅ Handle pluralization
{
  "request": {
    "daysSelected": "{{count}} day selected",
    "daysSelected_plural": "{{count}} days selected"
  }
}
```

---

## File Checklist

Before completing any file, verify:

### Components
- [ ] Has proper TypeScript types
- [ ] Uses correct import order
- [ ] Has loading and error states
- [ ] Is accessible (ARIA, keyboard nav)
- [ ] Uses translations for user-facing text
- [ ] Follows existing UI patterns

### API Routes
- [ ] Has `export const runtime = "edge"`
- [ ] Validates authentication
- [ ] Validates input with Zod
- [ ] Uses parameterized queries
- [ ] Has proper error handling
- [ ] Returns consistent response format

### Database Migrations
- [ ] Uses SQLite/D1 syntax
- [ ] Includes necessary indexes
- [ ] Has seed data where needed
- [ ] Is idempotent (can run multiple times)

### Hooks
- [ ] Follows `use-` prefix convention
- [ ] Has proper TypeScript return types
- [ ] Handles loading/error states
- [ ] Uses React Query correctly

---

## Quick Reference

### Common Patterns

```typescript
// Auth check in API route
const session = await auth();
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// D1 database access
const { env } = getRequestContext();
const db = env.DB;

// Zod validation
const parsed = schema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error }, { status: 400 });
}

// React Query mutation with invalidation
const mutation = useMutation({
  mutationFn: createLeaveRequest,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    toast.success(t('leave:request.success'));
  },
  onError: () => {
    toast.error(t('common:error.generic'));
  },
});
```

### Response Status Codes

| Code | When to Use |
|------|-------------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (created) |
| 204 | Successful DELETE (no content) |
| 400 | Invalid input / validation error |
| 401 | Not authenticated |
| 403 | Not authorized (authenticated but not allowed) |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate) |
| 500 | Server error |

---

## SEO & Multilingual Content Guidelines

### Subfolder-Based Language Routing

ZeitPal uses subfolder-based language routing for optimal SEO:

```
URL Structure: /[locale]/[translated-slug]

Examples:
- German (default): /funktionen, /preise, /kontakt
- English: /en/features, /en/pricing, /en/contact
- Spanish: /es/caracteristicas, /es/precios, /es/contacto
```

**Key Rules:**
1. Default locale (German) uses canonical paths without locale prefix
2. Non-default locales are prefixed with locale code (e.g., `/en/`, `/es/`)
3. Home page: German → `/`, English → `/en`, Spanish → `/es`

### Locale Configuration

**File:** `/apps/web/lib/i18n/locales.config.ts`

Supported locales with their configurations:
- `LOCALES` - Array of supported locale codes
- `LOCALE_LABELS` - Human-readable labels (native language)
- `LOCALE_HREFLANG` - ISO codes for hreflang tags
- `LOCALE_OG` - OpenGraph locale codes (language_TERRITORY)

### Slug Translation System

**File:** `/apps/web/lib/i18n/slug-translations.ts`

```typescript
// Canonical (German) slug → translations for each locale
SLUG_TRANSLATIONS = {
  'funktionen': {
    de: 'funktionen',
    en: 'features',
    es: 'caracteristicas',
  },
  'preise': {
    de: 'preise',
    en: 'pricing',
    es: 'precios',
  },
}
```

**Adding New Marketing Pages:**
1. Create page at `/app/(marketing)/[canonical-german-slug]/page.tsx`
2. Add slug translations to `SLUG_TRANSLATIONS` for all locales
3. Add translations to marketing.json for German (source language)
4. Run `pnpm translate` to auto-generate English and Spanish translations
5. Add page priority to sitemap configuration

### URL Localization Utilities

```typescript
// Get translated slug for a canonical path
getTranslatedSlug('funktionen', 'en') // → 'features'

// Get canonical slug from translated slug
getCanonicalSlug('features', 'en') // → 'funktionen'

// Get full localized path
getLocalizedPath('funktionen', 'en') // → '/en/features'
getLocalizedPath('funktionen', 'de') // → '/funktionen' (no prefix for default)
```

### Middleware Locale Routing

**File:** `/apps/web/middleware.ts`

The middleware handles locale detection and URL rewriting:

1. Extracts potential locale from first URL segment
2. For non-default locales, rewrites `/en/features` → `/funktionen`
3. Sets locale cookie (`lang`) for 1 year
4. Sets `x-locale` header for server components

**Routes Excluded from Locale Routing:**
- `/api/*` - API routes
- `/home/*` - Protected app routes
- `/auth/*` - Authentication routes
- `/onboarding/*` - Onboarding flow
- `/_next/*` - Next.js internals
- Static files (containing `.`)

### Components for Localized Navigation

**LocalizedLink Component:**
```tsx
import { LocalizedLink } from '~/components/localized-link';

// Automatically localizes href based on current locale context
// Use canonical German paths in href
<LocalizedLink href="/funktionen">Features</LocalizedLink>
// In English context → /en/features
// In German context → /funktionen
```

**LanguageSwitcher Component:**
```tsx
import { LanguageSwitcher } from '~/components/language-switcher';

// Dropdown to switch between languages (preserves current page)
<LanguageSwitcher />
```

### Translation File Organization

```
public/locales/
├── de/                   # German (SOURCE - edit here!)
│   ├── common.json       # Shared UI labels
│   ├── marketing.json    # Marketing pages (SEO content)
│   └── [namespace].json  # Feature-specific translations
├── en/                   # English (AUTO-GENERATED)
│   └── [same structure]
└── es/                   # Spanish (AUTO-GENERATED)
    └── [same structure]
```

> **IMPORTANT:** German is the source language. Only edit files in `/public/locales/de/`. English and Spanish translations are auto-generated by the translation script.

**Marketing Translation Keys (in German):**
```json
{
  "seo": {
    "features": {
      "metaTitle": "Funktionen - ZeitPal Urlaubsverwaltung",
      "metaDescription": "Entdecken Sie die leistungsstarken Funktionen von ZeitPal..."
    }
  },
  "hero": { "title": "...", "subtitle": "..." },
  "features": { ... },
  "faqItems": [ { "question": "...", "answer": "..." } ]
}
```

### SEO Metadata Pattern

Each marketing page exports metadata using translations:

```typescript
export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();
  return {
    title: t('marketing:seo.features.metaTitle'),
    description: t('marketing:seo.features.metaDescription'),
  };
};
```

### Sitemap with Hreflang

**File:** `/apps/web/app/sitemap.ts`

- Generates entries for all marketing pages in all locales
- Includes hreflang alternates for each URL
- Sets `x-default` pointing to English version
- Configures priority and change frequency per page type

### Structured Data (JSON-LD)

Include schema.org markup on marketing pages:

```typescript
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ZeitPal',
  applicationCategory: 'BusinessApplication',
  // ...
};

return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
    {/* Page content */}
  </>
);
```

### Checklist for New Marketing Pages

- [ ] Create page component at correct route
- [ ] Add slug translations for ALL supported locales
- [ ] Add SEO translations (metaTitle, metaDescription) for all locales
- [ ] Wrap page with `withI18n()` HOC
- [ ] Export `generateMetadata` with translations
- [ ] Add page to sitemap priorities
- [ ] Use `LocalizedLink` for internal links
- [ ] Include structured data where appropriate

### Checklist for New Locale Support

- [ ] Add locale to `LOCALES` array in locales.config.ts
- [ ] Add label to `LOCALE_LABELS`
- [ ] Add hreflang code to `LOCALE_HREFLANG`
- [ ] Add OG code to `LOCALE_OG`
- [ ] Create translation files in `/public/locales/[locale]/`
- [ ] Add slug translations for all marketing pages
- [ ] Test all marketing pages render correctly

---

## Blog Content Guidelines

### Blog Structure

```
apps/web/
├── app/(marketing)/blog/
│   ├── page.tsx              # Blog index
│   └── [slug]/
│       └── page.tsx          # Blog post page
└── content/blog/
    ├── en/
    │   └── [slug].mdx        # English posts
    ├── de/
    │   └── [slug].mdx        # German posts
    └── es/
        └── [slug].mdx        # Spanish posts
```

### Blog Post Frontmatter

```mdx
---
title: "How to Manage Leave Effectively"
description: "Best practices for leave management..."
publishedAt: "2024-01-15"
author: "ZeitPal Team"
category: "guides"
tags: ["leave-management", "hr", "best-practices"]
image: "/images/blog/leave-management.jpg"
---
```

### Blog Translation Rules

1. Each blog post must exist in the default locale (German)
2. Translated posts use the same slug as the German version
3. If no translation exists, fall back to German version
4. Blog slugs are NOT translated (for consistency)

---

## Automatic Translation System

### Overview

ZeitPal uses an AI-powered translation system to automatically translate German content to English and Spanish. This ensures consistent, high-quality translations across the application.

### Source Language

**German is the source language.** All new content should be written in German first.

```
Source:  /public/locales/de/*.json    ← EDIT HERE
Targets: /public/locales/en/*.json    ← AUTO-GENERATED
         /public/locales/es/*.json    ← AUTO-GENERATED
```

### Adding New Translation Strings

When adding new UI text or content:

1. **Add the German string to the appropriate namespace file:**
   ```bash
   # Edit the German translation file
   apps/web/public/locales/de/[namespace].json
   ```

2. **Use hierarchical, descriptive keys:**
   ```json
   {
     "leave": {
       "request": {
         "title": "Urlaubsantrag",
         "submitButton": "Antrag einreichen",
         "successMessage": "Ihr Urlaubsantrag wurde erfolgreich eingereicht"
       }
     }
   }
   ```

3. **Run the translation script locally (optional):**
   ```bash
   cd apps/web
   pnpm translate                    # Translate all namespaces
   pnpm translate --namespace=leave  # Translate specific namespace
   pnpm translate --dry-run          # Preview without writing
   ```

4. **Commit your changes to the German file.** The GitHub Action will automatically generate English and Spanish translations when merged to main.

### Translation Script Commands

```bash
# In apps/web directory:
pnpm translate              # Translate all locales, all namespaces (sequential)
pnpm translate --parallel   # Translate all locales in parallel (FAST!)
pnpm translate --locale=en  # Translate only English
pnpm translate --namespace=marketing  # Translate only marketing namespace
pnpm translate --dry-run    # Preview without writing files
```

### GitHub Action Workflow

The translation workflow (`.github/workflows/translations.yml`) runs:

- **On push to main:** When German translation files (`/de/*.json`) are modified
- **Manual trigger:** Via workflow_dispatch for on-demand translation

The workflow:
1. Detects changed German locale files
2. Runs translation script with `--parallel` flag
3. Commits updated English and Spanish translations
4. Pushes changes automatically

### Interpolation Variables

When using variables in translations, preserve them exactly:

```json
{
  "greeting": "Hallo {{name}}, du hast {{count}} Urlaubstage übrig."
}
```

The translation system preserves `{{variable}}` placeholders automatically.

### HTML Tags in Translations

HTML tags are preserved during translation:

```json
{
  "terms": "Ich akzeptiere die <terms>Nutzungsbedingungen</terms> und <privacy>Datenschutzrichtlinie</privacy>"
}
```

### Checklist for Adding New Strings

- [ ] Add string to German file (`/public/locales/de/[namespace].json`)
- [ ] Use hierarchical, descriptive key (e.g., `leave.request.title`)
- [ ] Preserve any `{{variables}}` exactly as needed
- [ ] Preserve any `<html>` tags needed for links/formatting
- [ ] Use `<Trans>` component in React for rendering
- [ ] Commit German file - translations auto-generated on merge

### Supported Namespaces

| Namespace | Purpose |
|-----------|---------|
| `common` | Shared UI labels (buttons, actions, errors) |
| `auth` | Authentication flows (login, signup, password) |
| `account` | User account settings |
| `teams` | Team management |
| `billing` | Payment and subscriptions |
| `marketing` | Marketing pages (SEO content) |
| `leave` | Leave management features |
| `admin` | Admin dashboard |
| `onboarding` | Onboarding wizard |

---

## Summary

1. **Security**: Validate everything, use parameterized queries, check auth
2. **Quality**: TypeScript strict mode, consistent patterns, proper error handling
3. **Performance**: Pagination, caching, selective queries
4. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
5. **i18n**: German source, auto-translate to EN/ES, subfolder routing, hreflang tags
6. **SEO**: Structured data, canonical URLs (German), metadata per locale
7. **Testing**: Focus on business logic and API routes
8. **Documentation**: Explain why, not what; store all feature/implementation docs in `/docs` folder
9. **Translations**: Write in German → auto-generate EN/ES via GitHub Action

When in doubt, look at existing code in the codebase and follow its patterns.
