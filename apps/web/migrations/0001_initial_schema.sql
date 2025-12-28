-- ZeitPal Initial Database Schema
-- German Leave Tracking SaaS - D1 (SQLite) Schema
-- Created: 2024-12-01

-- ============================================================
-- AUTH.JS TABLES
-- Required tables for NextAuth.js / Auth.js v5 with D1 Adapter
-- ============================================================

-- Users table (extended for ZeitPal)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    email_verified TEXT,  -- ISO timestamp
    image TEXT,

    -- ZeitPal extensions
    phone TEXT,
    locale TEXT DEFAULT 'de',
    timezone TEXT DEFAULT 'Europe/Berlin',

    -- Employment details
    employee_id TEXT,
    start_date TEXT,  -- Employment start date (YYYY-MM-DD)
    end_date TEXT,    -- Employment end date if applicable
    weekly_hours REAL DEFAULT 40.0,
    work_days_per_week INTEGER DEFAULT 5,

    -- Preferences
    notification_preferences TEXT DEFAULT '{}',  -- JSON

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Auth.js accounts table (OAuth providers)
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,  -- 'oauth', 'oidc', 'email', 'credentials'
    provider TEXT NOT NULL,  -- 'google', 'microsoft', 'email'
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,

    UNIQUE(provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- Auth.js sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TEXT NOT NULL  -- ISO timestamp
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);

-- Auth.js verification tokens (magic links, email verification)
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL,  -- email address
    token TEXT NOT NULL,
    expires TEXT NOT NULL,  -- ISO timestamp

    PRIMARY KEY (identifier, token)
);

-- ============================================================
-- ORGANIZATION TABLES
-- Multi-tenant structure with German settings
-- ============================================================

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,

    -- German settings
    bundesland TEXT NOT NULL DEFAULT 'BY',  -- German state code (BY, NW, etc.)

    -- Settings
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3B82F6',

    -- Leave policy defaults
    default_vacation_days INTEGER DEFAULT 30,
    carryover_enabled INTEGER DEFAULT 1,  -- boolean
    carryover_max_days INTEGER DEFAULT 5,
    carryover_expiry_date TEXT DEFAULT '03-31',  -- MM-DD format (March 31st)

    -- Sick leave settings
    sick_leave_au_threshold INTEGER DEFAULT 3,  -- Days before AU required

    -- Approval settings
    require_approval INTEGER DEFAULT 1,  -- boolean
    auto_approve_threshold INTEGER,  -- Auto-approve if <= this many days

    -- Subscription/billing (future use)
    plan TEXT DEFAULT 'free',
    plan_expires_at TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- Organization members (role-based membership)
