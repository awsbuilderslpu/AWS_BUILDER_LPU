"use client";

import * as React from "react";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth/service";
import { cn } from "@/lib/utils";

export interface GoogleSignInButtonProps {
  redirectTo?: string;
  className?: string;
  children?: React.ReactNode;
  label?: string;
}

export default function GoogleSignInButton({
  redirectTo = "/account",
  className,
  children,
  label,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await signInWithGoogle(redirectTo);
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const displayText = children ?? label ?? "Continue with Google";

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="outline"
        onClick={handleSignIn}
        disabled={loading}
        className={cn(
          "h-[42px] w-full text-[14.5px] font-semibold text-white",
          className
        )}
      >
        {loading ? (
          <Loader2 className="size-5! animate-spin shrink-0" aria-hidden="true" />
        ) : (
          <FcGoogle className="size-5! shrink-0" aria-hidden="true" />
        )}
        <span>{displayText}</span>
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-center text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export { GoogleSignInButton };
