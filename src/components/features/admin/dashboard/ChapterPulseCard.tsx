import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ShieldCheck, Cpu, Database, CheckCircle2 } from "lucide-react";

export function ChapterPulseCard() {
  const telemetry = [
    {
      label: "Region",
      value: "ap-south-1 (Mumbai)",
      status: "operational",
      icon: Cpu,
    },
    {
      label: "Chapter Node",
      value: "LPU Main Campus",
      status: "operational",
      icon: CheckCircle2,
    },
    {
      label: "Data & Storage",
      value: "Supabase Cloud RLS",
      status: "operational",
      icon: Database,
    },
    {
      label: "Console Security",
      value: "RBAC Enforced",
      status: "operational",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-4 sm:p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            System & Cloud Telemetry
          </span>
        </div>
        <span className="font-mono text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 rounded-full">
          All Systems Normal
        </span>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 gap-2">
        {telemetry.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.label}
              className="rounded-xl border border-border/60 bg-muted/40 dark:bg-[#050B18]/60 p-2.5 sm:p-3"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground/70">
                <Icon className="size-3 text-primary/80" />
                <span className="text-[10px] font-mono uppercase tracking-wider">
                  {t.label}
                </span>
              </div>
              <div className="text-[12px] font-semibold text-foreground/90 mt-1 truncate">
                {t.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Public site preview banner */}
      <Link
        href="/"
        className="group relative flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-3 transition-all hover:border-primary/50 hover:bg-primary/[0.08] hover:shadow-[0_0_15px_rgba(255,153,0,0.15)]"
      >
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted dark:bg-[#050B18] overflow-hidden p-1">
          <Image
            src="/images/artwork/Neon Cloud Computing Emblem.png"
            alt="AWS Cloud"
            width={32}
            height={32}
            className="object-contain drop-shadow-[0_0_8px_rgba(255,153,0,0.4)] group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors block">
            Visit Public Website
          </span>
          <span className="text-[11px] text-muted-foreground line-clamp-1">
            See how the community portal looks to visitors
          </span>
        </div>

        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card/60 text-muted-foreground group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          <ArrowUpRight className="size-3.5" />
        </div>
      </Link>
    </div>
  );
}

