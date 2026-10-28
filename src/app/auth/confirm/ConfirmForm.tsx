"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { authCopy } from "@/data/auth";
import { confirmEmailToken, type ConfirmState } from "./actions";
import { Button } from "@/components/ui/button";

interface ConfirmFormProps {
  tokenHash: string;
  type: string;
  next: string;
}

export function ConfirmForm({ tokenHash, type, next }: ConfirmFormProps) {
  const [state, formAction, isPending] = useActionState<ConfirmState, FormData>(
    confirmEmailToken,
    { error: null }
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col items-center">
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="next" value={next} />

      {state.error ? (
        <div className="w-full space-y-4">
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-red-400/40 bg-red-400/10 p-4 text-left text-sm text-red-200"
          >
            <AlertCircle className="size-5 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-semibold">{authCopy.confirmPage.expiredTitle}</p>
              <p className="mt-1 text-[13px] text-red-300">{state.error}</p>
            </div>
          </div>
          <Button asChild variant="primary" className="w-full">
            <Link href="/?auth=signin">{authCopy.confirmPage.backToSignIn}</Link>
          </Button>
        </div>
      ) : (
        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          className="h-11 w-full text-base font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin shrink-0" />
              <span>{authCopy.confirmPage.verifying}</span>
            </>
          ) : (
            <span>{authCopy.confirmPage.button}</span>
          )}
        </Button>
      )}
    </form>
  );
}

