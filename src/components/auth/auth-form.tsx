"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  loginAction,
  registerAction,
  type AuthActionState,
} from "@/actions/auth";
import { FormBanner } from "@/components/design/form-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

function CallbackField({ callbackUrl }: { callbackUrl?: string }) {
  if (!callbackUrl) return null;
  return <input type="hidden" name="callbackUrl" value={callbackUrl} />;
}

export function RegisterForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <div className="w-full">
      <h1 className="font-heading text-2xl tracking-tight text-hearth-ink">
        Create account
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Start a household workspace on Hearth.
      </p>
      <form action={formAction} className="mt-6 space-y-4">
        <CallbackField callbackUrl={callbackUrl} />
        {state.error ? <FormBanner tone="error">{state.error}</FormBanner> : null}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            disabled={pending}
            defaultValue={state.values?.name}
            key={`reg-name-${state.values?.name ?? ""}-${state.error ?? "ok"}`}
          />
          {state.fieldErrors?.name?.[0] ? (
            <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={pending}
            defaultValue={state.values?.email}
            key={`reg-email-${state.values?.email ?? ""}-${state.error ?? "ok"}`}
          />
          {state.fieldErrors?.email?.[0] ? (
            <p className="text-sm text-destructive">{state.fieldErrors.email[0]}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={pending}
          />
          {state.fieldErrors?.password?.[0] ? (
            <p className="text-sm text-destructive">
              {state.fieldErrors.password[0]}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={
              callbackUrl
                ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : "/login"
            }
            className="text-hearth-moss underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <div className="w-full">
      <h1 className="font-heading text-2xl tracking-tight text-hearth-ink">
        Welcome back
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sign in to your Hearth workspace.
      </p>
      <form action={formAction} className="mt-6 space-y-4">
        <CallbackField callbackUrl={callbackUrl} />
        {state.error ? <FormBanner tone="error">{state.error}</FormBanner> : null}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={pending}
            defaultValue={state.values?.email}
            key={`login-email-${state.values?.email ?? ""}-${state.error ?? "ok"}`}
          />
          {state.fieldErrors?.email?.[0] ? (
            <p className="text-sm text-destructive">{state.fieldErrors.email[0]}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
          />
          {state.fieldErrors?.password?.[0] ? (
            <p className="text-sm text-destructive">
              {state.fieldErrors.password[0]}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            href={
              callbackUrl
                ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : "/register"
            }
            className="text-hearth-moss underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