CREATE TABLE IF NOT EXISTS organization_members (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    role TEXT NOT NULL DEFAULT 'employee',  -- 'admin', 'manager', 'hr', 'employee'

    -- Per-user leave settings (overrides org defaults)
    custom_vacation_days INTEGER,

    -- Status
    status TEXT NOT NULL DEFAULT 'active',  -- 'active', 'inactive', 'pending'
    invited_at TEXT,
    joined_at TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

-- Organization invites
CREATE TABLE IF NOT EXISTS organization_invites (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee',
    token TEXT UNIQUE NOT NULL,
    invited_by TEXT NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL,
    accepted_at TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_invites_token ON organization_invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON organization_invites(email);

-- ============================================================
-- TEAM TABLES
-- Team structure within organizations
-- ============================================================

-- Teams
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366F1',  -- Team color for calendar

    -- Team settings
    min_coverage INTEGER DEFAULT 1,  -- Minimum team members required on any day

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_teams_org ON teams(organization_id);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    is_lead INTEGER DEFAULT 0,  -- boolean: Team lead

    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- ============================================================
-- LEAVE TYPES
-- German leave types with configurable settings
-- ============================================================

CREATE TABLE IF NOT EXISTS leave_types (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,  -- NULL = system default

    code TEXT NOT NULL,  -- 'vacation', 'sick', 'child_sick', etc.
    name_en TEXT NOT NULL,
    name_de TEXT NOT NULL,
    description_en TEXT,
    description_de TEXT,

    color TEXT NOT NULL DEFAULT '#3B82F6',
    icon TEXT DEFAULT 'calendar',  -- Lucide icon name

    -- Settings
    is_paid INTEGER DEFAULT 1,  -- boolean
    requires_approval INTEGER DEFAULT 1,  -- boolean
    requires_document INTEGER DEFAULT 0,  -- boolean (e.g., sick note)
    document_required_after_days INTEGER,  -- Days before document required (e.g., 3 for AU)

    -- Allowance settings
    has_allowance INTEGER DEFAULT 1,  -- boolean: Has annual limit
    default_days_per_year INTEGER,  -- Default annual allowance
    allow_negative INTEGER DEFAULT 0,  -- boolean: Can go negative
    allow_half_days INTEGER DEFAULT 1,  -- boolean: Half-day requests allowed

    -- Carryover
    allow_carryover INTEGER DEFAULT 0,  -- boolean
    max_carryover_days INTEGER,

    -- Display order
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,  -- boolean

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leave_types_org ON leave_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_leave_types_code ON leave_types(code);

-- ============================================================
-- LEAVE BALANCES
-- Per-user, per-year, per-type balances
-- ============================================================

CREATE TABLE IF NOT EXISTS leave_balances (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type_id TEXT NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,

    -- Balances (in days, can be decimal for half-days)
    entitled REAL NOT NULL DEFAULT 0,        -- Annual entitlement
    carried_over REAL NOT NULL DEFAULT 0,    -- Carried from previous year
    adjustment REAL NOT NULL DEFAULT 0,      -- Manual adjustments (+/-)
    used REAL NOT NULL DEFAULT 0,            -- Approved and taken
    pending REAL NOT NULL DEFAULT 0,         -- Pending approval

    -- Computed: remaining = entitled + carried_over + adjustment - used - pending

    notes TEXT,  -- Admin notes for adjustments

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(user_id, leave_type_id, year)
);

CREATE INDEX IF NOT EXISTS idx_balances_user_year ON leave_balances(user_id, year);
CREATE INDEX IF NOT EXISTS idx_balances_org ON leave_balances(organization_id);

-- ============================================================
-- LEAVE REQUESTS
-- Leave requests with half-day and multi-day support
-- ============================================================

CREATE TABLE IF NOT EXISTS leave_requests (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type_id TEXT NOT NULL REFERENCES leave_types(id),

    -- Date range
    start_date TEXT NOT NULL,  -- YYYY-MM-DD
    end_date TEXT NOT NULL,    -- YYYY-MM-DD

    -- Half-day support
    start_half_day TEXT,  -- NULL, 'morning', 'afternoon'
    end_half_day TEXT,    -- NULL, 'morning', 'afternoon'

    -- Calculated values
    work_days REAL NOT NULL,  -- Calculated work days (excludes weekends + holidays)

    -- Request details
    reason TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending',  -- 'draft', 'pending', 'approved', 'rejected', 'cancelled', 'withdrawn'

    -- Document upload (sick notes)
    document_url TEXT,
    document_uploaded_at TEXT,

    -- Cancellation
    cancelled_at TEXT,
    cancelled_by TEXT REFERENCES users(id),
    cancellation_reason TEXT,

    -- Metadata
    submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_requests_user ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_org ON leave_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_requests_org_dates ON leave_requests(organization_id, start_date, end_date);

-- ============================================================
-- APPROVAL WORKFLOW
-- Flexible approval rules and tracking
-- ============================================================

-- Approval rules (configurable workflow)
CREATE TABLE IF NOT EXISTS approval_rules (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,

    -- Conditions (JSON)
    -- e.g., {"leave_types": ["vacation"], "min_days": 5, "max_days": null}
    conditions TEXT NOT NULL DEFAULT '{}',

    -- Approver configuration
    approver_type TEXT NOT NULL,  -- 'team_lead', 'manager', 'hr', 'specific_user', 'any_admin'
    approver_user_id TEXT REFERENCES users(id),  -- If specific_user

    -- Workflow level (for multi-level approval)
    level INTEGER NOT NULL DEFAULT 1,

    -- Rule priority (higher = checked first)
    priority INTEGER NOT NULL DEFAULT 0,

    is_active INTEGER DEFAULT 1,  -- boolean

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_approval_rules_org ON approval_rules(organization_id);

-- Leave approvals (tracking each approval action)
CREATE TABLE IF NOT EXISTS leave_approvals (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    leave_request_id TEXT NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
    approval_rule_id TEXT REFERENCES approval_rules(id),

    -- Approver
    approver_id TEXT NOT NULL REFERENCES users(id),

    -- Approval level in workflow
    level INTEGER NOT NULL DEFAULT 1,

    -- Decision
    decision TEXT NOT NULL,  -- 'approved', 'rejected', 'pending'
    comment TEXT,

    decided_at TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_approvals_request ON leave_approvals(leave_request_id);
CREATE INDEX IF NOT EXISTS idx_approvals_approver ON leave_approvals(approver_id);

-- ============================================================
-- PUBLIC HOLIDAYS
-- German public holidays by Bundesland
-- ============================================================

CREATE TABLE IF NOT EXISTS public_holidays (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- Scope
    organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,  -- NULL = system-wide
    bundesland TEXT,  -- NULL = nationwide, or specific state code

    -- Holiday details
    date TEXT NOT NULL,  -- YYYY-MM-DD
    name_en TEXT NOT NULL,
    name_de TEXT NOT NULL,

    -- Type
    type TEXT NOT NULL DEFAULT 'public',  -- 'public', 'company', 'optional'
    is_half_day INTEGER DEFAULT 0,  -- boolean

    -- Recurrence (for system holidays)
    is_recurring INTEGER DEFAULT 0,  -- boolean
    recurrence_rule TEXT,  -- e.g., 'easter+1' for Easter Monday

    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_holidays_date ON public_holidays(date);
CREATE INDEX IF NOT EXISTS idx_holidays_bundesland ON public_holidays(bundesland);
CREATE INDEX IF NOT EXISTS idx_holidays_org ON public_holidays(organization_id);

-- ============================================================
-- AUDIT LOG
-- Compliance audit trail
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,

    -- Action details
    action TEXT NOT NULL,  -- 'leave_request.created', 'leave_request.approved', etc.
    entity_type TEXT NOT NULL,  -- 'leave_request', 'user', 'organization', etc.
    entity_id TEXT NOT NULL,

    -- Changes (JSON)
    old_values TEXT,  -- Previous state
    new_values TEXT,  -- New state

    -- Request context
    ip_address TEXT,
    user_agent TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- ============================================================
-- NOTIFICATIONS
-- In-app and email notification tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,

    -- Notification content
    type TEXT NOT NULL,  -- 'leave_approved', 'leave_rejected', 'approval_needed', etc.
    title TEXT NOT NULL,
    body TEXT,

    -- Related entity
    entity_type TEXT,
    entity_id TEXT,

    -- Delivery status
    read_at TEXT,
    email_sent INTEGER DEFAULT 0,  -- boolean
    email_sent_at TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

-- Note: D1/SQLite doesn't support triggers in the same way,
-- so updated_at should be set by the application layer.
-- Alternatively, use a CHECK constraint or handle in app code.
