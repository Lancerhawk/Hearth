import { connection } from "next/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Entire /app tree is auth-gated and must not prerender with crypto/session.
  await connection();
  return children;
}
