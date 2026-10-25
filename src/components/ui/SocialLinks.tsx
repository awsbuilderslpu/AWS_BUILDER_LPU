import * as React from "react";
import {
  FaLinkedinIn,
  FaInstagram,
  FaDiscord,
  FaGithub,
  FaYoutube,
} from "react-icons/fa6";

import { socialLinks } from "@/data/site";
import { cn } from "@/lib/utils";

export interface SocialLinksProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const socialIconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  linkedin: FaLinkedinIn,
  instagram: FaInstagram,
  discord: FaDiscord,
  github: FaGithub,
  youtube: FaYoutube,
};

export function SocialLinks({ className, ...props }: SocialLinksProps) {
  return (
    <div
      className={cn("flex items-center gap-10", className)}
      {...props}
    >
      {socialLinks.map((social) => {
        const IconComponent =
          socialIconMap[social.icon.toLowerCase()] ?? FaGithub;

        return (
          <a
            key={social.name}
            href={social.href}
            aria-label={social.name}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors duration-200 hover:text-primary"
          >
            <IconComponent className="size-[18px]" />
          </a>
        );
      })}
    </div>
  );
}
