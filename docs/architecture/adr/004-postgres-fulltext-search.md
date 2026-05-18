# ADR 004: Use PostgreSQL Full-Text Search over Elasticsearch / Algolia

**Status**: Accepted

## Context

We need a search implementation for the product catalog. Options: PostgreSQL full-text search (tsvector/GIN), Elasticsearch, Algolia, Typesense, or Meilisearch.

## Decision

Use **PostgreSQL full-text search** via `tsvector` and GIN indexes.

## Rationale

- **No additional infrastructure** — search runs in the same PostgreSQL instance we already require
- **No additional cost** — external search services charge per record or per request
- The product catalog is small (<10,000 products initially) — PostgreSQL FTS is performant at this scale
- `tsvector` supports Portuguese stemming via `to_tsvector('portuguese', ...)`, which matches our target market
- A generated `STORED` tsvector column with a GIN index means search queries are index-only scans

## Trade-offs

- Algolia / Typesense provide typo tolerance, synonym expansion, and faceted search out of the box — these would require custom implementation in PostgreSQL
- If the catalog grows beyond ~50,000 products, PostgreSQL FTS may need to be replaced with a dedicated search engine
- Relevance ranking (`ts_rank`) is less sophisticated than ML-based ranking in dedicated search services

## Implementation

```sql
ALTER TABLE "Product"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('portuguese',
      coalesce(name, '') || ' ' || coalesce(description, '')
    )
  ) STORED;

CREATE INDEX "Product_searchVector_idx" ON "Product" USING GIN ("searchVector");
```

Query example:
```sql
SELECT * FROM "Product"
WHERE "searchVector" @@ plainto_tsquery('portuguese', $1)
ORDER BY ts_rank("searchVector", plainto_tsquery('portuguese', $1)) DESC;
```
