# Supabase Migration Guide: test_mcp Table

## Overview

This document describes the migration that creates the `test_mcp` table for MCP (Model Context Protocol) integration testing and verification.

**Project ID**: `zpuwfnuhrtxatgvtklpw`  
**Dashboard URL**: https://app.supabase.com/project/zpuwfnuhrtxatgvtklpw

## Current Status

- ✅ Migration file created: `supabase/migrations/001_create_test_mcp_table.sql`
- ✅ Verification scripts created: `scripts/verify-mcp-migration.js`
- ⏳ **Action Required**: Apply migration to Supabase database (see instructions below)
- ⏳ Verification pending (will pass once migration is applied)

## Migration File

Location: `supabase/migrations/001_create_test_mcp_table.sql`

## Migration Details

### Table Schema

The migration creates a table called `test_mcp` with the following columns:

- **id**: BIGSERIAL PRIMARY KEY
  - Auto-incrementing unique identifier
  
- **name**: TEXT NOT NULL
  - Required name field for test entries
  
- **description**: TEXT
  - Optional description field for additional context
  
- **created_at**: TIMESTAMP WITH TIME ZONE
  - Automatically set to current timestamp on creation
  
- **updated_at**: TIMESTAMP WITH TIME ZONE
  - Automatically set to current timestamp, updates on modification

### Security (RLS - Row Level Security)

The table has RLS enabled with the following policies for authenticated users:

1. **READ**: SELECT access to all rows
2. **INSERT**: Ability to insert new rows
3. **UPDATE**: Ability to update existing rows
4. **DELETE**: Ability to delete rows

All policies are configured to allow authenticated users full CRUD access.

## How to Apply the Migration

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Project: https://app.supabase.com/project/zpuwfnuhrtxatgvtklpw
2. Navigate to **SQL Editor** from the left sidebar
3. Click **"New Query"** button
4. Open the file `supabase/migrations/001_create_test_mcp_table.sql`
5. Copy the entire SQL content
6. Paste it into the SQL editor
7. Click **"Run"** button to execute
8. You should see a success message

### Method 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI if not already installed
npm install -g @supabase/cli

# Link your project
supabase link --project-ref zpuwfnuhrtxatgvtklpw

# Apply migrations
supabase db push

# For development only
supabase migration new create_test_mcp_table
```

### Method 3: Using the Verification Script

After applying the migration manually via the dashboard, verify it with:

```bash
# Using the Node.js verification script
node scripts/verify-mcp-migration.js

# Or with npm (if you add a script to package.json)
npm run verify-migration
```

## Verification

### Running the Verification Script

A verification script is provided at `scripts/verify-mcp-migration.js` that:

1. ✅ Reads the migration file
2. ✅ Verifies the table exists
3. ✅ Verifies the table schema
4. ✅ Tests basic CRUD operations
5. ✅ Cleans up test data

### Expected Output

```
🚀 Starting MCP Migration Verification

📍 Supabase Project: https://zpuwfnuhrtxatgvtklpw.supabase.co
──────────────────────────────────────────────────
✅ Migration file read successfully
📝 Migration SQL loaded (1116 bytes)
🔍 Verifying table exists...
✅ test_mcp table exists and is accessible
📊 Verifying table schema...
✅ Schema verified - insert operation successful
📋 Table structure includes:
  - id: BIGSERIAL PRIMARY KEY
  - name: TEXT NOT NULL
  - description: TEXT
  - created_at: TIMESTAMP WITH TIME ZONE
  - updated_at: TIMESTAMP WITH TIME ZONE
✅ Test data cleaned up
──────────────────────────────────────────────────
✅ All verification checks passed!

📝 Summary:
  ✓ Migration file read successfully
  ✓ test_mcp table exists
  ✓ Table schema is correct
```

## Usage Examples

### Insert a Record

```javascript
const { data, error } = await supabase
  .from('test_mcp')
  .insert([
    {
      name: 'Test Entry',
      description: 'This is a test entry'
    }
  ])
  .select();
```

### Read Records

```javascript
const { data, error } = await supabase
  .from('test_mcp')
  .select('*');
```

### Update a Record

```javascript
const { data, error } = await supabase
  .from('test_mcp')
  .update({
    description: 'Updated description'
  })
  .eq('id', 1)
  .select();
```

### Delete a Record

```javascript
const { data, error } = await supabase
  .from('test_mcp')
  .delete()
  .eq('id', 1);
```

## Troubleshooting

### Error: "table already exists"

If you see this error, it means the table has already been created. This is harmless - the migration uses `CREATE TABLE IF NOT EXISTS`, so re-running it is safe.

### Error: "permission denied"

This typically means your Supabase user doesn't have the necessary permissions. Try:
1. Use the Supabase Dashboard SQL Editor (it uses service role permissions)
2. Ensure you're logged in with the correct account

### Error: "Could not find the table in the schema cache"

The schema cache might be stale. Try:
1. Refresh the browser/application
2. Clear the browser cache
3. Use the Supabase CLI to clear the cache: `supabase cache clear`

## Files in This Migration

- `supabase/migrations/001_create_test_mcp_table.sql` - The migration SQL
- `scripts/verify-mcp-migration.js` - Verification script (Node.js)
- `scripts/apply-migration.js` - Helper script for applying migrations
- `MIGRATION_GUIDE.md` - This guide

## Next Steps

After successfully applying the migration, you can:

1. Use the `test_mcp` table in your application
2. Create additional migrations by adding new files to `supabase/migrations/`
3. Set up automated migration checks in your CI/CD pipeline
4. Extend the table schema with additional columns as needed

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase SQL Editor](https://app.supabase.com/project/zpuwfnuhrtxatgvtklpw/sql)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
