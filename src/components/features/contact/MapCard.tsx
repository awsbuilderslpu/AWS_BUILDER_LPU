import * as React from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/site";
import { mapsUrl, contactCopy } from "@/data/contact";

// TODO: Replace this placeholder with a real map embed or a static map image later.

export interface MapCardProps {
  className?: string;
}

export function MapCard({ className }: MapCardProps) {
  return (
    <section
      aria-labelledby="contact-map-title"
      className={cn(
        "relative flex min-h-[240px] flex-col overflow-hidden rounded-lg border border-border bg-card/60",
        className
      )}
    >
      {/* Background layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, color-mix(in srgb, var(--border) 60%, transparent) 1px, transparent 1px),
              linear-gradient(to bottom, color-mix(in srgb, var(--border) 60%, transparent) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse 85% 75% at 50% 50%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 85% 75% at 50% 50%, black 40%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--primary) 10%, transparent) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="px-5 pb-3.5 pt-4">
          <SectionEyebrow
            id="contact-map-title"
            size="sm"
            lines="after"
            role="heading"
            aria-level={2}
          >
            {contactCopy.titles.map}
          </SectionEyebrow>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 pb-6 text-center">
          <div
            aria-hidden="true"
            className="flex size-16 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_20%,transparent)]"
          >
            <MapPin className="size-[30px] text-primary" />
          </div>

          <span className="text-base font-semibold text-foreground">
            {siteConfig.university}
          </span>

          <p className="max-w-[320px] text-[13.5px] leading-snug text-muted-foreground">
            {siteConfig.address}
          </p>

          <Button asChild variant="outline" withArrow className="mt-2">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <span>{contactCopy.mapButton}</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
