"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Check, Loader2, AlertCircle } from "lucide-react";
import { authCopy, authParam } from "@/data/auth";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/auth/schemas";
import { updatePassword } from "@/lib/auth/service";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/button";

export function ResetPasswordView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { account, isLoading } = useAuth();

  const [formError, setFormError] = React.useState<string | null>(null);
  const [isExpired, setIsExpired] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    headingRef.current?.focus();
  }, [isExpired, isSuccess]);

  const handleSwitchToForgot = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(authParam, "forgot");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleGoToAccount = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(authParam);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    router.refresh();
    router.push("/account");
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    setFormError(null);
    const result = await updatePassword(values.password);

    if (!result.ok) {
      if (result.expired) {
        setIsExpired(true);
      } else {
        setFormError(result.error);
      }
      return;
    }

    reset();
    setIsSuccess(true);
  };

  // If auth has finished loading and there is no active session, link is expired
  if (!isLoading && !account && !isSuccess) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="mx-auto my-auto flex w-full max-w-[460px] flex-col items-center py-6 text-center">
          <div
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.25)]"
          >
            <AlertCircle className="size-7" />
          </div>

          <h2
            ref={headingRef}
            id="auth-view-heading"
            tabIndex={-1}
            className="mt-5 text-2xl font-bold tracking-tight text-white outline-none"
          >
            {authCopy.reset.expiredTitle}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {authCopy.reset.expiredText}
          </p>

          <Button
            type="button"
            variant="primary"
            onClick={handleSwitchToForgot}
            className="mt-6 h-12 w-full text-[14.5px] font-semibold"
          >
            {authCopy.reset.expiredCta}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto my-auto w-full max-w-[460px] py-2 sm:py-3">
        <h2
          ref={headingRef}
          id="auth-view-heading"
          tabIndex={-1}
          className="text-[clamp(20px,1.8vw,25px)] font-bold leading-[1.15] text-white tracking-tight outline-none"
        >
          {isSuccess
            ? authCopy.reset.successTitle
            : isExpired
            ? authCopy.reset.expiredTitle
            : authCopy.reset.title}
        </h2>

        <p className="mt-1.5 max-w-[420px] text-[13.5px] leading-[1.4] text-muted-foreground">
          {isSuccess
            ? authCopy.reset.successText
            : isExpired
            ? authCopy.reset.expiredText
            : authCopy.reset.subtitle}
        </p>

        {isSuccess ? (
          <div role="status" className="mt-6 flex flex-col items-center gap-4 text-center">
            <div
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
            >
              <Check className="size-8 stroke-[2.5]" />
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={handleGoToAccount}
              className="mt-4 h-12 w-full text-[14.5px] font-semibold"
            >
              {authCopy.reset.successCta}
            </Button>
          </div>
        ) : isExpired ? (
          <div role="status" className="mt-6 flex flex-col items-center gap-4 text-center">
            <div
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.25)]"
            >
              <AlertCircle className="size-7" />
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={handleSwitchToForgot}
              className="mt-4 h-12 w-full text-[14.5px] font-semibold"
            >
              {authCopy.reset.expiredCta}
            </Button>
          </div>
        ) : (
          <form
            noValidate
            aria-busy={isSubmitting}
            onSubmit={handleSubmit(onSubmit)}
            className="mt-5 grid gap-4"
          >
            <PasswordField
              label={authCopy.reset.passwordField.label}
              placeholder={authCopy.reset.passwordField.placeholder}
              autoComplete="new-password"
              icon={Lock}
              required
              disabled={isSubmitting}
              error={errors.password?.message}
              {...register("password")}
            />

            <PasswordField
              label={authCopy.reset.confirmField.label}
              placeholder={authCopy.reset.confirmField.placeholder}
              autoComplete="new-password"
              icon={Lock}
              required
              disabled={isSubmitting}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

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
              className="h-12 w-full text-[14.5px] font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin shrink-0" />
                  <span>{authCopy.reset.submitting}</span>
                </>
              ) : (
                <span>{authCopy.reset.submit}</span>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

