/*
  Warnings:

  - A unique constraint covering the columns `[event_id,invited_email]` on the table `event_invites` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[event_id,user_id]` on the table `event_organizers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[status_name]` on the table `event_status` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `event_types` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `tags` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,building,room_number]` on the table `venues` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `created_by` to the `announcements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invited_by` to the `event_invites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `venues` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "event_invites" DROP CONSTRAINT "event_invites_user_id_fkey";

-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "created_by" UUID NOT NULL;

-- AlterTable
ALTER TABLE "event_invites" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "invited_by" UUID NOT NULL,
ADD COLUMN     "responded_at" TIMESTAMP(3),
ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "event_organizers" ADD COLUMN     "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "responded_at" TIMESTAMP(3),
ADD COLUMN     "status" VARCHAR NOT NULL DEFAULT 'ACCEPTED';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "requires_approval" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "venues" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "event_invites_event_id_invited_email_key" ON "event_invites"("event_id", "invited_email");

-- CreateIndex
CREATE UNIQUE INDEX "event_organizers_event_id_user_id_key" ON "event_organizers"("event_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_status_status_name_key" ON "event_status"("status_name");

-- CreateIndex
CREATE UNIQUE INDEX "event_types_name_key" ON "event_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "venues_name_building_room_number_key" ON "venues"("name", "building", "room_number");

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invites" ADD CONSTRAINT "event_invites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invites" ADD CONSTRAINT "event_invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
