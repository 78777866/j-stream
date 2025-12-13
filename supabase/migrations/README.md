# Supabase Migrations

This directory contains SQL migrations for the Supabase database.

## Current Migrations

### 001_create_test_mcp_table.sql

Creates the `test_mcp` table for MCP (Model Context Protocol) migration verification.

**Status**: Pending manual application to Supabase

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended for First-Time Setup)

1. Navigate to your Supabase project: https://app.supabase.com/project/zpuwfnuhrtxatgvtklpw
2. Go to the **SQL Editor** section from the left navigation
3. Click **"New query"** button
4. Copy the entire contents of `001_create_test_mcp_table.sql`
5. Paste into the SQL editor
6. Click **"Run"** button
7. You should see a confirmation message

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI globally (if not already installed)
npm install -g @supabase/cli

# Link your local project to Supabase
supabase link --project-ref zpuwfnuhrtxatgvtklpw

# Push all migrations to the database
supabase db push
```

### Option 3: Verify Migration

After applying the migration, verify it was successful:

```bash
# Run from the project root directory
node scripts/verify-mcp-migration.js
```

Expected output:
```
✅ test_mcp table exists and is accessible
✅ Schema verified - insert operation successful
✅ All verification checks passed!
```

## Migration Structure

Each migration file follows the naming convention:
```
NNN_description_in_snake_case.sql
```

Where:
- `NNN` is a zero-padded sequential number (001, 002, etc.)
- `description_in_snake_case` describes what the migration does

## Rollback

To rollback a migration, you would need to:

1. Create a new migration file that reverses the changes
2. Apply the new migration file

For example, to remove the test_mcp table, you would create:
```sql
DROP TABLE IF EXISTS test_mcp CASCADE;
```

## Best Practices

1. **One change per migration**: Each migration should make one logical change
2. **Idempotent**: Use `IF NOT EXISTS` and `IF EXISTS` clauses when possible
3. **Reversible**: Design migrations that can be undone if needed
4. **Document**: Include comments in the SQL explaining what and why
5. **Test Locally**: Test migrations in a local development environment first

## References

- [Supabase Migrations Documentation](https://supabase.com/docs/guides/database/migrations)
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
