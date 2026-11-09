"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X, Check } from "lucide-react";
import { authCopy, authParam, errorParams, type AuthView } from "@/data/auth";
import { safeNext } from "@/lib/auth/safe-next";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AuthPanel } from "@/components/features/auth/AuthPanel";
import { RegisterFlow } from "@/components/features/auth/RegisterFlow";
import { SignInView } from "@/components/features/auth/SignInView";
import { ForgotPasswordView } from "@/components/features/auth/ForgotPasswordView";
import { ResetPasswordView } from "@/components/features/auth/ResetPasswordView";
import { CompleteFlow } from "@/components/features/auth/CompleteFlow";
import { RegistrationProvider } from "@/components/features/auth/RegistrationProvider";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function VerifiedView({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"), "/account");

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
        <Check className="size-8 stroke-[2.5]" />
      </div>
      <h2
        id="auth-view-heading"
        tabIndex={-1}
        className="mt-6 text-2xl font-bold tracking-tight text-foreground outline-none"
      >
        {authCopy.signinSuccess.title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {authCopy.signinSuccess.description}
      </p>
      <Button
        type="button"
        variant="primary"
        className="mt-6 w-full max-w-[280px]"
        onClick={() => {
          onClose();
          router.push(next);
        }}
      >
        {authCopy.signinSuccess.cta}
      </Button>
    </div>
  );
}

export function AuthModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { account, isLoading: authLoading } = useAuth();

  const authValue = searchParams.get(authParam);
  const isOpen =
    authValue === "signin" ||
    authValue === "register" ||
    authValue === "verified" ||
    authValue === "forgot" ||
    authValue === "reset" ||
    authValue === "complete";

  const view: AuthView =
    authValue === "signin" ||
    authValue === "register" ||
    authValue === "verified" ||
    authValue === "forgot" ||
    authValue === "reset" ||
    authValue === "complete"
      ? authValue
      : "register";

  const errorParam = searchParams.get("error");
  const urlErrorMessage = errorParam
    ? errorParams[errorParam] || authCopy.errors.generic
    : null;

  const previousActiveElementRef = React.useRef<HTMLElement | null>(null);

  // Guard complete view: if not logged in -> redirect to signin; if already complete -> go to /account
  React.useEffect(() => {
    if (!isOpen || authLoading || authValue !== "complete") return;

    if (!account) {
      const nextParam = searchParams.get("next");
      const params = new URLSearchParams();
      params.set(authParam, "signin");
      if (nextParam) {
        params.set("next", safeNext(nextParam, "/account"));
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else if (account.profileComplete) {
      const next = safeNext(searchParams.get("next"), "/account");
      const params = new URLSearchParams(searchParams.toString());
      params.delete(authParam);
      params.delete("next");
      params.delete("error");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      router.push(next);
    }
  }, [isOpen, authLoading, authValue, account, pathname, router, searchParams]);

  // Remember active element when popup opens
  React.useEffect(() => {
    if (isOpen) {
      if (document.activeElement instanceof HTMLElement) {
        previousActiveElementRef.current = document.activeElement;
      }
    }
  }, [isOpen]);

  // Focus view heading when view changes or popup opens
  React.useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => {
        const heading = document.getElementById("auth-view-heading");
        if (heading) {
          heading.focus();
        }
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen, view]);

  const handleClose = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(authParam);
    params.delete("next");
    params.delete("error");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleCloseAutoFocus = (event: Event) => {
    if (previousActiveElementRef.current) {
      event.preventDefault();
      previousActiveElementRef.current.focus();
      previousActiveElementRef.current = null;
    }
  };

  const getAccessibleTitle = () => {
    switch (view) {
      case "register":
        return authCopy.welcome.title;
      case "verified":
        return authCopy.signinSuccess.title;
      case "forgot":
        return authCopy.forgot.title;
      case "reset":
        return authCopy.reset.title;
      case "complete":
        return authCopy.complete.title;
      case "signin":
      default:
        return authCopy.signin.title;
    }
  };

  const getAccessibleDescription = () => {
    switch (view) {
      case "register":
        return authCopy.welcome.subtitle;
      case "verified":
        return authCopy.signinSuccess.description;
      case "forgot":
        return authCopy.forgot.subtitle;
      case "reset":
        return authCopy.reset.subtitle;
      case "complete":
        return authCopy.complete.subtitle;
      case "signin":
      default:
        return authCopy.signin.subtitle;
    }
  };

  const isSigninFamily =
    view === "signin" || view === "forgot" || view === "reset";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent
        hideCloseButton
        onCloseAutoFocus={handleCloseAutoFocus}
        className={cn(
          "p-0 gap-0 border border-border bg-background shadow-2xl overflow-hidden",
          // Below sm: full screen, no radius
          "inset-0 left-0 top-0 translate-x-0 translate-y-0 w-full h-full max-w-none rounded-none flex flex-col",
          // Sm to lg: centered card, max-w-[486px] (10% smaller than 540px), rounded-2xl
          "sm:fixed sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[92vw] sm:max-w-[486px] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:flex sm:flex-col",
          // At lg: 2-column grid, 846px x 580px (~10% smaller than 940px x 620px)
          "lg:w-[min(846px,calc(100vw-36px))] lg:h-[min(580px,calc(100svh-24px))] lg:max-w-[846px] lg:max-h-[580px] lg:rounded-[20px] lg:grid lg:grid-cols-[44fr_56fr]"
        )}
      >
        {/* Radix Accessible Title & Description */}
        <DialogTitle className="sr-only">{getAccessibleTitle()}</DialogTitle>
        <DialogDescription className="sr-only">
          {getAccessibleDescription()}
        </DialogDescription>

        {/* Left Panel: AuthPanel (hidden below lg) */}
        <AuthPanel variant={isSigninFamily ? "signin" : "welcome"} />

        {/* Right Panel */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden auth-scrollable px-4.5 py-3.5 sm:px-6 sm:py-4">
          {/* Close button: absolute right-3.5 top-3.5 z-20, compact circle */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-3.5 top-3.5 z-20 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
          >
            <X className="size-4.5" aria-hidden="true" />
          </button>

          {/* Logo at top below lg */}
          <div className="mb-6 flex items-center justify-start lg:hidden">
            <Logo />
          </div>

          {/* View rendering */}
          {view === "register" ? (
            <RegistrationProvider>
              <RegisterFlow />
            </RegistrationProvider>
          ) : view === "verified" ? (
            <VerifiedView onClose={handleClose} />
          ) : view === "forgot" ? (
            <ForgotPasswordView />
          ) : view === "reset" ? (
            <ResetPasswordView />
          ) : view === "complete" ? (
            <CompleteFlow />
          ) : (
            <SignInView urlError={urlErrorMessage} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
