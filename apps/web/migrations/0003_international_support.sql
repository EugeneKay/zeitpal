-- ZeitPal International Support Migration
-- Adds country/region support for organizations beyond Germany
-- Adds onboarding tracking for users
-- ============================================================

-- ============================================================
-- ORGANIZATIONS: Add country and generic region support
-- ============================================================

-- Add country column (default to Germany for existing orgs)
ALTER TABLE organizations ADD COLUMN country TEXT NOT NULL DEFAULT 'DE';

-- Add region column (more generic than bundesland, will replace it eventually)
-- For Germany, this will store the Bundesland code
-- For other countries, this can store state/province/canton codes
ALTER TABLE organizations ADD COLUMN region TEXT;

-- Copy existing bundesland values to region for German organizations
UPDATE organizations SET region = bundesland WHERE bundesland IS NOT NULL;

-- ============================================================
-- USERS: Add onboarding tracking
-- ============================================================

-- Track when user completed onboarding
ALTER TABLE users ADD COLUMN onboarding_completed_at TEXT;

-- Track which onboarding steps were completed (JSON array)
-- e.g., ["welcome", "profile", "organization", "location", "policy"]
ALTER TABLE users ADD COLUMN onboarding_steps_completed TEXT DEFAULT '[]';

-- ============================================================
-- ORGANIZATION_INVITES: Add team assignment for invites
-- ============================================================

-- Allow assigning invited users to a team during onboarding
ALTER TABLE organization_invites ADD COLUMN team_id TEXT REFERENCES teams(id) ON DELETE SET NULL;

-- ============================================================
-- PUBLIC_HOLIDAYS: Add country support
-- ============================================================

-- Add country column to support holidays for countries other than Germany
ALTER TABLE public_holidays ADD COLUMN country TEXT DEFAULT 'DE';

-- Create index for country-based holiday lookups
CREATE INDEX IF NOT EXISTS idx_holidays_country ON public_holidays(country);
CREATE INDEX IF NOT EXISTS idx_holidays_country_region ON public_holidays(country, bundesland);

-- ============================================================
-- COUNTRIES TABLE: Store supported countries and their configurations
-- ============================================================

CREATE TABLE IF NOT EXISTS countries (
    code TEXT PRIMARY KEY,  -- ISO 3166-1 alpha-2 code (DE, AT, CH, GB, US, etc.)
    name_en TEXT NOT NULL,
    name_de TEXT NOT NULL,
    flag TEXT NOT NULL,  -- Emoji flag
    has_regional_holidays INTEGER DEFAULT 0,  -- boolean
    min_leave_days INTEGER,  -- Legal minimum if applicable
    legal_note_en TEXT,  -- Legal requirement explanation
    legal_note_de TEXT,
    currency TEXT DEFAULT 'EUR',
    date_format TEXT DEFAULT 'DD.MM.YYYY',
    week_starts_on INTEGER DEFAULT 1,  -- 0=Sunday, 1=Monday
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- REGIONS TABLE: Store regions/states for countries
-- ============================================================

CREATE TABLE IF NOT EXISTS regions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
    code TEXT NOT NULL,  -- State/province code (BY, NW, etc.)
    name_en TEXT NOT NULL,
    name_de TEXT NOT NULL,
    has_extra_holidays INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(country_code, code)
);

CREATE INDEX IF NOT EXISTS idx_regions_country ON regions(country_code);

-- ============================================================
-- SEED: Supported Countries
-- ============================================================

INSERT INTO countries (code, name_en, name_de, flag, has_regional_holidays, min_leave_days, legal_note_en, legal_note_de, sort_order) VALUES
('DE', 'Germany', 'Deutschland', '🇩🇪', 1, 20,
 'German law requires minimum 20 days for a 5-day work week (24 days for 6-day week)',
 'Nach deutschem Recht mindestens 20 Tage bei 5-Tage-Woche (24 Tage bei 6-Tage-Woche)', 1),
('AT', 'Austria', 'Österreich', '🇦🇹', 1, 25,
 'Austrian law requires minimum 25 working days of paid leave per year',
 'Österreichisches Recht schreibt mindestens 25 Arbeitstage bezahlten Urlaub pro Jahr vor', 2),
