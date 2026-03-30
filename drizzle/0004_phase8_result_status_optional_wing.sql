ALTER TABLE "assessment_results" ALTER COLUMN "wing_type" DROP NOT NULL;
ALTER TABLE "assessment_results" ADD COLUMN "result_status" text;
ALTER TABLE "assessment_results" ADD COLUMN "confidence_score" real;

UPDATE "assessment_results"
SET "result_status" = 'clear'
WHERE "result_status" IS NULL;

UPDATE "assessment_results"
SET "confidence_score" = 0
WHERE "confidence_score" IS NULL;

ALTER TABLE "assessment_results" ALTER COLUMN "result_status" SET NOT NULL;
ALTER TABLE "assessment_results" ALTER COLUMN "confidence_score" SET NOT NULL;
