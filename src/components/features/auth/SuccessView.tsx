"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { authParam } from "@/data/auth";
import { registrationCopy } from "@/data/registration";
import { useRegistration } from "@/components/features/auth/RegistrationProvider";
import { Button } from "@/components/ui/button";

export function SuccessView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { reset } = useRegistration();

  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const handleGoToLogin = () => {
    reset();
    const params = new URLSearchParams(searchParams.toString());
    params.set(authParam, "signin");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto my-auto flex w-full max-w-[560px] flex-col items-center py-6 text-center">
        {/* 96px circle with 2px border-success, bg-success/10, soft success glow */}
        <div
          aria-hidden="true"
          className="flex size-24 items-center justify-center rounded-full border-2 border-success bg-success/10 shadow-[0_0_25px_rgba(34,197,94,0.3)] select-none"
        >
          <Check className="size-12 text-success stroke-[2.5]" />
        </div>

        {/* Heading */}
        <h2
          ref={headingRef}
          id="auth-view-heading"
          tabIndex={-1}
          className="mt-6 text-[clamp(26px,2.3vw,34px)] font-bold leading-[1.15] text-white tracking-tight outline-none"
        >
          {registrationCopy.success.title}
        </h2>

        {/* Welcome */}
        <div className="mt-3 text-[18px] font-semibold text-white">
          {registrationCopy.success.welcome}
        </div>

        {/* Description */}
        <p className="mt-3 max-w-[440px] text-[16px] leading-[1.5] text-muted-foreground">
          {registrationCopy.success.text}
        </p>

        {/* Go to Login Button */}
        <Button
          type="button"
          variant="primary"
          withArrow
          onClick={handleGoToLogin}
          className="mt-8 h-12 w-full text-[15.5px] font-semibold"
        >
          {registrationCopy.success.cta}
        </Button>

        {/* Explore Links Grid */}
        <div className="mt-10 grid w-full grid-cols-4 gap-2">
          {registrationCopy.success.links.map((linkItem) => {
            const Icon = linkItem.icon;
            return (
              <Link
                key={linkItem.label}
                href={linkItem.href}
                className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card/40 p-3 text-center transition-all hover:border-primary/50 hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Icon
                  className="size-7 text-foreground/80 transition-colors group-hover:text-primary"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="text-[13.5px] text-muted-foreground transition-colors group-hover:text-white">
                  {linkItem.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
