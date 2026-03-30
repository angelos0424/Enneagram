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

export function normalizeIndependentScores(
  rawScores: Record<EnneagramType, number>,
  maxAbsoluteScores: Record<EnneagramType, number>,
): Record<EnneagramType, number> {
  return {
    1: normalizeCenteredScore(rawScores[1], maxAbsoluteScores[1]),
    2: normalizeCenteredScore(rawScores[2], maxAbsoluteScores[2]),
    3: normalizeCenteredScore(rawScores[3], maxAbsoluteScores[3]),
    4: normalizeCenteredScore(rawScores[4], maxAbsoluteScores[4]),
    5: normalizeCenteredScore(rawScores[5], maxAbsoluteScores[5]),
    6: normalizeCenteredScore(rawScores[6], maxAbsoluteScores[6]),
    7: normalizeCenteredScore(rawScores[7], maxAbsoluteScores[7]),
    8: normalizeCenteredScore(rawScores[8], maxAbsoluteScores[8]),
    9: normalizeCenteredScore(rawScores[9], maxAbsoluteScores[9]),
  };
}

function normalizeCenteredScore(rawScore: number, maxAbsoluteScore: number): number {
  if (maxAbsoluteScore <= 0) {
    return 50;
  }

  return Math.round((((rawScore + maxAbsoluteScore) / (maxAbsoluteScore * 2)) * 1000)) / 10;
}
