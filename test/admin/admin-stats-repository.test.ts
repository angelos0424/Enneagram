import { beforeEach, describe, expect, it, vi } from "vitest";

import { typeCopyDefinition } from "@/content/type-copy/ko/v1";
import { assessmentDefinition } from "@/content/assessments/ko/v1";
import { DrizzleAdminStatsEventRepository } from "@/db/repositories/admin-stats-event-repository";
import { DrizzleAdminStatsRepository } from "@/db/repositories/admin-stats-repository";
import { DrizzleAssessmentResultRepository } from "@/db/repositories/assessment-result-repository";
import {
  ADMIN_STATS_EVENT_TYPES,
} from "@/db/repositories/admin-stats-event-repository";
import {
  ADMIN_STATS_SMALL_CELL_THRESHOLD,
} from "@/domain/admin-stats";
import type { AssessmentResultSnapshotDraft } from "@/domain/assessment/result-snapshot";
import { buildTypeDominantAnswers } from "../assessment/fixtures";

function clearMemoryStores() {
  const globalStore = globalThis as typeof globalThis & {
    __assessmentResultMemoryStore?: Map<string, unknown>;
    __adminStatsEventMemoryStore?: Map<string, unknown>;
  };

  globalStore.__assessmentResultMemoryStore?.clear();
  globalStore.__adminStatsEventMemoryStore?.clear();
}

function buildResultSnapshot(
  primaryType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
  wingType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
  createdAt: Date,
  suffix: string,
): AssessmentResultSnapshotDraft {
  const answers = buildTypeDominantAnswers(primaryType);

  return {
    publicId: `public-${suffix}`,
    adminToken: `admin-${suffix}`,
    assessmentVersion: assessmentDefinition.version,
    scoringVersion: assessmentDefinition.scoringVersion,
    copyVersion: typeCopyDefinition.copyVersion,
    primaryType,
    wingType,
    growthType: primaryType === 1 ? 7 : 1,
    stressType: primaryType === 1 ? 4 : 8,
    resultStatus: "clear",
    confidenceScore: 24,
    rawScores: {
      1: primaryType === 1 ? 24 : 12,
      2: 12,
      3: 12,
      4: 12,
      5: 12,
      6: 12,
      7: 12,
      8: 12,
      9: 12,
    },
    normalizedScores: {
      1: primaryType === 1 ? 100 : 40,
      2: 40,
      3: 40,
      4: 40,
      5: 40,
      6: 40,
      7: 40,
      8: 40,
      9: 40,
    },
    nearbyTypes: [
      {
        typeId: wingType,
        rawScore: 18,
        normalizedScore: 75,
        gapFromPrimary: 6,
      },
    ],
    answers,
    createdAt,
  };
}

describe("admin stats repository", () => {
  beforeEach(() => {
    clearMemoryStores();
    vi.stubEnv("USE_IN_MEMORY_ASSESSMENT_RESULTS", "true");
    vi.stubEnv("USE_IN_MEMORY_ASSESSMENT_DRAFTS", "true");
  });

  it("aggregates daily starts, completions, and restart clicks by Asia/Seoul day", async () => {
    const eventRepository = new DrizzleAdminStatsEventRepository();
    const resultRepository = new DrizzleAssessmentResultRepository();
    const dashboardRepository = new DrizzleAdminStatsRepository();

    for (let index = 0; index < 5; index += 1) {
      await eventRepository.recordEvent({
        eventType: ADMIN_STATS_EVENT_TYPES.assessmentStarted,
        occurredAt: new Date(`2026-03-29T0${index}:00:00.000Z`),
      });
      await eventRepository.recordEvent({
        eventType: ADMIN_STATS_EVENT_TYPES.assessmentRestartClicked,
        occurredAt: new Date(`2026-03-29T10:${index}0:00.000Z`),
      });
      await resultRepository.save(
        buildResultSnapshot(
          8,
          7,
          new Date(`2026-03-29T11:${index}0:00.000Z`),
          `day-one-${index}`,
        ),
      );
    }

    for (let index = 0; index < 6; index += 1) {
      await eventRepository.recordEvent({
        eventType: ADMIN_STATS_EVENT_TYPES.assessmentStarted,
        occurredAt: new Date(`2026-03-29T16:${index}0:00.000Z`),
      });
      await resultRepository.save(
        buildResultSnapshot(
          1,
          9,
          new Date(`2026-03-29T17:${index}0:00.000Z`),
          `day-two-${index}`,
        ),
      );
    }

    const stats = await dashboardRepository.getAdminStats();

    expect(stats.dailyActivity).toHaveLength(2);
    expect(stats.dailyActivity).toEqual([
      {
        day: "2026-03-29",
        label: "2026.3.29",
        starts: { kind: "visible", count: 5 },
        completions: { kind: "visible", count: 5 },
        restartClicks: { kind: "visible", count: 5 },
      },
      {
        day: "2026-03-30",
        label: "2026.3.30",
        starts: { kind: "visible", count: 6 },
        completions: { kind: "visible", count: 6 },
        restartClicks: { kind: "suppressed", reason: "small_cell" },
      },
    ]);
  });

  it("suppresses low-volume distribution buckets and hides exact totals when any bucket is hidden", async () => {
    const resultRepository = new DrizzleAssessmentResultRepository();
    const dashboardRepository = new DrizzleAdminStatsRepository();

    for (let index = 0; index < 6; index += 1) {
      await resultRepository.save(
        buildResultSnapshot(
          8,
          7,
          new Date(`2026-03-29T12:${index}0:00.000Z`),
          `visible-${index}`,
        ),
      );
    }

    for (let index = 0; index < 4; index += 1) {
      await resultRepository.save(
        buildResultSnapshot(
          3,
          4,
          new Date(`2026-03-30T12:${index}0:00.000Z`),
          `suppressed-${index}`,
        ),
      );
    }

    const stats = await dashboardRepository.getAdminStats();

    expect(stats.primaryTypeDistribution.suppressionThreshold).toBe(
      ADMIN_STATS_SMALL_CELL_THRESHOLD,
    );
    expect(stats.primaryTypeDistribution.totalCount).toBeNull();
    expect(stats.primaryTypeDistribution.suppressedBucketCount).toBe(1);
    expect(stats.primaryTypeDistribution.buckets).toEqual([
      {
        key: "3",
        label: typeCopyDefinition.entries[3].title,
        count: null,
        isSuppressed: true,
      },
      {
        key: "8",
        label: typeCopyDefinition.entries[8].title,
        count: 6,
        isSuppressed: false,
      },
    ]);
    expect(stats.wingDistribution.totalCount).toBeNull();
    expect(stats.wingDistribution.suppressedBucketCount).toBe(1);
    expect(stats.wingDistribution.buckets).toEqual([
      {
        key: "4",
        label: "4번 날개",
        count: null,
        isSuppressed: true,
      },
      {
        key: "7",
        label: "7번 날개",
        count: 6,
        isSuppressed: false,
      },
    ]);
  });
});
