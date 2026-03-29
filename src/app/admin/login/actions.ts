"use server";

import { redirect } from "next/navigation";

import {
  clearAdminSessionCookie,
  isValidAdminPassword,
  issueAdminSessionCookie,
} from "@/domain/admin-auth";

export type AdminLoginFormState = {
  errorMessage: string | null;
};

export async function loginAdminAction(
  _previousState: AdminLoginFormState,
  formData: FormData,
): Promise<AdminLoginFormState> {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return {
      errorMessage: "관리자 비밀번호를 입력해 주세요.",
    };
  }

  if (!isValidAdminPassword(password)) {
    return {
      errorMessage: "관리자 비밀번호가 올바르지 않습니다.",
    };
  }

  await issueAdminSessionCookie();
  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
