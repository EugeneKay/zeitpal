-- ZeitPal Seed Data
-- German Leave Types and Public Holidays
-- ============================================================

-- ============================================================
-- DEFAULT LEAVE TYPES (System-wide, org_id = NULL)
-- ============================================================

INSERT INTO leave_types (id, organization_id, code, name_en, name_de, description_en, description_de, color, icon, is_paid, requires_approval, requires_document, document_required_after_days, has_allowance, default_days_per_year, allow_negative, allow_half_days, allow_carryover, max_carryover_days, sort_order, is_active) VALUES

-- Vacation / Urlaub
('lt_vacation', NULL, 'vacation', 'Vacation', 'Urlaub',
 'Annual paid vacation leave', 'Jährlicher bezahlter Urlaubsanspruch',
 '#3B82F6', 'palmtree', 1, 1, 0, NULL, 1, 30, 0, 1, 1, 5, 1, 1),

-- Sick Leave / Krankheit
('lt_sick', NULL, 'sick', 'Sick Leave', 'Krankheit',
 'Sick leave with medical certificate required after 3 days', 'Krankheitsbedingte Abwesenheit, AU nach 3 Tagen erforderlich',
 '#EF4444', 'thermometer', 1, 0, 1, 3, 0, NULL, 0, 0, 0, NULL, 2, 1),

-- Child Sick / Kind krank
('lt_child_sick', NULL, 'child_sick', 'Child Sick Leave', 'Kind krank',
 'Leave to care for sick child (10 days per child per year)', 'Freistellung zur Betreuung erkrankter Kinder (10 Tage pro Kind/Jahr)',
 '#F97316', 'baby', 1, 1, 1, 1, 1, 10, 0, 1, 0, NULL, 3, 1),

-- Maternity Leave / Mutterschutz
('lt_maternity', NULL, 'maternity', 'Maternity Leave', 'Mutterschutz',
 'Maternity protection leave (6 weeks before, 8 weeks after birth)', 'Mutterschutz (6 Wochen vor, 8 Wochen nach Geburt)',
 '#EC4899', 'heart', 1, 0, 1, 0, 0, NULL, 0, 0, 0, NULL, 4, 1),

-- Parental Leave / Elternzeit
('lt_parental', NULL, 'parental', 'Parental Leave', 'Elternzeit',
 'Parental leave for childcare (up to 3 years)', 'Elternzeit zur Kinderbetreuung (bis zu 3 Jahre)',
 '#8B5CF6', 'users', 0, 1, 1, 0, 0, NULL, 0, 0, 0, NULL, 5, 1),

-- Care Leave / Pflegezeit
('lt_care', NULL, 'care', 'Care Leave', 'Pflegezeit',
 'Leave to care for family members (up to 6 months)', 'Freistellung zur Pflege von Angehörigen (bis zu 6 Monate)',
 '#14B8A6', 'heart-handshake', 0, 1, 1, 0, 0, NULL, 0, 0, 0, NULL, 6, 1),

-- Special Leave / Sonderurlaub
('lt_special', NULL, 'special', 'Special Leave', 'Sonderurlaub',
 'Special leave for events (wedding, bereavement, moving)', 'Sonderurlaub für besondere Anlässe (Hochzeit, Trauerfall, Umzug)',
 '#F59E0B', 'star', 1, 1, 0, NULL, 0, NULL, 0, 1, 0, NULL, 7, 1),

-- Overtime Compensation / Überstundenabbau
('lt_overtime', NULL, 'overtime', 'Overtime Compensation', 'Überstundenabbau',
 'Time off in lieu of overtime worked', 'Freizeitausgleich für geleistete Überstunden',
 '#6366F1', 'clock', 1, 1, 0, NULL, 0, NULL, 0, 1, 0, NULL, 8, 1),

