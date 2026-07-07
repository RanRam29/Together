-- Together Platform — Initial Schema
-- Migration 001: Core tables, enums, extensions
-- Based on DEVELOPMENT_PLAN.md v2.0

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "postgis";           -- Geographic queries
CREATE EXTENSION IF NOT EXISTS "pg_cron";            -- Scheduled jobs (emergency center)

-- ============================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================

CREATE TYPE user_role AS ENUM ('parent', 'professional', 'admin');

CREATE TYPE verification_status AS ENUM ('pending', 'submitted', 'verified', 'rejected');

CREATE TYPE match_request_status AS ENUM (
  'pending',      -- משלבת טרם הגיבה
  'interested',   -- משלבת מעוניינת
  'approved',     -- הורה אישר — TIER 2
  'rejected',     -- הורה דחה
  'expired',      -- פג תוקף
  'withdrawn'     -- הורה ביטל
);

CREATE TYPE match_status AS ENUM (
  'active',       -- match פעיל — TIER 3
  'paused',       -- מושהה זמנית
  'ended',        -- הסתיים
  'cancelled'     -- בוטל
);

CREATE TYPE document_type AS ENUM (
  'certificate',      -- תעודה מקצועית
  'criminal_record',  -- תעודת יושר
  'id_card',          -- תעודת זהות
  'degree',           -- תואר
  'other'
);

CREATE TYPE reviewer_role AS ENUM ('parent', 'professional');

CREATE TYPE framework_type AS ENUM (
  'regular_school',       -- בית ספר רגיל
  'special_ed',           -- חינוך מיוחד
  'kindergarten',         -- גן
  'special_kindergarten', -- גן מיוחד
  'daycare',              -- מעון
  'home',                 -- בית
  'other'
);

CREATE TYPE need_category AS ENUM (
  'autism',               -- ספקטרום האוטיזם
  'adhd',                 -- ADHD
  'learning_disability',  -- לקויות למידה
  'physical',             -- מוגבלות פיזית
  'hearing',              -- כבדי שמיעה
  'vision',               -- כבדי ראייה
  'intellectual',         -- מוגבלות שכלית
  'emotional',            -- הפרעות רגשיות
  'speech',               -- הפרעות דיבור ושפה
  'other'
);

-- ============================================================
-- PROFILES — extends Supabase auth.users
-- ============================================================

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role NOT NULL,
  phone       TEXT,
  full_name   TEXT,
  area        TEXT,                              -- אזור כללי (עיר/אזור)
  preferred_language TEXT NOT NULL DEFAULT 'he',  -- he / en
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CHILDREN — TIER 0–1 (visible to verified professionals)
-- ============================================================

