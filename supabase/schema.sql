-- ==============================================================================
-- BMC Tool Database Schema for Supabase (PostgreSQL)
-- Compatible with Prisma ORM and Supabase Studio / REST API
-- ==============================================================================

-- 1. Enable UUID extension (useful for Supabase utilities)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create updated_at automatic trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create User Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Post Table
CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") 
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Create Project Table (BMC Business Model Canvas Projects)
CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 2,
    "data" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. Indexes for High Performance
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_post_authorId" ON "Post"("authorId");
CREATE INDEX IF NOT EXISTS "idx_project_userId" ON "Project"("userId");
CREATE INDEX IF NOT EXISTS "idx_project_updatedAt" ON "Project"("updatedAt");
CREATE INDEX IF NOT EXISTS "idx_project_data_gin" ON "Project" USING gin ("data");

-- 7. Triggers for Automatic UpdatedAt
DROP TRIGGER IF EXISTS set_user_updated_at ON "User";
CREATE TRIGGER set_user_updated_at
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_post_updated_at ON "Post";
CREATE TRIGGER set_post_updated_at
    BEFORE UPDATE ON "Post"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_project_updated_at ON "Project";
CREATE TRIGGER set_project_updated_at
    BEFORE UPDATE ON "Project"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Row Level Security (RLS) - Optional for Supabase
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;

-- Allow public read/write by default (if using without Supabase Auth)
-- You can tighten these policies when connecting Supabase Auth
DROP POLICY IF EXISTS "Public access to User" ON "User";
CREATE POLICY "Public access to User" ON "User" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to Post" ON "Post";
CREATE POLICY "Public access to Post" ON "Post" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to Project" ON "Project";
CREATE POLICY "Public access to Project" ON "Project" FOR ALL USING (true) WITH CHECK (true);
