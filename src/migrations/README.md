# Database migrations

Payload auto-pushes schema **only in development**. Production applies the
SQL migrations in this directory via `pnpm payload:migrate` (the Vercel Build
Command is `pnpm build:deploy`, which runs migrate before the build).

Generate the initial migration once, against any reachable Postgres with the
final collections (a local Docker DB or a Neon dev branch):

```bash
DATABASE_URL=postgres://… pnpm payload:migrate:create initial
git add src/migrations && git commit
```

Every later schema change repeats the same create → review-the-SQL → commit
cycle; the paired down-migration ships in the same file (runbooks/deploy.md,
Emergency Rollback step 2).
