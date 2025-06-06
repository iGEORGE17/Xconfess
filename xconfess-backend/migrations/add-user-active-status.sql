-- Add is_active column to users table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true;

-- Update existing users to be active
UPDATE "user" SET "is_active" = true WHERE "is_active" IS NULL; 