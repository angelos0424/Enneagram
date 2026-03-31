CREATE TABLE IF NOT EXISTS "assessment_draft_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" text NOT NULL,
	"assessment_version" text NOT NULL,
	"draft_answers" jsonb NOT NULL,
	"draft_progress" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "assessment_draft_sessions_session_token_unique" UNIQUE("session_token")
);
