import * as React from "react";

export function PageBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background"
    >
      {/* Subtle Grid with CSS mask fading toward edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, color-mix(in srgb, var(--muted-foreground) 5%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, var(--muted-foreground) 5%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 85% 75% at 50% 50%, black 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 75% at 50% 50%, black 50%, transparent 100%)",
        }}
      />

      {/* Ambient Radial Glow: Electric Blue (Top-Right) */}
      <div
        className="absolute -top-[10%] -right-[10%] h-[600px] w-[600px] sm:h-[800px] sm:w-[800px] rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent) 14%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* Ambient Radial Glow: AWS Orange (Bottom-Left) */}
      <div
        className="absolute -bottom-[10%] -left-[10%] h-[600px] w-[600px] sm:h-[800px] sm:w-[800px] rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
