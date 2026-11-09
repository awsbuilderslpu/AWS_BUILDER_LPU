import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  Mail,
  Link2,
  Calendar,
} from "lucide-react";
import {
  FaLinkedinIn,
  FaInstagram,
  FaDiscord,
  FaGithub,
  FaYoutube,
} from "react-icons/fa6";

import {
  siteConfig,
  footerLinks,
  legalLinks,
  socialLinks,
} from "@/data/site";
import { Logo } from "@/components/layout/Logo";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { Reveal } from "@/components/motion/Reveal";

export function Footer() {
  const currentYear = 2026;

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

  return (
    <Reveal once>
      <footer className="relative z-10 w-full border-t border-border bg-transparent text-foreground">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        {/* Grid: 2-column on mobile, 5-column on lg */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:gap-x-12 lg:grid-cols-5 lg:gap-0">
          {/* Column 1: Logo, Description, Tagline, Socials */}
          <div className="col-span-2 flex flex-col items-start lg:col-span-1 lg:pr-8">
            <Logo />
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {siteConfig.description}
            </p>

            {/* Tagline with orange slash */}
            <div className="mt-5 flex items-start gap-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-accent">
              <span className="text-base font-black leading-none text-primary">
                /
              </span>
              <span className="leading-tight">{siteConfig.tagline}</span>
            </div>

            {/* Social Buttons */}
            <div className="mt-6 flex items-center gap-2.5">
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
                    className="flex size-9 items-center justify-center rounded-lg border border-border bg-card/40 text-muted-foreground transition-all duration-200 hover:border-primary hover:text-primary hover:shadow-[0_0_10px_rgba(255,153,0,0.2)]"
                  >
                    <IconComponent className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Columns 2-4: footerLinks Groups (Quick Links, Resources, Community) */}
          {footerLinks.map((group) => (
            <div
              key={group.title}
              className="col-span-1 flex flex-col lg:border-l lg:border-border lg:pl-8"
            >
              <div className="mb-4 flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-wide text-foreground">
                  {group.title}
                </h3>
                <span
                  aria-hidden="true"
                  className="h-[2px] w-4 rounded-full bg-primary"
                />
              </div>
              <ul className="flex flex-col space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      scroll={link.href.startsWith("?") ? false : undefined}
                      className="text-xs text-muted-foreground transition-colors duration-200 hover:text-primary sm:text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column 5: Contact Us */}
          <div className="col-span-1 flex flex-col lg:border-l lg:border-border lg:pl-8">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">
                Contact Us
              </h3>
              <span
                aria-hidden="true"
                className="h-[2px] w-4 rounded-full bg-primary"
              />
            </div>
            <ul className="flex flex-col space-y-3.5">
              {/* Address */}
              <li className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  Lovely Professional University
                  <br />
                  Phagwara, Punjab, India
                </span>
              </li>

              {/* Email */}
              <li className="flex items-center gap-3 text-xs text-muted-foreground sm:text-sm">
                <Mail className="size-4 shrink-0 text-primary" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="transition-colors duration-200 hover:text-primary"
                >
                  {siteConfig.email}
                </a>
              </li>

              {/* Website */}
              <li className="flex items-center gap-3 text-xs text-muted-foreground sm:text-sm">
                <Link2 className="size-4 shrink-0 text-primary" />
                <a
                  href={`https://${siteConfig.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-primary"
                >
                  {siteConfig.website}
                </a>
              </li>

              {/* Announcements notice */}
              <li className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                <Calendar className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Follow us for latest updates on events, workshops and more.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription Bar */}
        <div className="mt-12 md:mt-16">
          <NewsletterForm />
        </div>

        {/* Bottom Bar: Copyright, Legal Links, Credits */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          {/* Left: Copyright */}
          <div>
            © {currentYear} {siteConfig.name} {siteConfig.org}. All rights reserved.
          </div>

          {/* Center: Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {legalLinks.map((link, idx) => (
              <React.Fragment key={link.label}>
                <Link
                  href={link.href}
                  scroll={link.href.startsWith("?") ? false : undefined}
                  className="transition-colors duration-200 hover:text-primary"
                >
                  {link.label}
                </Link>
                {idx < legalLinks.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="h-3 w-px bg-border"
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Right: Credits */}
          <div>
            Built by AWS_BUILDER_GROUP_LPU
          </div>
        </div>
      </div>
    </footer>
    </Reveal>
  );
}
