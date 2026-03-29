import { requireAdminSession } from "@/domain/admin-auth";
import { DrizzleAdminStatsRepository } from "@/db/repositories/admin-stats-repository";

export async function getAdminDashboardViewModel() {
  await requireAdminSession();

  const repository = new DrizzleAdminStatsRepository();

  return repository.getAdminStats();
}
