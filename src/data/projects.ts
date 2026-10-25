import type { HeadingLine } from "@/components/ui/PageHeading";
import { siteConfig } from "@/data/site";

export type ProjectCategory =
  | "All"
  | "Serverless"
  | "AI & ML"
  | "Cloud Infrastructure"
  | "DevOps & CI/CD";

export type ProjectStatus = "Live" | "In Development" | "Open Source";

export interface Project {
  slug: string;
  title: string;
  description: string;
  category: "Serverless" | "AI & ML" | "Cloud Infrastructure" | "DevOps & CI/CD";
  image?: string;
  awsServices: string[];
  techStack: string[];
  status: ProjectStatus;
  stars?: number;
  githubUrl?: string;
  demoUrl?: string;
  featured?: boolean;
  contributors: string[];
  date: string;
}

export const projectsHeading: HeadingLine[] = [
  { text: "INNOVATIONS" },
  { text: "BUILT ON CLOUD.", accent: true },
];

export const projectsIntro = `Explore production-grade cloud architectures, generative AI tools, and serverless applications built by student developers at ${siteConfig.name} ${siteConfig.org}. Designed for resilience, scalability, and real impact.`;

export const projectCategories: ProjectCategory[] = [
  "All",
  "Serverless",
  "AI & ML",
  "Cloud Infrastructure",
  "DevOps & CI/CD",
];

