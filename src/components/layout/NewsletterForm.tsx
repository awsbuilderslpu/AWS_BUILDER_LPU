"use client";

import * as React from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    // TODO: Connect Resend, AWS SES, or Formspree API here later
    setIsSubmitted(true);
    setEmail("");
  };

  return (
    <div className="w-full rounded-xl border border-border bg-card/60 p-5 md:p-6 backdrop-blur-sm">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        {/* Left: Icon, Eyebrow, Explanatory Text */}
        <div className="flex items-start gap-4 sm:items-center">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
            <Mail className="size-5" />
          </div>
          <div className="flex flex-col">
            <SectionEyebrow className="mb-1 text-[11px]">Stay Updated</SectionEyebrow>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Get the latest blog posts, events, workshops and announcements directly in your inbox.
            </p>
          </div>
        </div>

        {/* Right: Subscription Form or Success Message */}
        <div className="w-full md:w-auto">
          {isSubmitted ? (
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-foreground">
              <CheckCircle2 className="size-4 text-primary shrink-0" />
              <span>Thank you for subscribing! We&apos;ll keep you posted.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
              noValidate
            >
              <div className="relative w-full sm:w-[260px] lg:w-[320px]">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter your email address"
                  className="h-11 w-full rounded-md border border-border bg-background/80 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  aria-label="Email address for newsletter"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                withArrow
                size="default"
                className="h-11 px-6 rounded-md font-semibold whitespace-nowrap w-full sm:w-auto text-sm"
              >
                Subscribe
              </Button>
            </form>
          )}
          {error && (
            <p className="mt-1.5 text-xs text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
