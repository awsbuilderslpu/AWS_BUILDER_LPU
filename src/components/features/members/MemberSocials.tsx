import * as React from "react";
import { FaAws, FaLinkedin, FaGithub, FaInstagram, FaYoutube } from "react-icons/fa6";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberSocials as MemberSocialsType } from "@/data/members";

export interface MemberSocialsProps {
  name: string;
  socials: MemberSocialsType;
  className?: string;
}

export function MemberSocials({ name, socials, className }: MemberSocialsProps) {
  const items: { label: string; href: string; icon: React.ReactNode }[] = [];

  if (socials.awsBuilder) {
    items.push({
      label: `${name} on AWS Builder Center`,
      href: socials.awsBuilder,
      icon: <FaAws className="size-4 shrink-0 text-[#FF9900]" aria-hidden="true" />,
    });
  }

  if (socials.linkedin) {
    items.push({
      label: `${name} on LinkedIn`,
      href: socials.linkedin,
      icon: <FaLinkedin className="size-4 shrink-0" aria-hidden="true" />,
    });
  }

  if (socials.github) {
    items.push({
      label: `${name} on GitHub`,
      href: socials.github,
      icon: <FaGithub className="size-4 shrink-0" aria-hidden="true" />,
    });
  }

  if (socials.website) {
    items.push({
      label: `${name}'s website`,
      href: socials.website,
      icon: <Globe className="size-4 shrink-0 stroke-[1.5]" aria-hidden="true" />,
    });
  }

  if (socials.instagram) {
    items.push({
      label: `${name} on Instagram`,
      href: socials.instagram,
      icon: <FaInstagram className="size-4 shrink-0" aria-hidden="true" />,
    });
  }

  if (socials.youtube) {
    items.push({
      label: `${name} on YouTube`,
      href: socials.youtube,
      icon: <FaYoutube className="size-4 shrink-0" aria-hidden="true" />,
    });
  }

  if (items.length === 0) return null;

  return (
    <ul className={cn("flex items-center gap-5", className)}>
      {items.map((item) => {
        const isExternal = item.href !== "#";
        return (
          <li key={item.label} className="inline-flex">
            <a
              href={item.href}
              aria-label={item.label}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="rounded-sm text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            >
              {item.icon}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
