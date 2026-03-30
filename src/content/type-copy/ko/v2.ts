import { typeCopyEntries } from "@/content/type-copy/ko/v1";
import { COPY_VERSION_V2 } from "@/domain/assessment/constants";

export const typeCopyDefinitionV2 = {
  copyVersion: COPY_VERSION_V2,
  entries: typeCopyEntries,
} as const;
