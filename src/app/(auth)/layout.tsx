import { BrandMark } from "@/components/design/brand-mark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="px-6 py-5 md:px-10">
        <BrandMark href="/" size="md" />
      </header>
      <main className="hearth-enter flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card/80 p-6 shadow-[0_1px_0_color-mix(in_srgb,var(--hearth-ink)_4%,transparent)] md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
