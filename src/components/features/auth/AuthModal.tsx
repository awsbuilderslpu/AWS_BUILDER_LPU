"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { authCopy, authParam, type AuthView } from "@/data/auth";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AuthPanel } from "@/components/features/auth/AuthPanel";
import { RegisterFlow } from "@/components/features/auth/RegisterFlow";
import { SignInView } from "@/components/features/auth/SignInView";
import { RegistrationProvider } from "@/components/features/auth/RegistrationProvider";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

export function AuthModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const authValue = searchParams.get(authParam);
  const isOpen = authValue === "signin" || authValue === "register";
  const view: AuthView = authValue === "signin" ? "signin" : "register";

  const previousActiveElementRef = React.useRef<HTMLElement | null>(null);

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
          // Sm to lg: centered card, max-w-[540px], rounded-2xl
          "sm:fixed sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[92vw] sm:max-w-[540px] sm:h-auto sm:max-h-[92vh] sm:rounded-2xl sm:flex sm:flex-col",
          // At lg: 2-column grid, compact and clean, fits laptop displays beautifully without zoom hacks
          "lg:w-[min(940px,calc(100vw-40px))] lg:h-[min(620px,calc(100svh-32px))] lg:max-w-[940px] lg:max-h-[620px] lg:rounded-[24px] lg:grid lg:grid-cols-[46fr_54fr]"
        )}
      >
        {/* Radix Accessible Title & Description */}
        <DialogTitle className="sr-only">
          {view === "register" ? authCopy.welcome.title : authCopy.signin.title}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {view === "register"
            ? authCopy.welcome.subtitle
            : authCopy.signin.subtitle}
        </DialogDescription>

        {/* Left Panel: AuthPanel (hidden below lg). Stays "welcome" for every register screen */}
        <AuthPanel variant={view === "signin" ? "signin" : "welcome"} />

        {/* Right Panel */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden auth-scrollable px-6 py-5 sm:px-8 sm:py-6">
          {/* Close button: absolute right-4 top-4 z-20, 36px circle */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          {/* Logo at top below lg */}
          <div className="mb-6 flex items-center justify-start lg:hidden">
            <Logo />
          </div>

          {/* RegistrationProvider wraps both views so switching tabs keeps progress */}
          <RegistrationProvider>
            {view === "register" ? <RegisterFlow /> : <SignInView />}
          </RegistrationProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
