import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type SignUpExtraOptions = {
  fullName?: string;
  emailRedirectTo?: string;
};

export async function signUp(
  email: string,
  password: string,
  extra?: SignUpExtraOptions,
) {
  const supabase = createClient();
  console.log("SIGNUP START");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      ...(extra?.fullName
        ? { data: { full_name: extra.fullName } }
        : {}),
      ...(extra?.emailRedirectTo
        ? { emailRedirectTo: extra.emailRedirectTo }
        : {}),
    },
  });

  console.log("AUTH RESULT:", data, error);

  if (error) {
    console.error("AUTH ERROR:", error);
    throw error;
  }

  if (data.user) {
    console.log("USER:", data.user);
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOutGlobal(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "global" });
  } catch {
    /* ignore */
  }
}

export type SignInErrorKind =
  | "user_not_found"
  | "wrong_password"
  | "email_not_confirmed"
  | "unknown";

export function classifySignInError(error: AuthError): SignInErrorKind {
  const msg = (error.message || "").toLowerCase();
  const code = String((error as { code?: string }).code || "").toLowerCase();

  if (
    msg.includes("user not found") ||
    code === "user_not_found" ||
    msg.includes("no user found")
  ) {
    return "user_not_found";
  }
  if (
    msg.includes("invalid login credentials") ||
    msg.includes("invalid credentials") ||
    code === "invalid_credentials"
  ) {
    return "wrong_password";
  }
  if (msg.includes("email not confirmed")) {
    return "email_not_confirmed";
  }
  return "unknown";
}

export type SignUpErrorKind =
  | "database_save"
  | "already_registered"
  | "rate_limit"
  | "unknown";

export function classifySignUpError(error: AuthError): SignUpErrorKind {
  const msg = (error.message || "").toLowerCase();
  if (msg.includes("database error saving new user")) {
    return "database_save";
  }
  if (
    msg.includes("user already registered") ||
    msg.includes("already been registered")
  ) {
    return "already_registered";
  }
  if (msg.includes("email rate limit") || msg.includes("rate limit")) {
    return "rate_limit";
  }
  return "unknown";
}
