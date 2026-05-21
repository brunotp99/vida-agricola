-- Better Auth schema alignment (idempotent rewrite)
-- 1. Update Account table to match Better Auth field names

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Account' AND column_name = 'provider') THEN
    ALTER TABLE "Account" RENAME COLUMN "provider" TO "providerId";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Account' AND column_name = 'providerAccountId') THEN
    ALTER TABLE "Account" RENAME COLUMN "providerAccountId" TO "accountId";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Account' AND column_name = 'expiresAt') THEN
    ALTER TABLE "Account" RENAME COLUMN "expiresAt" TO "accessTokenExpiresAt";
  END IF;
END $$;

ALTER TABLE "Account"
  ADD COLUMN IF NOT EXISTS "password" TEXT,
  ADD COLUMN IF NOT EXISTS "idToken" TEXT,
  ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "scope" TEXT,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update unique index on Account
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Account_provider_providerAccountId_key') THEN
    DROP INDEX "Account_provider_providerAccountId_key";
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Account_providerId_accountId_key') THEN
    ALTER TABLE "Account" ADD CONSTRAINT "Account_providerId_accountId_key" UNIQUE ("providerId", "accountId");
  END IF;
END $$;

-- 2. Add updatedAt to Session
ALTER TABLE "Session"
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 3. Replace VerificationToken with Verification (Better Auth model name)
DROP TABLE IF EXISTS "VerificationToken";

CREATE TABLE IF NOT EXISTS "Verification" (
  "id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Verification_identifier_idx" ON "Verification"("identifier");
CREATE INDEX IF NOT EXISTS "Verification_value_idx" ON "Verification"("value");
