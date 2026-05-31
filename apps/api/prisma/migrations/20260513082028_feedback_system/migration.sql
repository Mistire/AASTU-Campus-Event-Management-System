-- CreateEnum
CREATE TYPE "FeedbackQuestionType" AS ENUM ('RATING', 'TEXT', 'SHORT_TEXT', 'MULTIPLE_CHOICE', 'SCALE');

-- CreateTable
CREATE TABLE "feedback_tokens" (
    "id" UUID NOT NULL,
    "token_hash" VARCHAR NOT NULL,
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_form_templates" (
    "id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "created_by" UUID NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_questions" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "label" VARCHAR NOT NULL,
    "type" "FeedbackQuestionType" NOT NULL,
    "options" JSONB,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,

    CONSTRAINT "feedback_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_feedback_templates" (
    "event_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,

    CONSTRAINT "event_feedback_templates_pkey" PRIMARY KEY ("event_id","template_id")
);

-- CreateTable
CREATE TABLE "feedback_responses" (
    "id" UUID NOT NULL,
    "token_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_answers" (
    "id" UUID NOT NULL,
    "response_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "feedback_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feedback_tokens_token_hash_key" ON "feedback_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_tokens_event_id_user_id_key" ON "feedback_tokens"("event_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_responses_token_id_key" ON "feedback_responses"("token_id");

-- AddForeignKey
ALTER TABLE "feedback_tokens" ADD CONSTRAINT "feedback_tokens_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_tokens" ADD CONSTRAINT "feedback_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_form_templates" ADD CONSTRAINT "feedback_form_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_questions" ADD CONSTRAINT "feedback_questions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "feedback_form_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_feedback_templates" ADD CONSTRAINT "event_feedback_templates_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_feedback_templates" ADD CONSTRAINT "event_feedback_templates_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "feedback_form_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_responses" ADD CONSTRAINT "feedback_responses_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "feedback_tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_responses" ADD CONSTRAINT "feedback_responses_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_responses" ADD CONSTRAINT "feedback_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_answers" ADD CONSTRAINT "feedback_answers_response_id_fkey" FOREIGN KEY ("response_id") REFERENCES "feedback_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_answers" ADD CONSTRAINT "feedback_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "feedback_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
