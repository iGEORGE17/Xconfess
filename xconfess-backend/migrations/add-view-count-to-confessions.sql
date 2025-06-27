-- Migration: Add view_count to confessions
ALTER TABLE confessions ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;