-- Education Leave / Bildungsurlaub
('lt_education', NULL, 'education', 'Education Leave', 'Bildungsurlaub',
 'Paid educational leave (5 days per year, varies by state)', 'Bezahlter Bildungsurlaub (5 Tage/Jahr, landesabhängig)',
 '#10B981', 'graduation-cap', 1, 1, 1, 0, 1, 5, 0, 0, 0, NULL, 9, 1),

-- Unpaid Leave / Unbezahlter Urlaub
('lt_unpaid', NULL, 'unpaid', 'Unpaid Leave', 'Unbezahlter Urlaub',
 'Unpaid leave of absence', 'Unbezahlte Freistellung',
 '#6B7280', 'calendar-off', 0, 1, 0, NULL, 0, NULL, 0, 1, 0, NULL, 10, 1);


-- ============================================================
-- GERMAN PUBLIC HOLIDAYS 2024-2026
-- Nationwide holidays (bundesland = NULL)
-- ============================================================

-- 2024 Nationwide Holidays
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type, is_recurring) VALUES
('ph_2024_neujahr', NULL, '2024-01-01', 'New Year''s Day', 'Neujahr', 'public', 1),
('ph_2024_karfreitag', NULL, '2024-03-29', 'Good Friday', 'Karfreitag', 'public', 0),
('ph_2024_ostermontag', NULL, '2024-04-01', 'Easter Monday', 'Ostermontag', 'public', 0),
('ph_2024_tag_arbeit', NULL, '2024-05-01', 'Labour Day', 'Tag der Arbeit', 'public', 1),
('ph_2024_himmelfahrt', NULL, '2024-05-09', 'Ascension Day', 'Christi Himmelfahrt', 'public', 0),
('ph_2024_pfingstmontag', NULL, '2024-05-20', 'Whit Monday', 'Pfingstmontag', 'public', 0),
('ph_2024_einheit', NULL, '2024-10-03', 'German Unity Day', 'Tag der Deutschen Einheit', 'public', 1),
('ph_2024_weihnachten1', NULL, '2024-12-25', 'Christmas Day', '1. Weihnachtstag', 'public', 1),
('ph_2024_weihnachten2', NULL, '2024-12-26', 'Boxing Day', '2. Weihnachtstag', 'public', 1);

-- 2025 Nationwide Holidays
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type, is_recurring) VALUES
('ph_2025_neujahr', NULL, '2025-01-01', 'New Year''s Day', 'Neujahr', 'public', 1),
('ph_2025_karfreitag', NULL, '2025-04-18', 'Good Friday', 'Karfreitag', 'public', 0),
('ph_2025_ostermontag', NULL, '2025-04-21', 'Easter Monday', 'Ostermontag', 'public', 0),
('ph_2025_tag_arbeit', NULL, '2025-05-01', 'Labour Day', 'Tag der Arbeit', 'public', 1),
('ph_2025_himmelfahrt', NULL, '2025-05-29', 'Ascension Day', 'Christi Himmelfahrt', 'public', 0),
('ph_2025_pfingstmontag', NULL, '2025-06-09', 'Whit Monday', 'Pfingstmontag', 'public', 0),
('ph_2025_einheit', NULL, '2025-10-03', 'German Unity Day', 'Tag der Deutschen Einheit', 'public', 1),
('ph_2025_weihnachten1', NULL, '2025-12-25', 'Christmas Day', '1. Weihnachtstag', 'public', 1),
('ph_2025_weihnachten2', NULL, '2025-12-26', 'Boxing Day', '2. Weihnachtstag', 'public', 1);

