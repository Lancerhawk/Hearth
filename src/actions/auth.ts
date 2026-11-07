"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn, signOut } from "@/lib/auth";
import { safeCallbackUrl } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validators/auth";

export type AuthActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  values?: {
    name?: string;
    email?: string;
  };
};

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  const parsed = registerSchema.safeParse({
    name: values.name,
    email: values.email,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      values,
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Please fix the highlighted fields.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      values,
      error: "An account with this email already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
    },
  });

  const redirectTo = safeCallbackUrl(formData.get("callbackUrl"));

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Try logging in." };
    }
    throw error;
  }

  return { error: "Something went wrong during sign-in." };
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const values = {
    email: String(formData.get("email") ?? ""),
  };

  const parsed = loginSchema.safeParse({
    email: values.email,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      values,
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Please fix the highlighted fields.",
    };
  }

  const redirectTo = safeCallbackUrl(formData.get("callbackUrl"));

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { values, error: "Invalid email or password." };
    }
    throw error;
  }

  return { error: "Something went wrong during sign-in." };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
