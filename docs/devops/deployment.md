# Deployment

## Vercel (Primary)

### Build Command

Update `vercel.json`:
```json
{
  "buildCommand": "prisma migrate deploy && next build",
  "installCommand": "pnpm install"
}
```

`prisma migrate deploy` applies any pending migrations before the build. It does not reset data.

### Environment Variables in Vercel

Set all variables from [environment-variables.md](environment-variables.md) in the Vercel project settings under Settings → Environment Variables. Set them for Production, Preview, and Development environments as appropriate.

**Important**: `DATABASE_URL` must point to a production PostgreSQL instance (e.g., Neon, Supabase, Railway, or self-hosted). The local Docker instance is not accessible from Vercel.

### Recommended PostgreSQL Providers

| Provider | Notes |
|----------|-------|
| **Neon** | Serverless Postgres, free tier, auto-suspends, works well with Vercel |
| **Supabase** | Postgres + additional services, generous free tier |
| **Railway** | Simple self-hosted Postgres, predictable pricing |
| **Vercel Postgres** | Managed by Vercel, tight integration |

### Preview Deployments

Every PR gets a preview deployment. Set `DATABASE_URL` for the Preview environment to a separate database (not production) to avoid data contamination.

### Vercel Analytics

Already installed (`@vercel/analytics`). No additional configuration needed — it auto-detects the Vercel environment.

## Post-Deployment Checklist

After deploying to production for the first time:
1. Run `prisma db seed` against the production database (once only)
2. Verify the admin user can log in at `/login`
3. Test a Stripe test-mode purchase end-to-end
4. Check Stripe webhook is configured to point to `https://yourdomain.com/api/webhooks/stripe`
5. Verify email delivery with a test password-reset flow

## Database Backups

Neon and Supabase both offer point-in-time recovery. If self-hosting:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

Schedule daily backups via a cron job or a GitHub Actions workflow.