export const projects: Project[] = [
  {
    slug: "cloudpulse-attendance",
    title: "CloudPulse — QR Event Check-in & Real-Time Analytics",
    description:
      "Serverless event check-in system engineered for campus tech symposiums. Handles concurrent QR ticket validation with sub-100ms DynamoDB single-digit latency and live CloudWatch telemetry.",
    category: "Serverless",
    image: "/images/projects/cloudpulse-attendance.jpg",
    awsServices: ["AWS Lambda", "Amazon DynamoDB", "Amazon API Gateway", "Amazon S3"],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "AWS CDK"],
    status: "Live",
    stars: 48,
    githubUrl: "https://github.com/awsbuilderslpu",
    demoUrl: "https://awslpu.in",
    featured: true,
    contributors: ["Shashank", "MD ARFAA", "Rohan Verma"],
    date: "2025-11-15",
  },
  {
    slug: "lpu-nimbusbot-bedrock",
    title: "NimbusBot — University Cloud Knowledge Assistant",
    description:
      "Enterprise Retrieval-Augmented Generation (RAG) assistant running on Amazon Bedrock (Claude 3.5 Sonnet) and OpenSearch Serverless. Answers student queries across syllabi, labs, and cloud club guides.",
    category: "AI & ML",
    image: "/images/projects/nimbusbot-bedrock.jpg",
    awsServices: ["Amazon Bedrock", "OpenSearch Serverless", "AWS Lambda", "Amazon S3"],
    techStack: ["Python", "LangChain", "FastAPI", "React"],
    status: "Live",
    stars: 76,
    githubUrl: "https://github.com/awsbuilderslpu",
    featured: true,
    contributors: ["MD ARFAA", "Sneha Sharma"],
    date: "2025-10-30",
  },
  {
    slug: "autoscaler-x-spot-instances",
    title: "AutoScalerX — Spot Fleet Cost Optimization Engine",
    description:
      "Autonomous infrastructure controller monitoring spot termination notices to gracefully drain workloads, checkpoint state, and spin up replacement capacity, trimming dev compute bills by 68%.",
    category: "DevOps & CI/CD",
    image: "/images/projects/autoscaler-x.jpg",
    awsServices: ["Amazon EC2 Spot", "AWS Auto Scaling", "Amazon CloudWatch", "Amazon SNS"],
    techStack: ["Go", "Docker", "Terraform", "Prometheus"],
    status: "Open Source",
    stars: 52,
    githubUrl: "https://github.com/awsbuilderslpu",
    featured: true,
    contributors: ["Rohan Verma", "Aditya Singh"],
    date: "2025-09-20",
  },
  {
    slug: "kubeforge-gitops-pipeline",
    title: "KubeForge — Multi-Tenant GitOps on Amazon EKS",
    description:
      "Declarative Kubernetes cluster scaffolding with ArgoCD, AWS Load Balancer Controller, and external-secrets integration for automated student team microservice deployments.",
    category: "Cloud Infrastructure",
    image: "/images/projects/kubeforge-eks.jpg",
    awsServices: ["Amazon EKS", "AWS IAM Roles for Service Accounts (IRSA)", "Amazon ECR", "AWS Secrets Manager"],
    techStack: ["Kubernetes", "Helm", "ArgoCD", "Terraform"],
    status: "Live",
    stars: 61,
    githubUrl: "https://github.com/awsbuilderslpu",
    contributors: ["Vikram Rao", "Sneha Sharma"],
    date: "2025-08-14",
  },
  {
    slug: "serverless-forge-cli",
    title: "ServerlessForge — Zero-Config Static Cloud Publisher",
    description:
      "Developer-friendly CLI tool that provisions dedicated S3 static hosting, CloudFront CDN edge distribution, and automated Route 53 DNS with free ACM SSL certificates in under two minutes.",
    category: "Serverless",
    image: "/images/projects/serverless-forge.jpg",
    awsServices: ["Amazon S3", "Amazon CloudFront", "Amazon Route 53", "AWS Certificate Manager"],
    techStack: ["Node.js", "TypeScript", "AWS SDK v3"],
    status: "Open Source",
    stars: 39,
    githubUrl: "https://github.com/awsbuilderslpu",
    contributors: ["Karan Mehta", "MD ARFAA"],
    date: "2025-07-28",
  },
  {
    slug: "iot-campus-telemetry",
    title: "EcoStream — IoT Environmental Telemetry & Alerts",
    description:
      "High-throughput time-series telemetry pipeline ingesting air quality, temperature, and noise sensors across campus labs with real-time alerting via Amazon EventBridge and SNS.",
    category: "Cloud Infrastructure",
    image: "/images/projects/ecostream-iot.jpg",
    awsServices: ["AWS IoT Core", "Amazon Kinesis", "Amazon Timestream", "Amazon SNS"],
    techStack: ["Python", "MQTT", "Grafana", "ESP32"],
    status: "In Development",
    stars: 25,
    githubUrl: "https://github.com/awsbuilderslpu",
    contributors: ["Ananya Patel", "Priya Nair"],
    date: "2025-06-19",
  },
  {
    slug: "docuextract-ocr-pipeline",
    title: "DocuExtract — Automated Document Parsing & Verification",
    description:
      "Serverless intelligent document processing pipeline utilizing Amazon Textract and AWS Step Functions to validate student event certificates and transcript submissions.",
    category: "AI & ML",
    image: "/images/projects/docuextract-ocr.jpg",
    awsServices: ["Amazon Textract", "AWS Step Functions", "Amazon S3", "AWS Lambda"],
    techStack: ["Python", "Boto3", "Next.js"],
    status: "Live",
    stars: 44,
    githubUrl: "https://github.com/awsbuilderslpu",
    demoUrl: "https://awslpu.in",
    contributors: ["Shashank", "Rohan Verma"],
    date: "2025-05-10",
  },
  {
    slug: "secureguard-iam-auditor",
    title: "SecureGuard — Cloud IAM Least-Privilege Scanner",
    description:
      "Lightweight compliance audit bot scanning AWS student accounts for wildcard administrative permissions, inactive API keys, and unencrypted S3 buckets, alerting via Discord webhooks.",
    category: "DevOps & CI/CD",
    image: "/images/projects/secureguard-iam.jpg",
    awsServices: ["AWS IAM", "AWS Config", "AWS CloudTrail", "AWS Lambda"],
    techStack: ["Python", "Discord API", "Boto3"],
    status: "Open Source",
    stars: 58,
    githubUrl: "https://github.com/awsbuilderslpu",
    contributors: ["MD ARFAA", "Vikram Rao"],
    date: "2025-04-02",
  },
];