('CH', 'Switzerland', 'Schweiz', '🇨🇭', 1, 20,
 'Swiss law requires minimum 4 weeks (20 days) of paid vacation per year',
 'Schweizer Recht schreibt mindestens 4 Wochen (20 Tage) bezahlten Urlaub pro Jahr vor', 3),
('GB', 'United Kingdom', 'Vereinigtes Königreich', '🇬🇧', 1, 28,
 'UK law requires 28 days including bank holidays (5.6 weeks)',
 'Britisches Recht schreibt 28 Tage einschließlich Feiertage vor (5,6 Wochen)', 4),
('NL', 'Netherlands', 'Niederlande', '🇳🇱', 0, 20,
 'Dutch law requires minimum 4 times weekly working hours in days per year',
 'Niederländisches Recht schreibt mindestens 4-mal die wöchentliche Arbeitszeit in Tagen pro Jahr vor', 5),
('FR', 'France', 'Frankreich', '🇫🇷', 0, 25,
 'French law requires 2.5 days per month worked (30 working days per year)',
 'Französisches Recht schreibt 2,5 Tage pro gearbeitetem Monat vor (30 Arbeitstage pro Jahr)', 6),
('US', 'United States', 'Vereinigte Staaten', '🇺🇸', 1, NULL,
 'No federal requirement for paid vacation. Company policy applies.',
 'Keine bundesweite Pflicht für bezahlten Urlaub. Es gilt die Unternehmensrichtlinie.', 7),
('OTHER', 'Other', 'Andere', '🌍', 0, NULL,
 'Configure your leave policy based on local requirements',
 'Konfigurieren Sie Ihre Urlaubsrichtlinie basierend auf lokalen Anforderungen', 99);

-- ============================================================
-- SEED: German Regions (Bundesländer) - copy from existing data
-- ============================================================

INSERT INTO regions (id, country_code, code, name_en, name_de, has_extra_holidays) VALUES
('reg_de_bw', 'DE', 'BW', 'Baden-Württemberg', 'Baden-Württemberg', 1),
('reg_de_by', 'DE', 'BY', 'Bavaria', 'Bayern', 1),
('reg_de_be', 'DE', 'BE', 'Berlin', 'Berlin', 1),
('reg_de_bb', 'DE', 'BB', 'Brandenburg', 'Brandenburg', 1),
('reg_de_hb', 'DE', 'HB', 'Bremen', 'Bremen', 1),
('reg_de_hh', 'DE', 'HH', 'Hamburg', 'Hamburg', 1),
('reg_de_he', 'DE', 'HE', 'Hesse', 'Hessen', 1),
('reg_de_mv', 'DE', 'MV', 'Mecklenburg-Vorpommern', 'Mecklenburg-Vorpommern', 1),
('reg_de_ni', 'DE', 'NI', 'Lower Saxony', 'Niedersachsen', 1),
('reg_de_nw', 'DE', 'NW', 'North Rhine-Westphalia', 'Nordrhein-Westfalen', 1),
('reg_de_rp', 'DE', 'RP', 'Rhineland-Palatinate', 'Rheinland-Pfalz', 1),
('reg_de_sl', 'DE', 'SL', 'Saarland', 'Saarland', 1),
('reg_de_sn', 'DE', 'SN', 'Saxony', 'Sachsen', 1),
('reg_de_st', 'DE', 'ST', 'Saxony-Anhalt', 'Sachsen-Anhalt', 1),
('reg_de_sh', 'DE', 'SH', 'Schleswig-Holstein', 'Schleswig-Holstein', 1),
('reg_de_th', 'DE', 'TH', 'Thuringia', 'Thüringen', 1);

-- ============================================================
-- SEED: Austrian Regions (Bundesländer)
-- ============================================================

