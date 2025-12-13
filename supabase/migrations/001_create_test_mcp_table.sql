-- Create test table for MCP connection
CREATE TABLE IF NOT EXISTS test_mcp_table (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comment for documentation
COMMENT ON TABLE test_mcp_table IS 'Test table created via MCP Supabase connection';
