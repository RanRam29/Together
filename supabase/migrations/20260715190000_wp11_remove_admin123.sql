-- WP11 Launch Hardening: Remove admin123 backfill functionality
-- Migration: 20260715190000_wp11_remove_admin123.sql

DROP FUNCTION IF EXISTS public.backfill_user_default_password(text);
