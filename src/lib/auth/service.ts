import { authCopy } from "@/data/auth";
import { registrationCopy } from "@/data/registration";
import type { SignInValues, RegisterInput } from "@/lib/auth/schemas";

// TODO: replaced by real accounts in the backend step; keep these signatures.

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function signInWithGoogle(): Promise<AuthResult> {
  return { ok: false, error: authCopy.errors.google };
}

export async function signInWithPassword({
  password,
}: SignInValues): Promise<AuthResult> {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, error: authCopy.errors.unavailable };
  }

  // Simulate network latency in development (~700ms)
  await new Promise((resolve) => setTimeout(resolve, 700));

  if (password === "wrong-password") {
    return { ok: false, error: authCopy.errors.failed };
  }

  return { ok: true };
}

// Replaced by real accounts in the backend step; the verification link will redirect back to the site then.

export async function registerAccount(
  input: RegisterInput
): Promise<AuthResult> {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, error: authCopy.errors.unavailable };
  }

  // Simulate network latency in development (~900ms)
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (input.email === "fail@example.com") {
    return { ok: false, error: registrationCopy.errors.registerFailed };
  }

  return { ok: true };
}

export async function resendVerificationEmail(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _email: string
): Promise<AuthResult> {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, error: authCopy.errors.unavailable };
  }

  // Simulate network latency in development (~600ms)
  await new Promise((resolve) => setTimeout(resolve, 600));

  return { ok: true };
}
