"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Check, Loader2 } from "lucide-react";
import { authCopy, authParam } from "@/data/auth";
import { safeNext } from "@/lib/auth/safe-next";
import { signInSchema, type SignInValues } from "@/lib/auth/schemas";
import {
  signInWithPassword,
  resendVerificationEmail,
} from "@/lib/auth/service";
import { TextField } from "@/components/ui/TextField";
import { PasswordField } from "@/components/ui/PasswordField";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { OrDivider } from "@/components/ui/OrDivider";
import { Button } from "@/components/ui/button";

export interface SignInViewProps {
  urlError?: string | null;
}

export function SignInView({ urlError }: SignInViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [formError, setFormError] = React.useState<string | null>(urlError ?? null);
  const [prevUrlError, setPrevUrlError] = React.useState(urlError);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = React.useState<string | null>(null);
  const [resending, setResending] = React.useState(false);
  const [resendStatus, setResendStatus] = React.useState<string | null>(null);

  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    headingRef.current?.focus();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (urlError !== prevUrlError) {
    setPrevUrlError(urlError);
    setFormError(urlError ?? null);
  }

  const nextDestination = safeNext(searchParams.get("next"), "/account");

  const handleClose = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(authParam);
    params.delete("error");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleSwitchToRegister = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(authParam, "register");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSwitchToForgot = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(authParam, "forgot");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInValues) => {
    setFormError(null);
    setUnconfirmedEmail(null);
    setResendStatus(null);

    const result = await signInWithPassword(values);
    if (!result.ok) {
      setFormError(result.error);
      if (result.error === authCopy.errors.emailNotConfirmed) {
        setUnconfirmedEmail(values.email);
      }
      return;
    }

    setIsSuccess(true);
    timerRef.current = setTimeout(() => {
      handleClose();
      router.push(nextDestination);
      router.refresh();
    }, 1200);
  };

  const handleResend = async () => {
    const email = unconfirmedEmail || getValues("email");
    if (!email) return;

    setResending(true);
    setResendStatus(null);
    try {
      const res = await resendVerificationEmail(email);
      if (res.ok) {
        setResendStatus("Confirmation email sent! Check your inbox.");
      } else {
        setResendStatus(res.error);
      }
    } finally {
      setResending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void handleSubmit(onSubmit)(e);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto my-auto w-full max-w-[460px] py-1 sm:py-2">
        <h2
          ref={headingRef}
          id="auth-view-heading"
          tabIndex={-1}
          className="text-[clamp(20px,1.8vw,25px)] font-bold leading-[1.15] text-foreground tracking-tight outline-none"
        >
          {authCopy.signin.title}
        </h2>

        <p className="mt-1 max-w-[420px] text-[13px] leading-[1.4] text-muted-foreground">
          {authCopy.signin.subtitle}
        </p>

        <div className="mt-3.5">
          <GoogleSignInButton redirectTo={nextDestination}>
            {authCopy.welcome.google}
          </GoogleSignInButton>

          <OrDivider className="my-3" text={authCopy.welcome.divider} />
        </div>

        {isSuccess ? (
          <div
            role="status"
            className="flex flex-col items-center gap-3.5 py-6 text-center"
          >
            <div
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-success/50 bg-success/10"
            >
              <Check className="size-5 text-success" />
            </div>

            <h3 className="text-[18px] font-semibold text-foreground">
              {authCopy.signin.success}
            </h3>

            <p className="max-w-[340px] text-[13px] text-muted-foreground">
              {authCopy.signin.successNote}
            </p>
          </div>
        ) : (
          <form
            noValidate
            aria-busy={isSubmitting}
            onSubmit={handleFormSubmit}
            className="mt-3 grid gap-3"
          >
            <TextField
              label={authCopy.signin.emailField.label}
              placeholder={authCopy.signin.emailField.placeholder}
              type="email"
              autoComplete="email"
              inputMode="email"
              icon={Mail}
              required
              disabled={isSubmitting}
              error={errors.email?.message}
              {...register("email")}
            />

            <div>
              <PasswordField
                label={authCopy.signin.passwordField.label}
                placeholder={authCopy.signin.passwordField.placeholder}
                autoComplete="current-password"
                icon={Lock}
                required
                disabled={isSubmitting}
                error={errors.password?.message}
                {...register("password")}
              />

              <div className="mt-1.5 flex justify-end">
                <button
                  type="button"
                  onClick={handleSwitchToForgot}
                  className="text-[13px] text-primary underline underline-offset-4 transition-colors hover:text-primary-hover cursor-pointer"
                >
                  {authCopy.signin.forgot}
                </button>
              </div>
            </div>

            {formError && (
              <div
                role="alert"
                className="rounded-md border border-red-400/40 bg-red-400/10 px-4 py-2.5 text-sm text-red-400"
              >
                <p>{formError}</p>
                {unconfirmedEmail && (
                  <div className="mt-2 pt-2 border-t border-red-400/20">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="text-xs font-semibold text-primary underline underline-offset-2 hover:text-primary-hover disabled:opacity-50"
                    >
                      {resending ? "Sending link..." : authCopy.errors.resendLink}
                    </button>
                    {resendStatus && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {resendStatus}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              withArrow={!isSubmitting}
              className="h-10 w-full text-[14px] font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    className="size-4 animate-spin shrink-0"
                    aria-hidden="true"
                  />
                  <span>{authCopy.signin.submitting}</span>
                </>
              ) : (
                <span>{authCopy.signin.submit}</span>
              )}
            </Button>

            <div className="text-center text-[13.5px] text-muted-foreground">
              <span>{authCopy.signin.prompt} </span>
              <button
                type="button"
                onClick={handleSwitchToRegister}
                className="font-bold text-primary underline underline-offset-4 transition-colors hover:text-primary-hover cursor-pointer"
              >
                {authCopy.signin.link}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
