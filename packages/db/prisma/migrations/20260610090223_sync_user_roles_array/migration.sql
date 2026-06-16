-- DropIndex
DROP INDEX "users_phone_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "active_role" "UserRole" NOT NULL DEFAULT 'tenant',
ADD COLUMN     "roles" "UserRole"[],
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nin_hash_key" ON "users"("nin_hash");

