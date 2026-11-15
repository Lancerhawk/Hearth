-- CreateEnum
CREATE TYPE "WorkspaceKind" AS ENUM ('HOME', 'PERSONAL');

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN "kind" "WorkspaceKind" NOT NULL DEFAULT 'HOME';
