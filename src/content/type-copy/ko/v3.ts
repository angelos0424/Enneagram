import { typeCopyEntries } from "@/content/type-copy/ko/v1";
import { COPY_VERSION_V3 } from "@/domain/assessment/constants";

export const typeCopyDefinitionV3 = {
  copyVersion: COPY_VERSION_V3,
  entries: typeCopyEntries,
} as const;
