-- Add generated tsvector column for full-text search
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('portuguese',
      coalesce(name, '') || ' ' ||
      coalesce(description, '')
    )
  ) STORED;

-- Add GIN index for fast full-text queries
CREATE INDEX IF NOT EXISTS "Product_searchVector_idx"
  ON "Product" USING GIN ("searchVector");