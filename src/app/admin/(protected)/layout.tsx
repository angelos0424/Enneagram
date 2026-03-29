import React, { type ReactNode } from "react";

import { requireAdminSession } from "@/domain/admin-auth";

import { logoutAdminAction } from "../login/actions";

type ProtectedAdminLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  await requireAdminSession();

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
            Admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
            운영 통계
          </h1>
        </div>
        <form action={logoutAdminAction}>
          <button
            type="submit"
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
          >
            로그아웃
          </button>
        </form>
      </div>
      <div className="mx-auto mt-8 w-full max-w-6xl">{children}</div>
    </div>
  );
}