CREATE TABLE children (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name          TEXT NOT NULL,
  age                 INTEGER NOT NULL CHECK (age >= 0 AND age <= 21),
  category            need_category NOT NULL,
  secondary_category  need_category,
  functioning_level   INTEGER NOT NULL CHECK (functioning_level BETWEEN 1 AND 3),
  framework           framework_type NOT NULL,
  communication_verbal BOOLEAN NOT NULL DEFAULT true,
  hours_needed        JSONB,                    -- { "sunday": [8,14], "monday": [8,14] ... }
  needs               JSONB,                    -- גמיש — משתנה לפי אבחנה
  published           BOOLEAN NOT NULL DEFAULT false,
  location            geography(Point, 4326),   -- PostGIS: מיקום כללי של המסגרת
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_children_parent ON children(parent_id);
CREATE INDEX idx_children_published ON children(published) WHERE published = true;
CREATE INDEX idx_children_location ON children USING GIST(location);
CREATE INDEX idx_children_category ON children(category);

-- ============================================================
-- CHILD_DETAILS — TIER 2–3 (only after parent approval)
-- ============================================================

CREATE TABLE child_details (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id          UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
  full_name         TEXT,
  diagnosis_full    TEXT,                       -- אבחנה מלאה
  what_works        TEXT,                       -- מה עובד על הילד
  what_triggers     TEXT,                       -- מה מפעיל לרעה
  gender_preference TEXT,                       -- העדפת מגדר למשלבת
  parent_contact    JSONB,                      -- { phone, email, preferred_method }
  win_definition    TEXT,                       -- מה ה"ניצחון" שההורה רוצה
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_child_details_child ON child_details(child_id);

-- ============================================================
-- PROFESSIONALS — משלבות/מטפלות
-- ============================================================

CREATE TABLE professionals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  display_name      TEXT NOT NULL,
  bio               TEXT,
  type              TEXT NOT NULL DEFAULT 'mashlavit',  -- mashlavit / therapist / other
  specialties       need_category[] NOT NULL DEFAULT '{}',
  certifications    TEXT[] NOT NULL DEFAULT '{}',
  experience_years  INTEGER DEFAULT 0,
  availability      JSONB,                     -- { "sunday": [8,14], ... }
  languages         TEXT[] NOT NULL DEFAULT '{he}',
  framework_types   framework_type[] NOT NULL DEFAULT '{}',
  verified          verification_status NOT NULL DEFAULT 'pending',
  verified_at       TIMESTAMPTZ,
  verified_by       UUID REFERENCES profiles(id),
  rating_avg        NUMERIC(3,2) DEFAULT 0,
  rating_count      INTEGER DEFAULT 0,
  backup_available  BOOLEAN NOT NULL DEFAULT false,  -- פנויה להחלפה (חמ"ל)
  location          geography(Point, 4326),    -- PostGIS: מיקום מגורים
  max_radius_km     INTEGER DEFAULT 15,        -- רדיוס עבודה מקסימלי
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_professionals_user ON professionals(user_id);
CREATE INDEX idx_professionals_verified ON professionals(verified);
CREATE INDEX idx_professionals_location ON professionals USING GIST(location);
CREATE INDEX idx_professionals_specialties ON professionals USING GIN(specialties);
CREATE INDEX idx_professionals_backup ON professionals(backup_available) WHERE backup_available = true;

-- ============================================================
-- MATCH REQUESTS — בקשות (TIER 1–2 flow)
-- ============================================================

CREATE TABLE match_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id          UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  professional_id   UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  status            match_request_status NOT NULL DEFAULT 'pending',
  initiated_by      TEXT NOT NULL DEFAULT 'parent',  -- parent / professional
  cover_letter      TEXT,                       -- מכתב 3–5 משפטים מהמשלבת
  parent_message    TEXT,                       -- הודעת ההורה
  tier_reached      INTEGER NOT NULL DEFAULT 0 CHECK (tier_reached BETWEEN 0 AND 3),
  score             NUMERIC(5,2),               -- ציון התאמה
  match_reason      TEXT,                       -- הסבר תאימות
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(child_id, professional_id)
);

CREATE INDEX idx_match_requests_child ON match_requests(child_id);
CREATE INDEX idx_match_requests_professional ON match_requests(professional_id);
CREATE INDEX idx_match_requests_status ON match_requests(status);

-- ============================================================
-- MATCHES — התאמות פעילות (TIER 3)
-- ============================================================

CREATE TABLE matches (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id          UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  professional_id   UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  request_id        UUID REFERENCES match_requests(id),
  status            match_status NOT NULL DEFAULT 'active',
  score             NUMERIC(5,2),
  match_reason      TEXT,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at          TIMESTAMPTZ,
  end_reason        TEXT,

  UNIQUE(child_id, professional_id)
);

CREATE INDEX idx_matches_child ON matches(child_id);
CREATE INDEX idx_matches_professional ON matches(professional_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_active ON matches(status) WHERE status = 'active';

-- ============================================================
-- CHECKINS — EVV GPS Check-in
-- ============================================================

CREATE TABLE checkins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  location    geography(Point, 4326) NOT NULL,
  is_valid    BOOLEAN,                          -- תוצאת geofence check
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_checkins_match ON checkins(match_id);
CREATE INDEX idx_checkins_date ON checkins(created_at);

-- ============================================================
-- DAILY LOGS — מיקרו-שאלון פדגוגי
-- ============================================================

CREATE TABLE daily_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  log_date    DATE NOT NULL,
  mood        INTEGER CHECK (mood BETWEEN 1 AND 5),   -- 1=קשה, 5=מצוין
  metrics     JSONB,                            -- { "social_initiatives": 3, "regulation": 4 }
  notes       TEXT,
  ai_summary  TEXT,                             -- סיכום AI להורה
  ai_strategy TEXT,                             -- הצעת אסטרטגיה למחר
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(match_id, log_date)
);

CREATE INDEX idx_daily_logs_match ON daily_logs(match_id);
CREATE INDEX idx_daily_logs_date ON daily_logs(log_date);

-- ============================================================
-- REVIEWS — דירוג הדדי
-- ============================================================

CREATE TABLE reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id          UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  reviewer_id       UUID NOT NULL REFERENCES profiles(id),
  reviewer_role     reviewer_role NOT NULL,
  reliability       INTEGER NOT NULL CHECK (reliability BETWEEN 1 AND 5),
  professionalism   INTEGER NOT NULL CHECK (professionalism BETWEEN 1 AND 5),
  child_fit         INTEGER NOT NULL CHECK (child_fit BETWEEN 1 AND 5),
  text              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(match_id, reviewer_id)
);

CREATE INDEX idx_reviews_match ON reviews(match_id);

-- ============================================================
-- DOCUMENT UPLOADS — מסמכים לאימות
-- ============================================================

CREATE TABLE document_uploads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doc_type      document_type NOT NULL,
  storage_path  TEXT NOT NULL,
  file_name     TEXT,
  verified      BOOLEAN NOT NULL DEFAULT false,
  verified_by   UUID REFERENCES profiles(id),
  verified_at   TIMESTAMPTZ,
  rejection_note TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_owner ON document_uploads(owner_id);
CREATE INDEX idx_documents_pending ON document_uploads(verified) WHERE verified = false;

-- ============================================================
-- AUDIT LOG — תיעוד גישות ל-TIER 3
-- ============================================================

CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id),
  resource    TEXT NOT NULL,                    -- 'child_details', 'document', etc.
  resource_id UUID,
  action      TEXT NOT NULL,                    -- 'view', 'download', 'update'
  tier        INTEGER CHECK (tier BETWEEN 0 AND 3),
  metadata    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_resource ON audit_log(resource, resource_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- ============================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_children_updated
  BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_child_details_updated
  BEFORE UPDATE ON child_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_professionals_updated
  BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_match_requests_updated
  BEFORE UPDATE ON match_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE — trigger on auth.users insert
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')::user_role,
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
