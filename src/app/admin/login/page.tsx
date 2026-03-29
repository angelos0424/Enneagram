import React from "react";
import { redirect } from "next/navigation";

import { readAdminSession } from "@/domain/admin-auth";

import { AdminLoginForm } from "./login-form";

export default async function AdminLoginPage() {
  const session = await readAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_24px_80px_rgba(28,25,23,0.08)]">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
            Admin
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
            통계 화면 로그인
          </h1>
          <p className="text-sm leading-6 text-stone-600">
            운영 통계는 관리자 비밀번호로만 접근할 수 있습니다.
          </p>
        </div>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}