-- 2026 Nationwide Holidays
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type, is_recurring) VALUES
('ph_2026_neujahr', NULL, '2026-01-01', 'New Year''s Day', 'Neujahr', 'public', 1),
('ph_2026_karfreitag', NULL, '2026-04-03', 'Good Friday', 'Karfreitag', 'public', 0),
('ph_2026_ostermontag', NULL, '2026-04-06', 'Easter Monday', 'Ostermontag', 'public', 0),
('ph_2026_tag_arbeit', NULL, '2026-05-01', 'Labour Day', 'Tag der Arbeit', 'public', 1),
('ph_2026_himmelfahrt', NULL, '2026-05-14', 'Ascension Day', 'Christi Himmelfahrt', 'public', 0),
('ph_2026_pfingstmontag', NULL, '2026-05-25', 'Whit Monday', 'Pfingstmontag', 'public', 0),
('ph_2026_einheit', NULL, '2026-10-03', 'German Unity Day', 'Tag der Deutschen Einheit', 'public', 1),
('ph_2026_weihnachten1', NULL, '2026-12-25', 'Christmas Day', '1. Weihnachtstag', 'public', 1),
('ph_2026_weihnachten2', NULL, '2026-12-26', 'Boxing Day', '2. Weihnachtstag', 'public', 1);


-- ============================================================
-- STATE-SPECIFIC HOLIDAYS 2024-2026
-- Only the additional holidays per Bundesland
-- ============================================================

