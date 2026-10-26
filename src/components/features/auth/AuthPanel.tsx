import * as React from "react";
import { authCopy } from "@/data/auth";
import { Logo } from "@/components/layout/Logo";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";
import { cn } from "@/lib/utils";

export interface AuthPanelProps {
  variant: "welcome" | "signin";
  className?: string;
}

const toneClasses: Record<
  "orange" | "blue" | "violet" | "green",
  {
    tile: string;
    icon: string;
  }
> = {
  orange: {
    tile: "border-primary/60 bg-primary/10",
    icon: "text-primary",
  },
  blue: {
    tile: "border-accent/60 bg-accent/10",
    icon: "text-accent",
  },
  violet: {
    tile: "border-violet/60 bg-violet/10",
    icon: "text-violet",
  },
  green: {
    tile: "border-success/60 bg-success/10",
    icon: "text-success",
  },
};

export function AuthPanel({ variant, className }: AuthPanelProps) {
  return (
    <div
      className={cn(
        "relative hidden lg:flex flex-col overflow-hidden border-r border-border bg-card p-6 xl:p-8 select-none",
        className
      )}
    >
      {/* Art layer (aria-hidden, pointer-events-none, select-none) */}
      <div
        className="pointer-events-none absolute inset-0 select-none"
        aria-hidden="true"
      >
        <ArtworkSlot
          name="Auth: globe + floating clouds"
          className="absolute right-0 top-[8%] h-[40%] w-[46%] aspect-auto"
        />
        <ArtworkSlot
          name="Auth: campus at night"
          className="absolute inset-x-0 bottom-0 h-[48%] w-full aspect-auto"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-card via-card/75 to-transparent" />
      </div>

      {/* Content layer */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Top: Logo + Tagline */}
        <div>
          <Logo className="origin-left scale-100" />
          <div className="mt-3 flex items-center gap-2.5 text-[11px] font-medium tracking-[0.14em] text-white uppercase">
            {authCopy.panel.tagline.map((item, idx) => (
              <React.Fragment key={item}>
                <span>{item}</span>
                {idx < authCopy.panel.tagline.length - 1 && (
                  <span className="h-2.5 w-px bg-white/20" aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Center content */}
        {variant === "welcome" ? (
          <div>
            <h2 className="mt-5 text-[clamp(22px,2vw,28px)] font-bold leading-[1.12] text-white tracking-tight">
              <span>{authCopy.panel.welcomeHeading.line1}</span>
              <br />
              <span>{authCopy.panel.welcomeHeading.line2Prefix}</span>
              <span className="text-primary">
                {authCopy.panel.welcomeHeading.line2Highlight}
              </span>
            </h2>

            <p className="mt-2 text-[13px] leading-[1.4] text-muted-foreground max-w-[340px]">
              {authCopy.panel.welcomeText}
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {authCopy.panel.benefits.map((b) => {
                const Icon = b.icon;
                const toneStyle = toneClasses[b.tone];
                return (
                  <div key={b.text} className="flex items-center gap-3">
                    <div
                      aria-hidden="true"
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                        toneStyle.tile
                      )}
                    >
                      <Icon
                        className={cn("size-4", toneStyle.icon)}
                        strokeWidth={1.5}
                      />
                    </div>
                    <span className="max-w-[250px] text-[12.5px] leading-[1.3] text-white font-normal">
                      {b.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="mt-6 text-[clamp(28px,2.8vw,38px)] font-bold leading-[1.1] text-white tracking-tight">
              {authCopy.panel.signinHeading.map((word, idx) => (
                <span
                  key={word}
                  className={cn(
                    "block",
                    idx === authCopy.panel.signinHeading.length - 1 &&
                      "text-primary"
                  )}
                >
                  {word}
                </span>
              ))}
            </h2>

            <div className="mt-4 flex flex-col text-[14px] font-medium uppercase tracking-[0.12em] text-accent leading-[1.4]">
              {authCopy.panel.footerGroups[0].map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </div>
        )}

        {/* Bottom footerGroups */}
        <div className="mt-auto flex items-center gap-4 pt-4">
          {variant === "welcome" ? (
            <>
              {/* Group 1 */}
              <div className="flex flex-col text-[11.5px] font-medium uppercase tracking-[0.12em] text-foreground/90 leading-[1.35]">
                {authCopy.panel.footerGroups[0].map((line) => (
                  <span key={line}>{line}</span>
                ))}
                <div className="mt-1.5 h-0.5 w-8 bg-primary" aria-hidden="true" />
              </div>

              {/* Divider 1-2 */}
              <div
                className="hidden h-8 w-px bg-primary/70 xl:block"
                aria-hidden="true"
              />

              {/* Group 2 */}
              <div className="hidden flex-col text-[11.5px] font-medium uppercase tracking-[0.12em] text-accent leading-[1.35] xl:flex">
                {authCopy.panel.footerGroups[1].map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>

              {/* Divider 2-3 */}
              <div
                className="hidden h-8 w-px bg-primary/70 xl:block"
                aria-hidden="true"
              />

              {/* Group 3 */}
              <div className="hidden flex-col text-[11.5px] font-medium uppercase tracking-[0.12em] text-foreground/90 leading-[1.35] xl:flex">
                {authCopy.panel.footerGroups[2].map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Group 2 */}
              <div className="hidden flex-col text-[11.5px] font-medium uppercase tracking-[0.12em] text-accent leading-[1.35] xl:flex">
                {authCopy.panel.footerGroups[1].map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>

              {/* Divider 2-3 */}
              <div
                className="hidden h-8 w-px bg-primary/70 xl:block"
                aria-hidden="true"
              />

              {/* Group 3 */}
              <div className="hidden flex-col text-[11.5px] font-medium uppercase tracking-[0.12em] text-foreground/90 leading-[1.35] xl:flex">
                {authCopy.panel.footerGroups[2].map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
