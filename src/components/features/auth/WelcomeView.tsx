"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import { authCopy } from "@/data/auth";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { OrDivider } from "@/components/ui/OrDivider";
import { Button } from "@/components/ui/button";
import { AuthSwitchRow } from "@/components/features/auth/AuthSwitchRow";

export interface WelcomeViewProps {
  onUseEmail?: () => void;
}

export function WelcomeView({ onUseEmail }: WelcomeViewProps) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <AuthSwitchRow />

      {/* Centered content block */}
      <div className="mx-auto my-auto w-full max-w-[480px] py-3 sm:py-4">
        <h2
          ref={headingRef}
          id="auth-view-heading"
          tabIndex={-1}
          className="text-[clamp(22px,2vw,28px)] font-bold leading-[1.15] text-white tracking-tight outline-none"
        >
          {authCopy.welcome.title}
        </h2>

        <p className="mt-2 max-w-[420px] text-[14px] leading-[1.45] text-muted-foreground">
          {authCopy.welcome.subtitle}
        </p>

        <div className="mt-5">
          <GoogleSignInButton redirectTo="/members">
            {authCopy.welcome.google}
          </GoogleSignInButton>

          <OrDivider className="my-3.5" text={authCopy.welcome.divider} />

          <Button
            type="button"
            variant="outline"
            onClick={onUseEmail}
            className="h-[42px] w-full text-[14.5px] font-medium text-white hover:bg-white/5"
          >
            <Mail
              className="size-4.5! text-muted-foreground shrink-0"
              aria-hidden="true"
            />
            <span>{authCopy.welcome.email}</span>
          </Button>
        </div>

        <p className="mt-5 mx-auto max-w-[400px] text-center text-[12.5px] italic text-muted-foreground leading-relaxed">
          {authCopy.welcome.note}
        </p>
      </div>
    </div>
  );
}
