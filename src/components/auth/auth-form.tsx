"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  loginAction,
  registerAction,
  type AuthActionState,
} from "@/actions/auth";
import { FormBanner } from "@/components/design/form-banner";
import { useT } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

function CallbackField({ callbackUrl }: { callbackUrl?: string }) {
  if (!callbackUrl) return null;
  return <input type="hidden" name="callbackUrl" value={callbackUrl} />;
}

export function RegisterForm({ callbackUrl }: { callbackUrl?: string }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <div className="w-full">
      <h1 className="font-heading text-[2rem] tracking-tight text-hearth-ink md:text-3xl">
        {t("auth.registerTitle")}
      </h1>
      <p className="mt-2 text-base leading-relaxed text-hearth-ink/60">
        {t("auth.registerBody")}
      </p>
      <form action={formAction} className="mt-8 space-y-4">
        <CallbackField callbackUrl={callbackUrl} />
        {state.error ? (
          <FormBanner tone="error">{state.error}</FormBanner>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="name">{t("auth.name")}</Label>
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
            <p className="text-sm text-destructive">
              {state.fieldErrors.name[0]}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
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
            <p className="text-sm text-destructive">
              {state.fieldErrors.email[0]}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
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
        <Button
          type="submit"
          size="lg"
          className="mt-3 w-full shadow-none"
          disabled={pending}
        >
          {pending ? t("common.loading") : t("auth.submitRegister")}
        </Button>
      </form>
      <p className="mt-6 text-sm text-hearth-ink/55">
        {t("auth.hasAccount")}{" "}
        <Link
          href={
            callbackUrl
              ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : "/login"
          }
          className="font-medium text-hearth-moss underline-offset-4 hover:underline"
        >
          {t("auth.signInLink")}
        </Link>
      </p>
    </div>
  );
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <div className="w-full">
      <h1 className="font-heading text-[2rem] tracking-tight text-hearth-ink md:text-3xl">
        {t("auth.signInTitle")}
      </h1>
      <p className="mt-2 text-base leading-relaxed text-hearth-ink/60">
        {t("auth.signInBody")}
      </p>
      <form action={formAction} className="mt-8 space-y-4">
        <CallbackField callbackUrl={callbackUrl} />
        {state.error ? (
          <FormBanner tone="error">{state.error}</FormBanner>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
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
            <p className="text-sm text-destructive">
              {state.fieldErrors.email[0]}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
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
        <Button
          type="submit"
          size="lg"
          className="mt-3 w-full shadow-none"
          disabled={pending}
        >
          {pending ? t("common.loading") : t("auth.submitSignIn")}
        </Button>
      </form>
      <p className="mt-6 text-sm text-hearth-ink/55">
        {t("auth.noAccount")}{" "}
        <Link
          href={
            callbackUrl
              ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : "/register"
          }
          className="font-medium text-hearth-moss underline-offset-4 hover:underline"
        >
          {t("auth.createOne")}
        </Link>
      </p>
    </div>
  );
}
