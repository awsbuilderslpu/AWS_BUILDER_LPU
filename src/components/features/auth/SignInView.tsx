"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Check, Loader2 } from "lucide-react";
import { authCopy, authParam } from "@/data/auth";
import { signInSchema, type SignInValues } from "@/lib/auth/schemas";
import { signInWithPassword } from "@/lib/auth/service";
import { TextField } from "@/components/ui/TextField";
import { PasswordField } from "@/components/ui/PasswordField";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { OrDivider } from "@/components/ui/OrDivider";
import { Button } from "@/components/ui/button";

export function SignInView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [formError, setFormError] = React.useState<string | null>(null);
  const [showForgotNotice, setShowForgotNotice] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

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

  const handleClose = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(authParam);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleSwitchToRegister = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(authParam, "register");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const {
    register,
    handleSubmit,
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
    const result = await signInWithPassword(values);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setIsSuccess(true);
    timerRef.current = setTimeout(() => {
      handleClose();
    }, 1500);
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
          className="text-[clamp(20px,1.8vw,25px)] font-bold leading-[1.15] text-white tracking-tight outline-none"
        >
          {authCopy.signin.title}
        </h2>

        <p className="mt-1 max-w-[420px] text-[13px] leading-[1.4] text-muted-foreground">
          {authCopy.signin.subtitle}
        </p>

        <div className="mt-3.5">
          <GoogleSignInButton redirectTo="/members">
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

            <h3 className="text-[18px] font-semibold text-white">
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

              <div className="mt-1.5 flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={() => setShowForgotNotice((prev) => !prev)}
                  className="text-[13px] text-primary underline underline-offset-4 transition-colors hover:text-primary-hover cursor-pointer"
                >
                  {authCopy.signin.forgot}
                </button>
                {showForgotNotice && (
                  <p role="status" className="text-[12.5px] text-muted-foreground">
                    {authCopy.signin.forgotNotice}
                  </p>
                )}
              </div>
            </div>

            {formError && (
              <div
                role="alert"
                className="rounded-md border border-red-400/40 bg-red-400/10 px-4 py-2.5 text-sm text-red-300"
              >
                {formError}
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
