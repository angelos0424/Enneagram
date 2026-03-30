import { typeCopyDefinition } from "@/content/type-copy/ko/v1";
import { typeCopyDefinitionV2 } from "@/content/type-copy/ko/v2";
import type {
  EnneagramType,
  TypeCopyEntry,
} from "@/domain/assessment/types";

const typeCopyCatalog: Record<string, Record<EnneagramType, TypeCopyEntry>> = {
  [typeCopyDefinition.copyVersion]: typeCopyDefinition.entries,
  [typeCopyDefinitionV2.copyVersion]: typeCopyDefinitionV2.entries,
};

export function resolveResultCopy(
  copyVersion: string,
  typeId: EnneagramType,
): TypeCopyEntry {
  const versionedEntries = typeCopyCatalog[copyVersion];

  if (!versionedEntries) {
    throw new Error(`Unsupported result copy version: ${copyVersion}`);
  }

  return versionedEntries[typeId];
}
