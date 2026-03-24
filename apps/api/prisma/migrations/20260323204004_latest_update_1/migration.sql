/*
  Warnings:

  - You are about to drop the column `category_id` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `registrations` table. All the data in the column will be lost.
  - Added the required column `created_by` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_type_id` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_id` to the `registrations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_category_id_fkey";

-- AlterTable
ALTER TABLE "event_sessions" ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" VARCHAR,
ADD COLUMN     "session_type" VARCHAR;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "category_id",
ADD COLUMN     "created_by" UUID NOT NULL,
ADD COLUMN     "event_type_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "registrations" DROP COLUMN "status",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "status_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "event_categories" (
    "event_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "event_categories_pkey" PRIMARY KEY ("event_id","category_id")
);

-- CreateTable
CREATE TABLE "event_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,

    CONSTRAINT "event_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_access" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "access_type" VARCHAR NOT NULL,
    "requires_approval" BOOLEAN NOT NULL,

    CONSTRAINT "event_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_invites" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "invited_email" VARCHAR NOT NULL,
    "status" VARCHAR NOT NULL,

    CONSTRAINT "event_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speakers" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR NOT NULL,
    "bio" TEXT,
    "profile_image" VARCHAR,
    "organization" VARCHAR,

    CONSTRAINT "speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_speakers" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "speaker_id" UUID NOT NULL,

    CONSTRAINT "session_speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_media" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "file_url" VARCHAR NOT NULL,
    "media_type" VARCHAR NOT NULL,

    CONSTRAINT "session_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_status" (
    "id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "registration_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_fields" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "field_label" VARCHAR NOT NULL,
    "field_type" VARCHAR NOT NULL,
    "is_required" BOOLEAN NOT NULL,

    CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_responses" (
    "id" UUID NOT NULL,
    "registration_id" UUID NOT NULL,
    "field_id" UUID NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "form_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathons" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "team_size_min" INTEGER NOT NULL,
    "team_size_max" INTEGER NOT NULL,
    "submission_deadline" TIMESTAMP(3) NOT NULL,
    "judging_criteria" TEXT,

    CONSTRAINT "hackathons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "leader_id" UUID NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "project_title" VARCHAR NOT NULL,
    "description" TEXT,
    "repo_url" VARCHAR,
    "demo_url" VARCHAR,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judges" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,

    CONSTRAINT "judges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "judge_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "feedback" TEXT,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "event_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "registration_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_access" ADD CONSTRAINT "event_access_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invites" ADD CONSTRAINT "event_invites_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invites" ADD CONSTRAINT "event_invites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_speakers" ADD CONSTRAINT "session_speakers_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "event_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_speakers" ADD CONSTRAINT "session_speakers_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "speakers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_media" ADD CONSTRAINT "session_media_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "event_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "form_fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathons" ADD CONSTRAINT "hackathons_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judges" ADD CONSTRAINT "judges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judges" ADD CONSTRAINT "judges_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_judge_id_fkey" FOREIGN KEY ("judge_id") REFERENCES "judges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
