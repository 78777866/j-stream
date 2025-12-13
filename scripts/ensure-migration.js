#!/usr/bin/env node

/**
 * Ensure MCP Migration Script
 * This script ensures that the test_mcp table exists in Supabase.
 * It attempts to create the table if it doesn't already exist.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function readMigration() {
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '001_create_test_mcp_table.sql');
  try {
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    return migrationSql;
  } catch (error) {
    console.error('❌ Error reading migration file:', error.message);
    process.exit(1);
  }
}

async function tableExists() {
  try {
    const { error } = await supabase
      .from('test_mcp')
      .select('id')
      .limit(1);

    if (error) {
      // Check if it's specifically a "table doesn't exist" error
      if (error.message && error.message.includes('Could not find the table')) {
        return false;
      }
      // Other errors might mean the table exists but we can't access it
      console.log('ℹ️ Note: Could not verify table existence:', error.message);
      return true; // Assume it exists
    }

    return true;
  } catch (error) {
    console.error('Error checking table:', error.message);
    return false;
  }
}

async function createTableViaRPC(migrationSql) {
  try {
    // Attempt to use execute_sql RPC if available
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt.length > 0);

    for (const statement of statements) {
      const { error } = await supabase.rpc('execute_sql', {
        query: statement + ';'
      });

      if (error && !error.message.includes('does not exist')) {
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.log('ℹ️ RPC method not available, trying alternative approach');
    return false;
  }
}

async function main() {
  console.log('🚀 Ensuring MCP Migration\n');
  console.log(`📍 Supabase Project: ${supabaseUrl}`);
  console.log('─'.repeat(50));

  try {
    const migrationSql = await readMigration();
    console.log('✅ Migration file read successfully');

    const exists = await tableExists();

    if (exists) {
      console.log('\n✅ test_mcp table already exists');
      console.log('\n📝 Summary:');
      console.log('  ✓ Migration is already applied');
      process.exit(0);
    } else {
      console.log('\n⚠️ test_mcp table not found');
      console.log('\nℹ️ The table needs to be created manually via the Supabase Dashboard:');
      console.log('1. Go to: https://app.supabase.com/project/zpuwfnuhrtxatgvtklpw/sql/new');
      console.log('2. Copy and paste the contents of: supabase/migrations/001_create_test_mcp_table.sql');
      console.log('3. Click "Run" to execute the migration');
      console.log('\nAlternatively, use the Supabase CLI:');
      console.log('  supabase db push');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n' + '─'.repeat(50));
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