INSERT INTO regions (id, country_code, code, name_en, name_de, has_extra_holidays) VALUES
('reg_at_w', 'AT', 'W', 'Vienna', 'Wien', 0),
('reg_at_noe', 'AT', 'NOE', 'Lower Austria', 'Niederösterreich', 0),
('reg_at_ooe', 'AT', 'OOE', 'Upper Austria', 'Oberösterreich', 0),
('reg_at_sbg', 'AT', 'SBG', 'Salzburg', 'Salzburg', 0),
('reg_at_t', 'AT', 'T', 'Tyrol', 'Tirol', 0),
('reg_at_vbg', 'AT', 'VBG', 'Vorarlberg', 'Vorarlberg', 0),
('reg_at_ktn', 'AT', 'KTN', 'Carinthia', 'Kärnten', 0),
('reg_at_stmk', 'AT', 'STMK', 'Styria', 'Steiermark', 0),
('reg_at_bgld', 'AT', 'BGLD', 'Burgenland', 'Burgenland', 0);

-- ============================================================
-- SEED: Swiss Regions (Cantons)
-- ============================================================

INSERT INTO regions (id, country_code, code, name_en, name_de, has_extra_holidays) VALUES
('reg_ch_zh', 'CH', 'ZH', 'Zurich', 'Zürich', 1),
('reg_ch_be', 'CH', 'BE', 'Bern', 'Bern', 1),
('reg_ch_lu', 'CH', 'LU', 'Lucerne', 'Luzern', 1),
('reg_ch_ur', 'CH', 'UR', 'Uri', 'Uri', 1),
('reg_ch_sz', 'CH', 'SZ', 'Schwyz', 'Schwyz', 1),
('reg_ch_ow', 'CH', 'OW', 'Obwalden', 'Obwalden', 1),
('reg_ch_nw', 'CH', 'NW', 'Nidwalden', 'Nidwalden', 1),
('reg_ch_gl', 'CH', 'GL', 'Glarus', 'Glarus', 1),
('reg_ch_zg', 'CH', 'ZG', 'Zug', 'Zug', 1),
('reg_ch_fr', 'CH', 'FR', 'Fribourg', 'Freiburg', 1),
('reg_ch_so', 'CH', 'SO', 'Solothurn', 'Solothurn', 1),
('reg_ch_bs', 'CH', 'BS', 'Basel-Stadt', 'Basel-Stadt', 1),
('reg_ch_bl', 'CH', 'BL', 'Basel-Landschaft', 'Basel-Landschaft', 1),
('reg_ch_sh', 'CH', 'SH', 'Schaffhausen', 'Schaffhausen', 1),
('reg_ch_ar', 'CH', 'AR', 'Appenzell Ausserrhoden', 'Appenzell Ausserrhoden', 1),
('reg_ch_ai', 'CH', 'AI', 'Appenzell Innerrhoden', 'Appenzell Innerrhoden', 1),
('reg_ch_sg', 'CH', 'SG', 'St. Gallen', 'St. Gallen', 1),
('reg_ch_gr', 'CH', 'GR', 'Graubünden', 'Graubünden', 1),
('reg_ch_ag', 'CH', 'AG', 'Aargau', 'Aargau', 1),
('reg_ch_tg', 'CH', 'TG', 'Thurgau', 'Thurgau', 1),
('reg_ch_ti', 'CH', 'TI', 'Ticino', 'Tessin', 1),
('reg_ch_vd', 'CH', 'VD', 'Vaud', 'Waadt', 1),
('reg_ch_vs', 'CH', 'VS', 'Valais', 'Wallis', 1),
('reg_ch_ne', 'CH', 'NE', 'Neuchâtel', 'Neuenburg', 1),
('reg_ch_ge', 'CH', 'GE', 'Geneva', 'Genf', 1),
('reg_ch_ju', 'CH', 'JU', 'Jura', 'Jura', 1);

-- ============================================================
-- SEED: UK Regions
-- ============================================================

INSERT INTO regions (id, country_code, code, name_en, name_de, has_extra_holidays) VALUES
('reg_gb_eng', 'GB', 'ENG', 'England', 'England', 1),
('reg_gb_sct', 'GB', 'SCT', 'Scotland', 'Schottland', 1),
('reg_gb_wls', 'GB', 'WLS', 'Wales', 'Wales', 1),
('reg_gb_nir', 'GB', 'NIR', 'Northern Ireland', 'Nordirland', 1);
