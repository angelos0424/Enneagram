import { cookies } from "next/headers";

import {
  ADMIN_STATS_EVENT_TYPES,
  DrizzleAdminStatsEventRepository,
} from "@/db/repositories/admin-stats-event-repository";
import { DrizzleAssessmentDraftSessionRepository } from "@/db/repositories/assessment-draft-session-repository";
import {
  ASSESSMENT_DRAFT_SESSION_COOKIE,
  readAssessmentDraftSessionTokenFromCookieStore,
} from "@/domain/assessment/draft-session";

export async function DELETE() {
  const cookieStore = await cookies();
  const sessionToken = readAssessmentDraftSessionTokenFromCookieStore(cookieStore);

  if (sessionToken) {
    const draftRepository = new DrizzleAssessmentDraftSessionRepository();
    await draftRepository.deleteDraftSession(sessionToken);
  }

  cookieStore.delete(ASSESSMENT_DRAFT_SESSION_COOKIE.name);

  const adminStatsEventRepository = new DrizzleAdminStatsEventRepository();
  await adminStatsEventRepository.recordEvent({
    eventType: ADMIN_STATS_EVENT_TYPES.assessmentRestartClicked,
    occurredAt: new Date(),
  });

  return new Response(null, { status: 204 });
}
