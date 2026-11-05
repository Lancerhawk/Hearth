import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="px-6 py-5 md:px-10">
        <Link
          href="/"
          className="font-heading text-2xl tracking-tight text-foreground"
        >
          Hearth
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        {children}
      </main>
    </div>
  );
}
