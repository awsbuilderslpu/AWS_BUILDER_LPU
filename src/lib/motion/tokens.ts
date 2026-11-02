export const durations = {
  fast: 0.2,
  base: 0.45,
  slow: 0.7,
} as const;

export const easing = [0.22, 1, 0.36, 1] as const;

export const distance = 16;

export function staggerDelay(index: number, step = 0.06, max = 0.6): number {
  const validIndex = Number.isFinite(index) ? index : 0;
  const validStep = Number.isFinite(step) ? step : 0;
  const validMax = Number.isFinite(max) ? max : 0;
  const delay = Math.min(validIndex * validStep, validMax);
  return Math.max(0, delay);
}

export interface RevealVariantState {
  opacity: number;
  y: number;
  transition?: {
    duration: number;
    ease: readonly [number, number, number, number];
    delay: number;
  };
}

export interface RevealVariants {
  hidden: RevealVariantState;
  visible: RevealVariantState;
  [key: string]: RevealVariantState;
}

export function revealVariants(reduced: boolean, delay = 0): RevealVariants {
  if (reduced) {
    return {
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0 },
    };
  }

  return {
    hidden: {
      opacity: 0,
      y: distance,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: durations.base,
        ease: easing,
        delay,
      },
    },
  };
}
