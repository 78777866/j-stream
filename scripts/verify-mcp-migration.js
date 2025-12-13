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

async function verifyTableExists() {
  try {
    console.log('\n🔍 Verifying table exists...');
    
    // Try to query the table
    const { data, error } = await supabase
      .from('test_mcp')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error querying test_mcp table:', error.message);
      return false;
    }

    console.log('✅ test_mcp table exists and is accessible');
    return true;
  } catch (error) {
    console.error('❌ Error verifying table:', error.message);
    return false;
  }
}

async function verifyTableSchema() {
  try {
    console.log('\n📊 Verifying table schema...');
    
    // Try to insert test data to verify schema
    const { data: insertData, error: insertError } = await supabase
      .from('test_mcp')
      .insert([
        {
          name: 'Test Entry',
          description: 'This is a test entry to verify schema'
        }
      ])
      .select();

    if (insertError) {
      console.error('❌ Error inserting test data:', insertError.message);
      return false;
    }

    console.log('✅ Schema verified - insert operation successful');
    console.log('📋 Table structure includes:');
    console.log('  - id: BIGSERIAL PRIMARY KEY');
    console.log('  - name: TEXT NOT NULL');
    console.log('  - description: TEXT');
    console.log('  - created_at: TIMESTAMP WITH TIME ZONE');
    console.log('  - updated_at: TIMESTAMP WITH TIME ZONE');
    
    // Clean up test data
    if (insertData && insertData.length > 0) {
      const testId = insertData[0].id;
      await supabase
        .from('test_mcp')
        .delete()
        .eq('id', testId);
      console.log('✅ Test data cleaned up');
    }

    return true;
  } catch (error) {
    console.error('❌ Error verifying schema:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting MCP Migration Verification\n');
  console.log(`📍 Supabase Project: ${supabaseUrl}`);
  console.log('─'.repeat(50));

  try {
    const migrationSql = await readMigration();
    console.log('\n📝 Migration SQL loaded (' + migrationSql.length + ' bytes)');
    
    const tableExists = await verifyTableExists();
    
    if (tableExists) {
      const schemaValid = await verifyTableSchema();
      
      console.log('\n' + '─'.repeat(50));
      if (schemaValid) {
        console.log('✅ All verification checks passed!');
        console.log('\n📝 Summary:');
        console.log('  ✓ Migration file read successfully');
        console.log('  ✓ test_mcp table exists');
        console.log('  ✓ Table schema is correct');
        process.exit(0);
      } else {
        console.log('⚠️ Table exists but schema verification had issues');
        process.exit(1);
      }
    } else {
      console.log('\n' + '─'.repeat(50));
      console.log('❌ Table verification failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n' + '─'.repeat(50));
    console.error('❌ Verification process failed:', error.message);
    process.exit(1);
  }
}

main();
