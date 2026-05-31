/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `registration_status` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "event_bookmarks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation_records" (
    "id" UUID NOT NULL,
    "invite_id" UUID NOT NULL,
    "full_name" VARCHAR NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "tier" VARCHAR NOT NULL,
    "guest_slots" INTEGER NOT NULL,
    "claim_token" VARCHAR NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "graduation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_passes" (
    "id" UUID NOT NULL,
    "graduation_record_id" UUID NOT NULL,
    "parent_label" VARCHAR NOT NULL,
    "delivery_method" VARCHAR NOT NULL,
    "telegram_username" VARCHAR,
    "parent_email" VARCHAR,
    "telegram_chat_id" VARCHAR,
    "telegram_token" VARCHAR,
    "qr_token" VARCHAR NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_passes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_bookmarks_user_id_event_id_key" ON "event_bookmarks"("user_id", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_records_invite_id_key" ON "graduation_records"("invite_id");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_records_claim_token_key" ON "graduation_records"("claim_token");

-- CreateIndex
CREATE UNIQUE INDEX "guest_passes_telegram_token_key" ON "guest_passes"("telegram_token");

-- CreateIndex
CREATE UNIQUE INDEX "guest_passes_qr_token_key" ON "guest_passes"("qr_token");

-- CreateIndex
CREATE UNIQUE INDEX "registration_status_name_key" ON "registration_status"("name");

-- AddForeignKey
ALTER TABLE "event_bookmarks" ADD CONSTRAINT "event_bookmarks_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_bookmarks" ADD CONSTRAINT "event_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_records" ADD CONSTRAINT "graduation_records_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "event_invites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_passes" ADD CONSTRAINT "guest_passes_graduation_record_id_fkey" FOREIGN KEY ("graduation_record_id") REFERENCES "graduation_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
