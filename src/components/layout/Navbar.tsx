"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogIn, Menu, UserRound } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { siteConfig, navLinks } from "@/data/site";
import { authCopy } from "@/data/auth";
import { profileCopy } from "@/data/profile";
import { canAccessAdmin } from "@/data/admin";
import { roleMeta } from "@/data/roles";
import { cn } from "@/lib/utils";
import { durations, easing } from "@/lib/motion/tokens";
import { Logo } from "@/components/layout/Logo";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UserMenu } from "@/components/layout/UserMenu";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 h-[72px] w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav
          className="hidden h-full items-center gap-1 lg:flex xl:gap-2"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative flex h-full items-center px-3.5 py-1 text-[15px] font-medium text-foreground/90 transition-colors duration-200 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <div className="size-10 rounded-lg border border-border/80 bg-card/40" />
          <div className="size-10 rounded-full border border-border/80 bg-card/40" />
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <div className="size-10" />
        </div>
      </div>
    </header>
  );
}

export function Navbar() {
  return (
    <React.Suspense fallback={<NavbarFallback />}>
      <NavbarContent />
    </React.Suspense>
  );
}

function NavbarContent() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const { account, isLoading, signOut } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const isPending = account?.registrationStatus === "pending";
  const roleLabel = isPending
    ? profileCopy.access.pending
    : account?.role && roleMeta[account.role]
      ? roleMeta[account.role].label
      : null;

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-50 h-[72px] w-full border-b border-white/[0.08] bg-[#040814]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <Logo />

        {/* Center: Desktop Navigation Links */}
        <nav
          className="hidden h-full items-center gap-1 lg:flex xl:gap-2"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full items-center px-3.5 py-1 text-[15px] font-medium transition-colors duration-200",
                  active
                    ? "text-primary font-semibold"
                    : "text-foreground/90 hover:text-primary"
                )}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    transition={{
                      duration: shouldReduceMotion ? 0 : durations.base,
                      ease: easing,
                    }}
                    className="absolute bottom-[12px] left-3.5 right-3.5 h-[2px] rounded-full bg-primary"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions (Desktop) */}
        <div className="hidden items-center gap-3 lg:flex">
          {account && canAccessAdmin(account.role) && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-lg border border-[#FF9900]/30 bg-[#FF9900]/10 px-3 py-1.5 text-xs font-mono font-medium text-[#FF9900] shadow-[0_0_10px_rgba(255,153,0,0.15)] transition-all hover:bg-[#FF9900]/20 hover:border-[#FF9900]/50"
            >
              <LayoutDashboard className="size-3.5" />
              <span>Admin Console</span>
            </Link>
          )}

          <NotificationBell />

          {isLoading ? (
            <div className="h-10 w-24 animate-pulse rounded-lg border border-border/80 bg-card/40" />
          ) : account ? (
            <UserMenu account={account} />
          ) : (
            <Button
              asChild
              variant="primary"
              className="h-10 px-4 font-semibold shadow-sm"
            >
              <Link href={siteConfig.signInUrl} scroll={false}>
                <LogIn className="size-4" />
                <span>Log In</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile: Notification and Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <NotificationBell />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-foreground hover:bg-white/5"
                aria-label="Open navigation menu"
              >
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[280px] flex-col justify-between border-l border-border bg-background/95 p-6 backdrop-blur-xl sm:w-[340px]"
            >
              <div className="flex flex-col space-y-6">
                <SheetHeader className="text-left">
                  <SheetTitle className="text-left">
                    <Logo />
                  </SheetTitle>
                </SheetHeader>

                <nav
                  className="flex flex-col space-y-1 pt-4"
                  aria-label="Mobile Navigation"
                >
                  {navLinks.map((link) => {
                    const active = isLinkActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground/80 hover:bg-white/5 hover:text-primary"
                        )}
                      >
                        <span>{link.label}</span>
                        {active && (
                          <span
                            className="size-1.5 rounded-full bg-primary"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    );
                  })}
                  {canAccessAdmin(account?.role ?? null) && (
                    <div className="pt-2">
                      <div className="my-2 h-px bg-border/60" />
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                          pathname.startsWith("/admin")
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground/80 hover:bg-primary/10 hover:text-primary"
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <LayoutDashboard className="size-4 text-primary" />
                          <span>Admin Dashboard</span>
                        </span>
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          Admin
                        </span>
                      </Link>
                    </div>
                  )}
                </nav>
              </div>

              {/* Mobile Drawer Footer CTA */}
              <div className="flex flex-col gap-3 pt-6 border-t border-border">
                {account ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Avatar name={account.displayName || "User"} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">
                            {account.displayName}
                          </p>
                          {roleLabel && (
                            <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              {roleLabel}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {account.email}
                        </p>
                      </div>
                    </div>
                    {!account.profileComplete && (
                      <Button
                        asChild
                        variant="primary"
                        className="w-full justify-center"
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href="?auth=complete" scroll={false}>
                          {authCopy.menu.finish}
                        </Link>
                      </Button>
                    )}
                    {canAccessAdmin(account.role) && (
                      <Button
                        asChild
                        variant="primary"
                        className="w-full justify-center gap-2 font-semibold shadow-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href="/admin">
                          <LayoutDashboard className="size-4" />
                          <span>{authCopy.menu.account.dashboard}</span>
                        </Link>
                      </Button>
                    )}
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/profile">
                        <UserRound className="size-4" />
                        <span>{profileCopy.myProfile}</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={async () => {
                        setIsOpen(false);
                        await signOut();
                      }}
                    >
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="primary"
                      withArrow
                      className="w-full justify-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href={siteConfig.joinUrl} scroll={false}>
                        Join the Club
                      </Link>
                    </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full justify-center gap-2"
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href={siteConfig.signInUrl} scroll={false}>
                            <LogIn className="size-4" />
                            <span>Log In</span>
                          </Link>
                      </Button>
                    </>
                )}
                  </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
