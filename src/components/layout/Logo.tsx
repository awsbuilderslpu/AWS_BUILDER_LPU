import Link from "next/link";
import { siteConfig } from "@/data/site";

export function LogoIcon({
  className = "size-6",
  fill = "currentColor",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      viewBox="0 0 90 90"
      className={className}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Top Comb */}
      <path d="M20 20 V0 H30 V10 H40 V0 H50 V10 H60 V0 H70 V20 Z" />
      {/* Bottom Comb */}
      <path d="M20 70 H70 V90 H60 V80 H50 V90 H40 V80 H30 V90 H20 Z" />
      {/* Left Comb */}
      <path d="M20 20 V70 H0 V60 H10 V50 H0 V40 H10 V30 H0 V20 Z" />
      {/* Right Comb */}
      <path d="M70 20 H90 V30 H80 V40 H90 V50 H80 V60 H90 V70 H70 Z" />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 transition-opacity hover:opacity-95 select-none ${className ?? ""}`}
      aria-label={`${siteConfig.name} Home`}
    >
      <LogoIcon className="size-9 sm:size-10 shrink-0 text-[#9D48FA] transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(157,72,250,0.5)]" />
      <div className="flex flex-col justify-center leading-none">
        <span className="text-[20px] sm:text-[22px] font-bold tracking-tight text-foreground">
          {siteConfig.shortName}
        </span>
        <span className="text-[10px] font-mono font-medium tracking-[0.22em] text-muted-foreground uppercase mt-1">
          {siteConfig.org}
        </span>
      </div>
    </Link>
  );
}

