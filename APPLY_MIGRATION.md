# How to Apply the test_mcp Migration

This guide walks you through the process of applying the test_mcp table migration to your Supabase project.

## Quick Start

The migration file is ready at: `supabase/migrations/001_create_test_mcp_table.sql`

Choose one of the three methods below to apply it:

---

## Method 1: Supabase Dashboard (Fastest for First-Time Setup) ⚡

This is the recommended method for initial setup.

### Steps:

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/project/zpuwfnuhrtxatgvtklpw/sql/new

2. **Copy the Migration SQL**
   - Open the file: `supabase/migrations/001_create_test_mcp_table.sql`
   - Select all content (Ctrl+A or Cmd+A)
   - Copy it (Ctrl+C or Cmd+C)

3. **Paste into SQL Editor**
   - In the Supabase dashboard, click on the SQL Editor query area
   - Paste the SQL code (Ctrl+V or Cmd+V)

4. **Execute the Migration**
   - Click the **"Run"** button (or press Cmd+Enter)
   - You should see a success message

5. **Verify Success**
   - Run the verification script:
     ```bash
     node scripts/verify-mcp-migration.js
     ```
   - Expected output includes: `✅ All verification checks passed!`

---

## Method 2: Supabase CLI (Best for CI/CD) 🔧

This method is ideal for automated deployments.

### Prerequisites:

```bash
# Install Supabase CLI globally
npm install -g @supabase/cli

# Or with Homebrew (macOS)
brew install supabase/tap/supabase
```

### Steps:

1. **Link Your Project**
   ```bash
   supabase link --project-ref zpuwfnuhrtxatgvtklpw
   ```
   - You'll be prompted to enter your Supabase password

2. **Push Migrations**
   ```bash
   supabase db push
   ```
   - This will apply all migrations in `supabase/migrations/`
   - Output will show: `Applied 001_create_test_mcp_table migration`

3. **Verify Success**
   ```bash
   node scripts/verify-mcp-migration.js
   ```

---

## Method 3: Direct SQL Query (Manual Alternative)

### Steps:

1. **Open SQL Editor**
   - Navigate to: https://app.supabase.com/project/zpuwfnuhrtxatgvtklpw/sql/new

2. **Create New Query**
   - Click "New query" button

3. **Copy and Execute Each Statement**
   - The SQL has several statements separated by semicolons
   - You can either:
     - Paste the entire file and click "Run" (recommended)
     - Copy each statement one by one and execute separately

4. **Verify**
   ```bash
   node scripts/verify-mcp-migration.js
   ```

---

## Verification

After applying the migration, verify it was successful:

```bash
# Run the verification script
node scripts/verify-mcp-migration.js
```

### Expected Output:

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

---

## What Does the Migration Do?

The migration creates a `test_mcp` table with:

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL PRIMARY KEY | Auto-incrementing ID |
| `name` | TEXT NOT NULL | Required name field |
| `description` | TEXT | Optional description |
| `created_at` | TIMESTAMP WITH TIME ZONE | Auto-created timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | Auto-updated timestamp |

### Security Features:

- ✅ Row Level Security (RLS) enabled
- ✅ Authenticated users can READ, INSERT, UPDATE, and DELETE
- ✅ Public access is restricted

---

## Troubleshooting

### Error: "You do not have permission to create tables"

**Solution**: Make sure you're using the Supabase dashboard (SQL Editor), not just the anon key. The dashboard uses service role permissions.

### Error: "Table already exists"

**Solution**: This is harmless! The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to re-run.

### Error: "Could not find the table in the schema cache"

**Solution**: 
- Refresh your browser (F5)
- Clear your browser cache
- Wait a few seconds for Supabase to sync

### Error: "Cannot execute the migration"

**Solution**:
1. Verify you're connected to the correct Supabase project
2. Check that your credentials have the right permissions
3. Try using the Supabase CLI instead of the Dashboard

---

## Next Steps

After successfully applying the migration:

1. **Run the verification script** to confirm everything works
2. **Commit the changes** to your repository:
   ```bash
   git add supabase/
   git commit -m "Apply test_mcp table migration"
   git push
   ```

3. **Use the table in your application**:
   ```javascript
   // Example: Insert data
   const { data, error } = await supabase
     .from('test_mcp')
     .insert([{
       name: 'Test Entry',
       description: 'This is a test'
     }])
     .select();
   ```

---

## Support

For more information:
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
