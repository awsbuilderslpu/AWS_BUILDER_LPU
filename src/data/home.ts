import { siteConfig } from "@/data/site";
import type { HeadingLine } from "@/components/ui/PageHeading";

export interface HeroCta {
  label: string;
  href: string;
  variant: "primary" | "outline";
  withArrow: boolean;
}

export const heroHeading: HeadingLine[] = [
  { text: "BUILD" },
  { text: "YOUR FUTURE", accent: true },
  { text: "ON CLOUD", dot: true },
];

export const heroCtas: HeroCta[] = [
  {
    label: "Explore Events",
    href: "/events",
    variant: "primary",
    withArrow: true,
  },
  {
    label: "Join the Club",
    href: siteConfig.joinUrl,
    variant: "outline",
    withArrow: false,
  },
];

export const decorLabels = {
  learnBuild: ["Learn", "Build", "Share", "Grow", "Together"],
  studentsTech: ["Students", "Technology", "Community", "Impact"],
  awsCloud: ["AWS", "Cloud", "Community", "LPU"],
  cloudInfra: ["Cloud", "Infrastructure", "For a brighter", "Tomorrow"],
  ideasDeploy: ["Ideas", "Deploy", "Scale", "Repeat"],
  strongerCloud: ["A", "Stronger", "Cloud", "Community", "Together"],
};
