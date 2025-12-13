-- Create test_mcp table for MCP migration verification
CREATE TABLE IF NOT EXISTS test_mcp (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on the table
ALTER TABLE test_mcp ENABLE ROW LEVEL SECURITY;

-- Create a policy for authenticated users to read their own data
CREATE POLICY "Allow authenticated users to read test_mcp"
  ON test_mcp
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a policy for authenticated users to insert
CREATE POLICY "Allow authenticated users to insert test_mcp"
  ON test_mcp
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create a policy for authenticated users to update
CREATE POLICY "Allow authenticated users to update test_mcp"
  ON test_mcp
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create a policy for authenticated users to delete
CREATE POLICY "Allow authenticated users to delete test_mcp"
  ON test_mcp
  FOR DELETE
  TO authenticated
  USING (true);
