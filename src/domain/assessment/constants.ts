export const ASSESSMENT_VERSION_V1 = "ko-enneagram-v1";
export const ASSESSMENT_VERSION_V2 = "ko-enneagram-v2";
export const ASSESSMENT_VERSION_V3 = "ko-enneagram-v3";
export const SCORING_VERSION_V1 = "scoring-ko-v1";
export const SCORING_VERSION_V2 = "scoring-ko-v2";
export const SCORING_VERSION_V3 = "scoring-ko-v3";
export const COPY_VERSION_V1 = "copy-ko-v1";
export const COPY_VERSION_V2 = "copy-ko-v2";
export const COPY_VERSION_V3 = "copy-ko-v3";

export const ASSESSMENT_VERSION = ASSESSMENT_VERSION_V1;
export const SCORING_VERSION = SCORING_VERSION_V1;
export const COPY_VERSION = COPY_VERSION_V1;
export const PRIMARY_TYPE_TIE_BREAK = "lowest-type-id";
export const WING_TIE_BREAK = "lower-adjacent-type-id";
export const NORMALIZATION_FORMULA =
  "round((rawScore / totalRawScore) * 1000) / 10";
export const INDEPENDENT_NORMALIZATION_FORMULA =
  "round((((rawScore - minRawScore) / (maxRawScore - minRawScore)) * 1000)) / 10";
export const FORCED_CHOICE_NORMALIZATION_FORMULA =
  "round((rawScore / exposureCount) * 1000) / 10";
export const NEARBY_TYPE_LIMIT = 3;
export const PHASE_1_PERSISTENCE_SCOPE = "schema-and-repository-contract-only";
