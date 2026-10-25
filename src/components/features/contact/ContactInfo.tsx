import * as React from "react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { contactInfo, followItem, contactCopy } from "@/data/contact";

export function ContactInfo() {
  const FollowIcon = followItem.icon;

  return (
    <section
      aria-labelledby="contact-details-title"
      className="rounded-lg border border-border bg-card/60 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pb-3.5 pt-4">
        <SectionEyebrow
          id="contact-details-title"
          size="sm"
          lines="after"
          role="heading"
          aria-level={2}
        >
          {contactCopy.titles.details}
        </SectionEyebrow>
      </div>

      {/* Info items */}
      <ul className="border-t border-border/70 divide-y divide-border/70">
        {contactInfo.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label} className="flex items-center gap-4 px-5 py-4">
              <Icon
                className="size-7 shrink-0 text-primary stroke-[1.25]"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1 flex flex-col">
                <span className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-muted-foreground">
                  {item.label}
                </span>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="mt-0.5 text-[15px] font-medium text-foreground break-words transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-sm"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span className="mt-0.5 text-[15px] font-medium text-foreground break-words">
                    {item.value}
                  </span>
                )}
              </div>
            </li>
          );
        })}

        {/* Follow us item */}
        <li className="flex items-start gap-4 px-5 py-4">
          <FollowIcon
            className="size-7 shrink-0 text-primary stroke-[1.25] mt-0.5"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1 flex flex-col">
            <span className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-muted-foreground">
              {followItem.label}
            </span>
            <p className="mt-0.5 text-[13.5px] leading-snug text-muted-foreground">
              {followItem.text}
            </p>
            <div className="mt-3">
              <SocialLinks className="gap-6" />
            </div>
          </div>
        </li>
      </ul>
    </section>
  );
}
