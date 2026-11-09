"use client";

import { adminCopy } from "@/data/admin";
import { Button } from "@/components/ui/button";

export default function MembersError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = adminCopy.members.error;

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="space-y-1.5 max-w-md">
        <h2 className="text-xl font-semibold text-foreground tracking-tight">
          {copy.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {copy.text}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => reset()}
        className="h-10 px-5 font-medium cursor-pointer"
      >
        {copy.retry}
      </Button>
    </div>
  );
}

