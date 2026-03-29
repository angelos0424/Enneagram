import type { EnneagramType } from "@/domain/assessment/types";

export function normalizeRawScores(
  rawScores: Record<EnneagramType, number>,
): Record<EnneagramType, number> {
  const totalRawScore = Object.values(rawScores).reduce(
    (sum, rawScore) => sum + rawScore,
    0,
  );

  if (totalRawScore === 0) {
    return {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
    };
  }

  return {
    1: Math.round((rawScores[1] / totalRawScore) * 1000) / 10,
    2: Math.round((rawScores[2] / totalRawScore) * 1000) / 10,
    3: Math.round((rawScores[3] / totalRawScore) * 1000) / 10,
    4: Math.round((rawScores[4] / totalRawScore) * 1000) / 10,
    5: Math.round((rawScores[5] / totalRawScore) * 1000) / 10,
    6: Math.round((rawScores[6] / totalRawScore) * 1000) / 10,
    7: Math.round((rawScores[7] / totalRawScore) * 1000) / 10,
    8: Math.round((rawScores[8] / totalRawScore) * 1000) / 10,
    9: Math.round((rawScores[9] / totalRawScore) * 1000) / 10,
  };
}
