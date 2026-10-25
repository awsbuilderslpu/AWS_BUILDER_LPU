"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { siteConfig, navLinks } from "@/data/site";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";
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

        {/* Right: Sign in CTA (Desktop) */}
        <div className="hidden items-center lg:flex">
          <Button
            asChild
            variant="outlineOrange"
            size="sm"
            withArrow
            className="h-10 rounded-lg px-5 text-sm font-medium"
          >
            <Link href={siteConfig.joinUrl}>Sign in</Link>
          </Button>
        </div>

        {/* Mobile: Hamburger Button and Sheet */}
        <div className="flex items-center lg:hidden">
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
              <div className="pt-6">
                <Button
                  asChild
                  variant="outlineOrange"
                  withArrow
                  className="w-full justify-center"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href={siteConfig.joinUrl}>Sign in</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
