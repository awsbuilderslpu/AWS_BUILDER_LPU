"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ThemeToggleProps {
  className?: string;
  align?: "start" | "center" | "end";
}

export function ThemeToggle({ className, align = "end" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={cn(
          "relative flex size-10 items-center justify-center rounded-lg border border-border bg-card/40 text-muted-foreground",
          className
        )}
        disabled
      >
        <Sun className="size-5 opacity-50" />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Toggle theme"
          className={cn(
            "relative flex size-10 items-center justify-center rounded-lg border border-border bg-card/40 text-muted-foreground",
            "transition-all duration-200 hover:border-primary/50 hover:bg-card/80 hover:text-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background cursor-pointer",
            className
          )}
        >
          <Sun className="size-5 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-5 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={8}
        className="w-36 rounded-xl border border-border bg-card/95 p-1.5 shadow-xl backdrop-blur-xl"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary",
            theme === "light" && "bg-primary/10 text-primary font-semibold"
          )}
        >
          <span className="flex items-center gap-2">
            <Sun className="size-4" />
            <span>Light</span>
          </span>
          {theme === "light" && <Check className="size-3.5 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary",
            theme === "dark" && "bg-primary/10 text-primary font-semibold"
          )}
        >
          <span className="flex items-center gap-2">
            <Moon className="size-4" />
            <span>Dark</span>
          </span>
          {theme === "dark" && <Check className="size-3.5 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary",
            theme === "system" && "bg-primary/10 text-primary font-semibold"
          )}
        >
          <span className="flex items-center gap-2">
            <Laptop className="size-4" />
            <span>System</span>
          </span>
          {theme === "system" && <Check className="size-3.5 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

