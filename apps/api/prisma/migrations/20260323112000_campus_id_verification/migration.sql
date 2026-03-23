-- AlterTable
ALTER TABLE "users"
ADD COLUMN "student_id" VARCHAR,
ADD COLUMN "academic_program" VARCHAR,
ADD COLUMN "is_campus_id_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "campus_id_verified_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_student_id_key" ON "users"("student_id");