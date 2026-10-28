"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { authCopy } from "@/data/auth";
import { signOut } from "@/lib/auth/service";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignOut}
      disabled={loading}
      className="h-10 text-sm font-medium border-border hover:bg-white/5 hover:text-white"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin shrink-0" />
      ) : (
        <LogOut className="size-4 shrink-0 text-muted-foreground" />
      )}
      <span>{authCopy.account.signOut}</span>
    </Button>
  );
}

