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
          <div className="flex h-[42px] overflow-hidden rounded-md border border-border bg-background/60 transition-colors focus-within:border-primary">
            <input
              id="blog-newsletter-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder={newsletterCopy.placeholder}
              className="flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="flex w-[46px] shrink-0 items-center justify-center bg-primary text-primary-foreground transition-colors hover:bg-primary-hover cursor-pointer"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
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
