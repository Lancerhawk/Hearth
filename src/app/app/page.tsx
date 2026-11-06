import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default async function AppHomePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-6 px-6 py-16">
      <div>
        <p className="font-heading text-4xl tracking-tight">Hearth</p>
        <p className="mt-2 text-muted-foreground">
          Signed in as {session.user.name ?? session.user.email}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Workspace setup comes next — you&apos;re authenticated and ready.
      </p>
      <form action={logoutAction}>
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </div>
  );
}
