"use client";

import React, { useActionState } from "react";

import {
  type AdminLoginFormState,
  loginAdminAction,
} from "./actions";

const initialAdminLoginFormState: AdminLoginFormState = {
  errorMessage: null,
};

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAdminAction,
    initialAdminLoginFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-stone-700"
        >
          관리자 비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-950"
        />
      </div>
      {state.errorMessage ? (
        <p role="alert" className="text-sm text-rose-700">
          {state.errorMessage}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-500"
      >
        {isPending ? "확인 중..." : "관리자 로그인"}
      </button>
    </form>
  );
}
