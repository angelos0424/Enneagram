ALTER TABLE "assessment_results" ALTER COLUMN "wing_type" DROP NOT NULL;
ALTER TABLE "assessment_results" ADD COLUMN "result_status" text NOT NULL DEFAULT 'clear';
ALTER TABLE "assessment_results" ADD COLUMN "confidence_score" real NOT NULL DEFAULT 0;
ALTER TABLE "assessment_results" ALTER COLUMN "result_status" DROP DEFAULT;
ALTER TABLE "assessment_results" ALTER COLUMN "confidence_score" DROP DEFAULT;
