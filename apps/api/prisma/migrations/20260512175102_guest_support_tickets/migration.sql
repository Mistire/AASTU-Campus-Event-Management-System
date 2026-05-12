-- DropForeignKey
ALTER TABLE "support_messages" DROP CONSTRAINT "support_messages_user_id_fkey";

-- DropForeignKey
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_user_id_fkey";

-- AlterTable
ALTER TABLE "support_messages" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "support_tickets" ADD COLUMN     "guest_email" VARCHAR,
ADD COLUMN     "guest_name" VARCHAR,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
