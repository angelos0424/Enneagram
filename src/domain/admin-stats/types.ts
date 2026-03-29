export const ADMIN_STATS_TIME_ZONE = "Asia/Seoul";
export const ADMIN_STATS_SMALL_CELL_THRESHOLD = 5;

export type AdminStatsCountCell =
  | {
      kind: "visible";
      count: number;
    }
  | {
      kind: "suppressed";
      reason: "small_cell";
    };

export type AdminStatsDailySeriesEntry = {
  day: string;
  label: string;
  starts: AdminStatsCountCell;
  completions: AdminStatsCountCell;
  restartClicks: AdminStatsCountCell;
};

export type AdminStatsDistributionBucket = {
  key: string;
  label: string;
  count: number | null;
  isSuppressed: boolean;
};

export type AdminStatsDistribution = {
  buckets: AdminStatsDistributionBucket[];
  totalCount: number | null;
  suppressedBucketCount: number;
  suppressionThreshold: number;
};

export type AdminStatsDashboardData = {
  dailyActivity: AdminStatsDailySeriesEntry[];
  primaryTypeDistribution: AdminStatsDistribution;
  wingDistribution: AdminStatsDistribution;
};
