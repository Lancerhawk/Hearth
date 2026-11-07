import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return <RegisterForm callbackUrl={callbackUrl} />;
}
