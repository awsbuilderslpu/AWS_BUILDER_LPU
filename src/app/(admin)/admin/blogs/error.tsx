"use client";

import { adminCopy } from "@/data/admin";
import { Button } from "@/components/ui/button";

export default function BlogsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = adminCopy.blogs.error;

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-6 text-center">
      <div className="max-w-md space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight text-white">
          {copy.title}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
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

