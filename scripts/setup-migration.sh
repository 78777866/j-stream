#!/bin/bash

# Supabase Migration Setup Script
# This script helps with setting up the test_mcp migration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Supabase Migration Setup${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create a .env file with Supabase credentials"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Check if migration file exists
if [ ! -f "supabase/migrations/001_create_test_mcp_table.sql" ]; then
    echo -e "${RED}❌ Error: Migration file not found${NC}"
    echo "Expected: supabase/migrations/001_create_test_mcp_table.sql"
    exit 1
fi

echo -e "${GREEN}✅ Migration file found${NC}"

# Extract Supabase URL from .env
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env | cut -d '=' -f 2)
SUPABASE_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env | cut -d '=' -f 2)

echo ""
echo -e "${BLUE}Project Information:${NC}"
echo -e "  URL: ${SUPABASE_URL}"
echo -e "  Key: ${SUPABASE_KEY:0:50}..."

echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "To apply the migration, choose one of the following methods:"
echo ""
echo -e "${BLUE}1. Supabase Dashboard (Recommended)${NC}"
echo "   - Go to: ${SUPABASE_URL}/sql/new"
echo "   - Copy the contents of: supabase/migrations/001_create_test_mcp_table.sql"
echo "   - Paste and click 'Run'"
echo ""
echo -e "${BLUE}2. Supabase CLI${NC}"
echo "   - Install: npm install -g @supabase/cli"
echo "   - Link: supabase link --project-ref ${SUPABASE_URL##*/}"
echo "   - Push: supabase db push"
echo ""
echo -e "${BLUE}3. Verify the Migration${NC}"
echo "   - Run: node scripts/verify-mcp-migration.js"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js is available${NC}"

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found${NC}"
    echo "Run 'npm install' to install dependencies"
else
    echo -e "${GREEN}✅ Dependencies are installed${NC}"
fi

echo ""
echo -e "${GREEN}Setup complete! Follow the steps above to apply the migration.${NC}"
