"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { siteConfig, navLinks } from "@/data/site";
import { authCopy } from "@/data/auth";
import { cn } from "@/lib/utils";
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

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const { account, signOut } = useAuth();

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-50 h-[72px] w-full border-b border-border bg-background/80 backdrop-blur-md">
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
                  <span
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
          <NotificationBell />
          {account ? (
            <UserMenu account={account} />
          ) : (
            <Button
              asChild
              variant="outlineOrange"
              size="sm"
              withArrow
              className="h-10 rounded-lg px-5 text-sm font-medium"
            >
              <Link href={siteConfig.signInUrl} scroll={false}>
                Sign in
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
                </nav>
              </div>

              {/* Mobile Drawer Footer CTA */}
              <div className="flex flex-col gap-3 pt-6 border-t border-border">
                {account ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Avatar name={account.displayName || "User"} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {account.displayName}
                        </p>
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
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/account">My Account</Link>
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
                    <div className="text-center">
                      <Link
                        href={siteConfig.signInUrl}
                        scroll={false}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                      >
                        Sign in
                      </Link>
                    </div>
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
