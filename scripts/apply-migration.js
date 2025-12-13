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
    console.log('✅ Migration file read successfully');
    return migrationSql;
  } catch (error) {
    console.error('❌ Error reading migration file:', error.message);
    process.exit(1);
  }
}

async function applyMigration(migrationSql) {
  try {
    console.log('\n📝 Applying migration...');
    
    // Split by semicolon but keep the statements clean
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt.length > 0)
      .map(stmt => stmt + ';');

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Try to execute using the Supabase REST API
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      console.log(`SQL: ${statement.substring(0, 60)}...`);
      
      try {
        // Use the REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({
            query: statement
          })
        });

        if (!response.ok) {
          const error = await response.text();
          console.log(`⚠️ Note: RPC execution not available - ${error}`);
        } else {
          console.log('✅ Statement executed');
        }
      } catch (error) {
        console.log(`⚠️ Note: Could not execute via RPC - ${error.message}`);
      }
    }

    console.log('\n✅ Migration application attempted');
    console.log('ℹ️ Note: Migration needs to be applied via Supabase Dashboard SQL Editor or CLI');
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting MCP Migration Application\n');
  console.log(`📍 Supabase Project: ${supabaseUrl}`);
  console.log('─'.repeat(50));

  try {
    const migrationSql = await readMigration();
    await applyMigration(migrationSql);
    
    console.log('\n' + '─'.repeat(50));
    console.log('ℹ️ Migration Details:');
    console.log('To apply this migration via Supabase Dashboard:');
    console.log('1. Go to https://app.supabase.com/project/zpuwfnuhrtxatgvtklpw/sql/new');
    console.log('2. Copy the content of supabase/migrations/001_create_test_mcp_table.sql');
    console.log('3. Paste it into the SQL editor');
    console.log('4. Click "Run" to execute');
    console.log('\nOr use Supabase CLI:');
    console.log('  supabase db push');
    process.exit(0);
  } catch (error) {
    console.error('\n' + '─'.repeat(50));
    console.error('❌ Migration process failed:', error.message);
    process.exit(1);
  }
}

main();
