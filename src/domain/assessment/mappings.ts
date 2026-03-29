import type { EnneagramType } from "@/domain/assessment/types";

export const growthStressMap: Record<
  EnneagramType,
  { growth: EnneagramType; stress: EnneagramType }
> = {
  1: { growth: 7, stress: 4 },
  2: { growth: 4, stress: 8 },
  3: { growth: 6, stress: 9 },
  4: { growth: 1, stress: 2 },
  5: { growth: 8, stress: 7 },
  6: { growth: 9, stress: 3 },
  7: { growth: 5, stress: 1 },
  8: { growth: 2, stress: 5 },
  9: { growth: 3, stress: 6 },
};

export const wingAdjacencyMap: Record<
  EnneagramType,
  readonly [EnneagramType, EnneagramType]
> = {
  1: [2, 9],
  2: [1, 3],
  3: [2, 4],
  4: [3, 5],
  5: [4, 6],
  6: [5, 7],
  7: [6, 8],
  8: [7, 9],
  9: [1, 8],
};
