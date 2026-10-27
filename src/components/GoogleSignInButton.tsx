"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GoogleSignInButtonProps {
  redirectTo?: string;
  className?: string;
  children?: React.ReactNode;
  label?: string;
}

export default function GoogleSignInButton({
  redirectTo = "/members",
  className,
  children,
  label,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn("google", { redirectTo: redirectTo || "/members" });
    } catch (error) {
      setLoading(false);
      console.error("Sign in failed:", error);
    }
  };

  const displayText = children ?? label ?? "Sign in with Google";

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignIn}
      disabled={loading}
      className={cn(
        "h-12 w-full text-[15.5px] font-semibold text-white",
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
  );
}

export { GoogleSignInButton };
