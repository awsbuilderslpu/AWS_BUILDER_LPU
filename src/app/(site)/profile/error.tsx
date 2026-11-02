"use client";

import { Button } from "@/components/ui/button";
import { profileCopy } from "@/data/profile";

export default function ProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card/60 p-8 text-center backdrop-blur-sm">
        <p className="text-sm font-medium text-red-400">
          {profileCopy.errors.loadFailed}
        </p>
        <div className="mt-5">
          <Button
            type="button"
            size="sm"
            onClick={() => reset()}
            className="h-9 px-4 text-xs bg-primary text-background hover:bg-primary-hover font-semibold cursor-pointer"
          >
            {profileCopy.errors.retry}
          </Button>
        </div>
      </div>
    </div>
  );
}
