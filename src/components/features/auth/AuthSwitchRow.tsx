"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { authCopy, authParam } from "@/data/auth";
import { cn } from "@/lib/utils";

export interface AuthSwitchRowProps {
  className?: string;
}

export function AuthSwitchRow({ className }: AuthSwitchRowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSwitchToSignIn = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(authParam, "signin");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      className={cn(
        "flex items-center justify-end gap-1.5 pr-12 text-[14px]",
        className
      )}
    >
      <span className="text-muted-foreground">{authCopy.welcome.prompt}</span>
      <button
        type="button"
        onClick={handleSwitchToSignIn}
        className="font-bold text-primary transition-colors hover:text-primary-hover hover:underline cursor-pointer"
      >
        {authCopy.welcome.link}
      </button>
    </div>
  );
}
