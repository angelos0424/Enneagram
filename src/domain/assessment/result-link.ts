import { randomBytes } from "node:crypto";

const TOKEN_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const PUBLIC_ID_LENGTH = 24;
const ADMIN_TOKEN_LENGTH = 40;

export type AssessmentResultLink = {
  publicId: string;
  adminToken: string;
};

function generateOpaqueToken(length: number): string {
  const bytes = randomBytes(length);
  let token = "";

  for (let index = 0; index < length; index += 1) {
    token += TOKEN_ALPHABET[bytes[index] % TOKEN_ALPHABET.length];
  }

  return token;
}

export function createAssessmentResultLink(): AssessmentResultLink {
  return {
    publicId: generateOpaqueToken(PUBLIC_ID_LENGTH),
    adminToken: generateOpaqueToken(ADMIN_TOKEN_LENGTH),
  };
}
