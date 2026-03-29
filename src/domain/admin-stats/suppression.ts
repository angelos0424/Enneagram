import {
  ADMIN_STATS_SMALL_CELL_THRESHOLD,
  type AdminStatsCountCell,
  type AdminStatsDistribution,
  type AdminStatsDistributionBucket,
} from "./types";

export function suppressCount(
  count: number,
  threshold: number = ADMIN_STATS_SMALL_CELL_THRESHOLD,
): AdminStatsCountCell {
  if (count < threshold) {
    return {
      kind: "suppressed",
      reason: "small_cell",
    };
  }

  return {
    kind: "visible",
    count,
  };
}

export function buildSuppressedDistribution(
  buckets: Array<{ key: string; label: string; count: number }>,
  threshold: number = ADMIN_STATS_SMALL_CELL_THRESHOLD,
): AdminStatsDistribution {
  const suppressedBuckets: AdminStatsDistributionBucket[] = buckets.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    count: bucket.count < threshold ? null : bucket.count,
    isSuppressed: bucket.count < threshold,
  }));
  const suppressedBucketCount = suppressedBuckets.filter((bucket) => bucket.isSuppressed).length;

  return {
    buckets: suppressedBuckets,
    totalCount:
      suppressedBucketCount > 0
        ? null
        : suppressedBuckets.reduce((sum, bucket) => sum + (bucket.count ?? 0), 0),
    suppressedBucketCount,
    suppressionThreshold: threshold,
  };
}
