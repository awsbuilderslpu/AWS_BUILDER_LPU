"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Check, Loader2, ArrowLeft } from "lucide-react";
import { authCopy, authParam } from "@/data/auth";
import { registrationConstants } from "@/data/registration";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/auth/schemas";
import { requestPasswordReset } from "@/lib/auth/service";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/button";

export function ForgotPasswordView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSent, setIsSent] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    headingRef.current?.focus();
  }, [isSent]);

  // Countdown state for "Send again"
  const [now, setNow] = React.useState(() => Date.now());
  const [endTime, setEndTime] = React.useState(
    () => Date.now() + registrationConstants.resendSeconds * 1000
  );
  const [isResending, setIsResending] = React.useState(false);

  React.useEffect(() => {
    if (!isSent) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 500);
    return () => clearInterval(interval);
  }, [isSent]);

  const remainingSeconds = Math.max(0, Math.ceil((endTime - now) / 1000));
  const isCountingDown = remainingSeconds > 0;

  const handleSwitchToSignIn = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(authParam, "signin");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setFormError(null);
    const result = await requestPasswordReset(values.email);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setSubmittedEmail(values.email);
    setEndTime(Date.now() + registrationConstants.resendSeconds * 1000);
    setIsSent(true);
  };

  const handleSendAgain = async () => {
    if (isCountingDown || isResending || !submittedEmail) return;

    setIsResending(true);
    setFormError(null);
    try {
      const result = await requestPasswordReset(submittedEmail);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setEndTime(Date.now() + registrationConstants.resendSeconds * 1000);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto my-auto w-full max-w-[460px] py-2 sm:py-3">
        <h2
          ref={headingRef}
          id="auth-view-heading"
          tabIndex={-1}
          className="text-[clamp(20px,1.8vw,25px)] font-bold leading-[1.15] text-white tracking-tight outline-none"
        >
          {isSent ? authCopy.forgot.sentTitle : authCopy.forgot.title}
        </h2>

        <p className="mt-1.5 max-w-[420px] text-[13.5px] leading-[1.4] text-muted-foreground">
          {isSent ? authCopy.forgot.sentText : authCopy.forgot.subtitle}
        </p>

        {isSent ? (
          <div role="status" className="mt-6 flex flex-col items-center gap-4 text-center">
            <div
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            >
              <Check className="size-6 text-emerald-400 stroke-[2.5]" />
            </div>

            <p className="text-sm font-medium text-white break-all">
              {submittedEmail}
            </p>

            {formError && (
              <div
                role="alert"
                className="w-full rounded-md border border-red-400/40 bg-red-400/10 px-4 py-2.5 text-center text-sm text-red-300"
              >
                {formError}
              </div>
            )}

            <div className="mt-2 flex w-full flex-col gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={handleSendAgain}
                aria-disabled={isCountingDown || isResending}
                className="h-10 w-full text-sm font-medium"
              >
                {isResending ? (
                  <>
                    <Loader2 className="size-4 animate-spin shrink-0" />
                    <span>Sending...</span>
                  </>
                ) : isCountingDown ? (
                  authCopy.forgot.againIn(remainingSeconds)
                ) : (
                  authCopy.forgot.again
                )}
              </Button>

              <button
                type="button"
                onClick={handleSwitchToSignIn}
                className="mt-2 text-sm text-muted-foreground transition-colors hover:text-white inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="size-4" />
                <span>{authCopy.forgot.back}</span>
              </button>
            </div>
          </div>
        ) : (
          <form
            noValidate
            aria-busy={isSubmitting}
            onSubmit={handleSubmit(onSubmit)}
            className="mt-5 grid gap-4"
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
                  <span>{authCopy.forgot.submitting}</span>
                </>
              ) : (
                <span>{authCopy.forgot.submit}</span>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleSwitchToSignIn}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-white cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>{authCopy.forgot.back}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

