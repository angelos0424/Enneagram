CREATE TABLE IF NOT EXISTS "assessment_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" text NOT NULL,
	"admin_token" text NOT NULL,
	"assessment_version" text NOT NULL,
	"scoring_version" text NOT NULL,
	"copy_version" text NOT NULL,
	"primary_type" text NOT NULL,
	"wing_type" text NOT NULL,
	"growth_type" text NOT NULL,
	"stress_type" text NOT NULL,
	"raw_scores" jsonb NOT NULL,
	"normalized_scores" jsonb NOT NULL,
	"nearby_types" jsonb NOT NULL,
	"answers" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "assessment_results_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "assessment_results_admin_token_unique" UNIQUE("admin_token")
);
