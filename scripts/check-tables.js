const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('Checking tables in Supabase...');
  
  // Try to list some common tables
  const tables = ['users', 'auth.users', 'public.users', 'test_mcp'];
  
  for (const table of tables) {
    try {
      console.log(`\nTrying to access table: ${table}`);
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`  Error: ${error.message}`);
      } else {
        console.log(`  ✓ Table exists! Found ${data.length} rows`);
      }
    } catch (err) {
      console.log(`  Error: ${err.message}`);
    }
  }
}

main();
