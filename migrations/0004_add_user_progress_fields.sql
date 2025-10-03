ALTER TABLE "users" ADD COLUMN "current_course_index" integer DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "course_completions" jsonb DEFAULT '[]';