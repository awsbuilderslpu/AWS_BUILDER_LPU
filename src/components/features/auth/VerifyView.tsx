"use client";

import * as React from "react";
import { Mail, Pencil } from "lucide-react";
import { registrationCopy, registrationConstants } from "@/data/registration";
import { resendVerificationEmail } from "@/lib/auth/service";
import { useRegistration } from "@/components/features/auth/RegistrationProvider";
import { OrDivider } from "@/components/ui/OrDivider";
import { Button } from "@/components/ui/button";

export function VerifyView() {
  const { state, changeEmail } = useRegistration();

  const email = state.data.email ?? "";

  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Countdown computed from target timestamp
  const [now, setNow] = React.useState(() => Date.now());
  const [endTime, setEndTime] = React.useState(
    () => Date.now() + registrationConstants.resendSeconds * 1000
  );
  const [isResending, setIsResending] = React.useState(false);
  const [resendSuccess, setResendSuccess] = React.useState(false);
  const [resendError, setResendError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const remainingSeconds = Math.max(0, Math.ceil((endTime - now) / 1000));
  const isCountingDown = remainingSeconds > 0;

  const handleResend = async () => {
    if (isCountingDown || isResending) {
      return;
    }

    setIsResending(true);
    setResendSuccess(false);
    setResendError(null);

    try {
      const result = await resendVerificationEmail(email);
      if (!result.ok) {
        setResendError(result.error);
        return;
      }
      setResendSuccess(true);
      setEndTime(Date.now() + registrationConstants.resendSeconds * 1000);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto my-auto flex w-full max-w-[560px] flex-col items-center py-6 text-center">
        {/* 84px Tile with 2px primary outline and soft primary glow */}
        <div
          aria-hidden="true"
          className="flex size-[84px] items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 shadow-[0_0_25px_rgba(217,119,6,0.3)] select-none"
        >
          <Mail className="size-10 text-primary" strokeWidth={1.75} />
        </div>

        {/* Title */}
        <h2
          ref={headingRef}
          id="auth-view-heading"
          tabIndex={-1}
          className="mt-6 text-[clamp(26px,2.3vw,34px)] font-bold leading-[1.15] text-foreground tracking-tight outline-none"
        >
          {registrationCopy.verify.title}
        </h2>

        {/* Intro and email */}
        <div className="mt-3 text-[16px] leading-[1.5] text-muted-foreground">
          <span>{registrationCopy.verify.intro}</span>
          <div className="font-semibold text-foreground break-all">
            {email || "your email"}
          </div>
        </div>

        {/* Verification Instruction Box */}
        <div className="mt-6 w-full rounded-lg border border-border bg-card/60 p-5 text-left">
          <div className="flex items-start gap-3">
            <Mail
              className="mt-0.5 size-6 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-[15px] leading-[1.5] text-muted-foreground">
              {registrationCopy.verify.box}
            </p>
          </div>

          <p className="mt-3 text-center text-[13px] text-muted-foreground">
            {registrationCopy.verify.spamHint}
          </p>

          {/* Resend button */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              aria-disabled={isCountingDown || isResending}
              className="h-10 text-[14px] font-medium"
            >
              {isCountingDown
                ? registrationCopy.verify.resendIn(remainingSeconds)
                : registrationCopy.verify.resend}
            </Button>

            {resendSuccess && (
              <p role="status" className="text-[13.5px] text-success">
                {registrationCopy.verify.resent}
              </p>
            )}

            {resendError && (
              <div
                role="alert"
                className="w-full rounded-md border border-red-400/40 bg-red-400/10 px-4 py-2.5 text-center text-sm text-red-400"
              >
                {resendError}
              </div>
            )}
          </div>
        </div>

        {/* Divider and Change Email Address */}
        <OrDivider className="my-6" />

        <Button
          type="button"
          variant="outline"
          onClick={changeEmail}
          className="h-12 w-full text-[15px] font-medium text-foreground hover:bg-primary/10"
        >
          <Pencil className="size-4 shrink-0" aria-hidden="true" />
          <span>{registrationCopy.verify.change}</span>
        </Button>
      </div>
    </div>
  );
}
