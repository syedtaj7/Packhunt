-- Drop the old embedding column and recreate with 384 dimensions
ALTER TABLE "Package" DROP COLUMN IF EXISTS "embedding";
ALTER TABLE "Package" ADD COLUMN "embedding" vector(384);
