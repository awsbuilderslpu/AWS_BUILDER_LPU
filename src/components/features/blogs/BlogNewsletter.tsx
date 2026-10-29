"use client";

import * as React from "react";
import { ChevronRight, ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { newsletterCopy } from "@/data/blogs";

export interface BlogNewsletterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function BlogNewsletter({ className, ...props }: BlogNewsletterProps) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setIsSuccess(true);
    // TODO: Connect Resend or Formspree later
  };

  return (
    <CornerFrame
      className={cn("bg-card/60 p-5 md:p-5 lg:p-5", className)}
      {...props}
    >
      {/* Top: ChevronRight (14px, orange) + the eyebrow text in orange mono, bold, uppercase, tracking ~0.15em, 13px */}
      <div className="flex items-center gap-1.5 text-primary">
        <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="font-mono text-[13px] font-bold uppercase tracking-[0.15em]">
          {newsletterCopy.eyebrow}
        </span>
      </div>

      {/* Then mt-3, the text in muted 13.5px, leading 1.45 */}
      <p className="mt-3 text-[13.5px] leading-[1.45] text-muted-foreground">
        {newsletterCopy.text}
      </p>

      {/* Form (mt-4) */}
      {isSuccess ? (
        <div
          role="status"
          className="mt-4 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-primary"
        >
          <Check className="size-4 shrink-0" aria-hidden="true" />
          <span>Thanks, you&apos;re on the list.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4">
          <label htmlFor="blog-newsletter-email" className="sr-only">
            Email address
          </label>
          <div className="flex items-center gap-2">
            <input
              id="blog-newsletter-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder={newsletterCopy.placeholder}
              className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-card/40 px-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium transition-all hover:bg-primary-hover hover:scale-105 active:scale-95 cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <ArrowRight className="size-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>

          {error && (
            <span role="alert" className="mt-1.5 block text-xs text-red-400">
              {error}
            </span>
          )}
        </form>
      )}
    </CornerFrame>
  );
}
