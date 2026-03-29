import { randomBytes } from "node:crypto";

const TOKEN_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SESSION_TOKEN_LENGTH = 40;
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export const ASSESSMENT_DRAFT_SESSION_COOKIE = {
  name: "assessment_session",
  options: {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  },
};

export type AssessmentDraftSessionCookie = {
  name: typeof ASSESSMENT_DRAFT_SESSION_COOKIE.name;
  value: string;
  options: typeof ASSESSMENT_DRAFT_SESSION_COOKIE.options;
};

export function createAssessmentDraftSessionToken(): string {
  const bytes = randomBytes(SESSION_TOKEN_LENGTH);
  let token = "";

  for (let index = 0; index < SESSION_TOKEN_LENGTH; index += 1) {
    token += TOKEN_ALPHABET[bytes[index] % TOKEN_ALPHABET.length];
  }

  return token;
}

export function buildAssessmentDraftSessionCookie(
  sessionToken: string,
): AssessmentDraftSessionCookie {
  return {
    name: ASSESSMENT_DRAFT_SESSION_COOKIE.name,
    value: sessionToken,
    options: ASSESSMENT_DRAFT_SESSION_COOKIE.options,
  };
}

export function readAssessmentDraftSessionToken(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}
