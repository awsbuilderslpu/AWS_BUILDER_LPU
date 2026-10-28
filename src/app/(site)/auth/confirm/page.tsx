import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck, AlertTriangle, Loader2 } from "lucide-react";
import { authCopy } from "@/data/auth";
import { safeNext } from "@/lib/auth/safe-next";
import { ConfirmForm } from "./ConfirmForm";
import { Button } from "@/components/ui/button";

export const instant = false;

export const metadata: Metadata = {
  title: "Confirm Email | AWS Builder Group LPU",
  description: "Confirm your email address to activate your club account.",
};

interface ConfirmPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function ConfirmSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Loading confirmation details...</p>
    </div>
  );
}

async function ConfirmContent({ searchParams }: ConfirmPageProps) {
  const resolvedParams = await searchParams;

  const rawTokenHash = resolvedParams.token_hash;
  const tokenHash = typeof rawTokenHash === "string" ? rawTokenHash : null;

  const rawType = resolvedParams.type;
  const type = typeof rawType === "string" ? rawType : "signup";

  const rawNext = resolvedParams.next;
  const next = safeNext(typeof rawNext === "string" ? rawNext : "/account");

  const rawError = resolvedParams.error;
  const hasError = Boolean(rawError);

  if (hasError || !tokenHash) {
    return (
      <div>
        <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-400">
          <AlertTriangle className="size-7" />
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">
          {authCopy.confirmPage.expiredTitle}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {authCopy.confirmPage.expiredDescription}
        </p>

        <div className="mt-6">
          <Button asChild variant="primary" className="w-full">
            <Link href="/?auth=signin">
              {authCopy.confirmPage.backToSignIn}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary shadow-[0_0_20px_rgba(255,153,0,0.25)]">
        <MailCheck className="size-7" />
      </div>

      <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">
        {authCopy.confirmPage.title}
      </h1>

      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-primary">
        {authCopy.confirmPage.subtitle}
      </p>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {authCopy.confirmPage.description}
      </p>

      <ConfirmForm tokenHash={tokenHash} type={type} next={next} />
    </div>
  );
}

export default function ConfirmPage({ searchParams }: ConfirmPageProps) {
  return (
    <div className="flex min-h-[calc(100vh-144px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px] rounded-2xl border border-border bg-card/80 p-6 sm:p-8 backdrop-blur-md shadow-xl text-center">
        <Suspense fallback={<ConfirmSkeleton />}>
          <ConfirmContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