-- Baden-Württemberg (BW): Epiphany, Corpus Christi, All Saints
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
-- 2024
('ph_2024_bw_drei_koenige', 'BW', '2024-01-06', 'Epiphany', 'Heilige Drei Könige', 'public'),
('ph_2024_bw_fronleichnam', 'BW', '2024-05-30', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2024_bw_allerheiligen', 'BW', '2024-11-01', 'All Saints'' Day', 'Allerheiligen', 'public'),
-- 2025
('ph_2025_bw_drei_koenige', 'BW', '2025-01-06', 'Epiphany', 'Heilige Drei Könige', 'public'),
('ph_2025_bw_fronleichnam', 'BW', '2025-06-19', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2025_bw_allerheiligen', 'BW', '2025-11-01', 'All Saints'' Day', 'Allerheiligen', 'public'),
-- 2026
('ph_2026_bw_drei_koenige', 'BW', '2026-01-06', 'Epiphany', 'Heilige Drei Könige', 'public'),
('ph_2026_bw_fronleichnam', 'BW', '2026-06-04', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2026_bw_allerheiligen', 'BW', '2026-11-01', 'All Saints'' Day', 'Allerheiligen', 'public');

-- Bayern (BY): Epiphany, Corpus Christi, Assumption, All Saints
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
-- 2024
('ph_2024_by_drei_koenige', 'BY', '2024-01-06', 'Epiphany', 'Heilige Drei Könige', 'public'),
('ph_2024_by_fronleichnam', 'BY', '2024-05-30', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2024_by_maria_himmelfahrt', 'BY', '2024-08-15', 'Assumption Day', 'Mariä Himmelfahrt', 'public'),
('ph_2024_by_allerheiligen', 'BY', '2024-11-01', 'All Saints'' Day', 'Allerheiligen', 'public'),
-- 2025
('ph_2025_by_drei_koenige', 'BY', '2025-01-06', 'Epiphany', 'Heilige Drei Könige', 'public'),
('ph_2025_by_fronleichnam', 'BY', '2025-06-19', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2025_by_maria_himmelfahrt', 'BY', '2025-08-15', 'Assumption Day', 'Mariä Himmelfahrt', 'public'),
('ph_2025_by_allerheiligen', 'BY', '2025-11-01', 'All Saints'' Day', 'Allerheiligen', 'public'),
-- 2026
('ph_2026_by_drei_koenige', 'BY', '2026-01-06', 'Epiphany', 'Heilige Drei Könige', 'public'),
('ph_2026_by_fronleichnam', 'BY', '2026-06-04', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2026_by_maria_himmelfahrt', 'BY', '2026-08-15', 'Assumption Day', 'Mariä Himmelfahrt', 'public'),
('ph_2026_by_allerheiligen', 'BY', '2026-11-01', 'All Saints'' Day', 'Allerheiligen', 'public');

-- Berlin (BE): International Women's Day
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
('ph_2024_be_frauentag', 'BE', '2024-03-08', 'International Women''s Day', 'Internationaler Frauentag', 'public'),
('ph_2025_be_frauentag', 'BE', '2025-03-08', 'International Women''s Day', 'Internationaler Frauentag', 'public'),
('ph_2026_be_frauentag', 'BE', '2026-03-08', 'International Women''s Day', 'Internationaler Frauentag', 'public');

-- Brandenburg (BB): Reformation Day
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
('ph_2024_bb_reformation', 'BB', '2024-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2025_bb_reformation', 'BB', '2025-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2026_bb_reformation', 'BB', '2026-10-31', 'Reformation Day', 'Reformationstag', 'public');

-- Bremen (HB): Reformation Day
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
('ph_2024_hb_reformation', 'HB', '2024-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2025_hb_reformation', 'HB', '2025-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2026_hb_reformation', 'HB', '2026-10-31', 'Reformation Day', 'Reformationstag', 'public');

-- Hamburg (HH): Reformation Day
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
('ph_2024_hh_reformation', 'HH', '2024-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2025_hh_reformation', 'HH', '2025-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2026_hh_reformation', 'HH', '2026-10-31', 'Reformation Day', 'Reformationstag', 'public');

-- Hessen (HE): Corpus Christi
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
('ph_2024_he_fronleichnam', 'HE', '2024-05-30', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2025_he_fronleichnam', 'HE', '2025-06-19', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2026_he_fronleichnam', 'HE', '2026-06-04', 'Corpus Christi', 'Fronleichnam', 'public');

-- Mecklenburg-Vorpommern (MV): Reformation Day
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
('ph_2024_mv_reformation', 'MV', '2024-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2025_mv_reformation', 'MV', '2025-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2026_mv_reformation', 'MV', '2026-10-31', 'Reformation Day', 'Reformationstag', 'public');

-- Niedersachsen (NI): Reformation Day
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
('ph_2024_ni_reformation', 'NI', '2024-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2025_ni_reformation', 'NI', '2025-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2026_ni_reformation', 'NI', '2026-10-31', 'Reformation Day', 'Reformationstag', 'public');

-- Nordrhein-Westfalen (NW): Corpus Christi, All Saints
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
-- 2024
('ph_2024_nw_fronleichnam', 'NW', '2024-05-30', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2024_nw_allerheiligen', 'NW', '2024-11-01', 'All Saints'' Day', 'Allerheiligen', 'public'),
-- 2025
('ph_2025_nw_fronleichnam', 'NW', '2025-06-19', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2025_nw_allerheiligen', 'NW', '2025-11-01', 'All Saints'' Day', 'Allerheiligen', 'public'),
-- 2026
('ph_2026_nw_fronleichnam', 'NW', '2026-06-04', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2026_nw_allerheiligen', 'NW', '2026-11-01', 'All Saints'' Day', 'Allerheiligen', 'public');

-- Rheinland-Pfalz (RP): Corpus Christi, All Saints
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
-- 2024
('ph_2024_rp_fronleichnam', 'RP', '2024-05-30', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2024_rp_allerheiligen', 'RP', '2024-11-01', 'All Saints'' Day', 'Allerheiligen', 'public'),
-- 2025
('ph_2025_rp_fronleichnam', 'RP', '2025-06-19', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2025_rp_allerheiligen', 'RP', '2025-11-01', 'All Saints'' Day', 'Allerheiligen', 'public'),
-- 2026
('ph_2026_rp_fronleichnam', 'RP', '2026-06-04', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2026_rp_allerheiligen', 'RP', '2026-11-01', 'All Saints'' Day', 'Allerheiligen', 'public');

-- Saarland (SL): Corpus Christi, Assumption, All Saints
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
-- 2024
('ph_2024_sl_fronleichnam', 'SL', '2024-05-30', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2024_sl_maria_himmelfahrt', 'SL', '2024-08-15', 'Assumption Day', 'Mariä Himmelfahrt', 'public'),
('ph_2024_sl_allerheiligen', 'SL', '2024-11-01', 'All Saints'' Day', 'Allerheiligen', 'public'),
-- 2025
('ph_2025_sl_fronleichnam', 'SL', '2025-06-19', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2025_sl_maria_himmelfahrt', 'SL', '2025-08-15', 'Assumption Day', 'Mariä Himmelfahrt', 'public'),
('ph_2025_sl_allerheiligen', 'SL', '2025-11-01', 'All Saints'' Day', 'Allerheiligen', 'public'),
-- 2026
('ph_2026_sl_fronleichnam', 'SL', '2026-06-04', 'Corpus Christi', 'Fronleichnam', 'public'),
('ph_2026_sl_maria_himmelfahrt', 'SL', '2026-08-15', 'Assumption Day', 'Mariä Himmelfahrt', 'public'),
('ph_2026_sl_allerheiligen', 'SL', '2026-11-01', 'All Saints'' Day', 'Allerheiligen', 'public');

-- Sachsen (SN): Reformation Day, Repentance Day
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
-- 2024
('ph_2024_sn_reformation', 'SN', '2024-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2024_sn_busstag', 'SN', '2024-11-20', 'Repentance Day', 'Buß- und Bettag', 'public'),
-- 2025
('ph_2025_sn_reformation', 'SN', '2025-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2025_sn_busstag', 'SN', '2025-11-19', 'Repentance Day', 'Buß- und Bettag', 'public'),
-- 2026
('ph_2026_sn_reformation', 'SN', '2026-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2026_sn_busstag', 'SN', '2026-11-18', 'Repentance Day', 'Buß- und Bettag', 'public');

-- Sachsen-Anhalt (ST): Epiphany, Reformation Day
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
-- 2024
('ph_2024_st_drei_koenige', 'ST', '2024-01-06', 'Epiphany', 'Heilige Drei Könige', 'public'),
('ph_2024_st_reformation', 'ST', '2024-10-31', 'Reformation Day', 'Reformationstag', 'public'),
-- 2025
('ph_2025_st_drei_koenige', 'ST', '2025-01-06', 'Epiphany', 'Heilige Drei Könige', 'public'),
('ph_2025_st_reformation', 'ST', '2025-10-31', 'Reformation Day', 'Reformationstag', 'public'),
-- 2026
('ph_2026_st_drei_koenige', 'ST', '2026-01-06', 'Epiphany', 'Heilige Drei Könige', 'public'),
('ph_2026_st_reformation', 'ST', '2026-10-31', 'Reformation Day', 'Reformationstag', 'public');

-- Schleswig-Holstein (SH): Reformation Day
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
('ph_2024_sh_reformation', 'SH', '2024-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2025_sh_reformation', 'SH', '2025-10-31', 'Reformation Day', 'Reformationstag', 'public'),
('ph_2026_sh_reformation', 'SH', '2026-10-31', 'Reformation Day', 'Reformationstag', 'public');

-- Thüringen (TH): Reformation Day, World Children's Day
INSERT INTO public_holidays (id, bundesland, date, name_en, name_de, type) VALUES
-- 2024
('ph_2024_th_kindertag', 'TH', '2024-09-20', 'World Children''s Day', 'Weltkindertag', 'public'),
('ph_2024_th_reformation', 'TH', '2024-10-31', 'Reformation Day', 'Reformationstag', 'public'),
-- 2025
('ph_2025_th_kindertag', 'TH', '2025-09-20', 'World Children''s Day', 'Weltkindertag', 'public'),
('ph_2025_th_reformation', 'TH', '2025-10-31', 'Reformation Day', 'Reformationstag', 'public'),
-- 2026
('ph_2026_th_kindertag', 'TH', '2026-09-20', 'World Children''s Day', 'Weltkindertag', 'public'),
('ph_2026_th_reformation', 'TH', '2026-10-31', 'Reformation Day', 'Reformationstag', 'public');
