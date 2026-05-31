-- Add telegram_id to users (schema had the field but migration was never generated)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telegram_id" VARCHAR;

CREATE UNIQUE INDEX IF NOT EXISTS "users_telegram_id_key" ON "users"("telegram_id");
