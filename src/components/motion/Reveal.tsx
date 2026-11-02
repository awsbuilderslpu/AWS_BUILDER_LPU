"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { revealVariants } from "@/lib/motion/tokens";

export interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
  className?: string;
  once?: boolean;
}

const motionElements = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  li: motion.li,
} as const;

export function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
  once = true,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = React.useMemo(
    () => revealVariants(Boolean(shouldReduceMotion), delay),
    [shouldReduceMotion, delay]
  );

  const MotionComponent = motionElements[as];

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      variants={variants as unknown as Variants}
      data-reveal=""
      className={cn(className)}
    >
      {children}
    </MotionComponent>
  );
}
