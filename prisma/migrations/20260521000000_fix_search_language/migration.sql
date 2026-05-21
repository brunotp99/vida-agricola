-- Fix full-text search language: product names/descriptions are in English, not Portuguese
ALTER TABLE "Product" DROP COLUMN IF EXISTS "searchVector";

ALTER TABLE "Product"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(description, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS "Product_searchVector_idx"
  ON "Product" USING GIN ("searchVector");
