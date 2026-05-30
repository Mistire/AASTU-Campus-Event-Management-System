-- CreateTable
CREATE TABLE "graduation_configs" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "distinguished_min_gpa" DOUBLE PRECISION NOT NULL DEFAULT 3.75,
    "honors_min_gpa" DOUBLE PRECISION NOT NULL DEFAULT 3.50,
    "distinguished_slots" INTEGER NOT NULL DEFAULT 3,
    "honors_slots" INTEGER NOT NULL DEFAULT 2,
    "graduate_slots" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graduation_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "graduation_configs_event_id_key" ON "graduation_configs"("event_id");

-- AddForeignKey
ALTER TABLE "graduation_configs" ADD CONSTRAINT "graduation_configs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
