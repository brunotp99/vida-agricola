-- Better Auth schema alignment
-- 1. Update Account table to match Better Auth field names
ALTER TABLE "Account" RENAME COLUMN "provider" TO "providerId";
ALTER TABLE "Account" RENAME COLUMN "providerAccountId" TO "accountId";
ALTER TABLE "Account" RENAME COLUMN "expiresAt" TO "accessTokenExpiresAt";
ALTER TABLE "Account"
  ADD COLUMN "password" TEXT,
  ADD COLUMN "idToken" TEXT,
  ADD COLUMN "refreshTokenExpiresAt" TIMESTAMP(3),
  ADD COLUMN "scope" TEXT,
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update unique constraint on Account
ALTER TABLE "Account" DROP CONSTRAINT "Account_provider_providerAccountId_key";
ALTER TABLE "Account" ADD CONSTRAINT "Account_providerId_accountId_key" UNIQUE ("providerId", "accountId");

-- 2. Add updatedAt to Session
ALTER TABLE "Session"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 3. Replace VerificationToken with Verification (Better Auth model name)
DROP TABLE "VerificationToken";

CREATE TABLE "Verification" (
  "id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");
CREATE INDEX "Verification_value_idx" ON "Verification"("value");
