import { siteConfig } from "@/data/site";
import type { HeadingLine } from "@/components/ui/PageHeading";
import {
  Users,
  BookOpen,
  CodeXml,
  Rocket,
  Handshake,
  Lightbulb,
  Terminal,
  Cpu,
  Sparkles,
  Zap,
  GitBranch,
  BrainCircuit,
  ShieldCheck,
  Database,
  Award,
  type LucideIcon,
} from "lucide-react";

export interface AboutPillar {
  title: string;
  description: string;
  icon: LucideIcon;
  tags?: string[];
  highlight?: string;
}

export interface AboutQuote {
  text: string;
  attribution: string;
}

export interface AboutStat {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface CloudDomain {
  id: string;
  title: string;
  badge: string;
  icon: LucideIcon;
  summary: string;
  services: string[];
  keyOutcomes: string[];
}

export interface AboutMilestone {
  period: string;
  phase: string;
  title: string;
  description: string;
  metrics: string;
  badge: string;
}

export interface LeadershipPrinciple {
  number: string;
  title: string;
  slogan: string;
  description: string;
  icon: LucideIcon;
}

export interface AboutTestimonial {
  name: string;
  role: string;
  achievement: string;
  quote: string;
  tag: string;
}

export interface AboutFAQ {
  question: string;
  answer: string;
  category: string;
}

export const aboutHeading: HeadingLine[] = [
  { text: "MORE" },
  { text: "THAN A CLUB," },
  { text: "A CLOUD COMMUNITY.", accent: true },
];

export const aboutIntro: string = `${siteConfig.name} ${siteConfig.org} is a student-led community at ${siteConfig.university} (${siteConfig.org}) focused on cloud computing using Amazon Web Services (AWS). We aim to provide students with the resources, workshops, and hands-on experiences to learn, apply, and grow in cloud technologies.`;

export const aboutStats: AboutStat[] = [
  {
    value: "2,000+",
    label: "Students Impacted",
    description: "Across hackathons, bootcamps, and technical sessions at LPU",
    icon: Users,
  },
  {
    value: "25+",
    label: "Hands-on Workshops",
    description: "Practical AWS architecture, DevOps, and cloud labs",
    icon: Terminal,
  },
  {
    value: "50+",
    label: "Cloud Projects Built",
    description: "Production deployments, serverless apps, and open-source code",
    icon: Cpu,
  },
  {
    value: "100%",
    label: "Student-Led & Free",
    description: "Inclusive peer-to-peer mentorship accessible to every student",
    icon: Sparkles,
  },
];

export const aboutMission = {
  eyebrow: "OUR CORE MISSION",
  title: "Democratizing Cloud Engineering for Every Student",
  description:
    "We bridge the gap between classroom theory and real-world distributed systems. By providing students with hands-on AWS sandboxes, guided architectural reviews, and production deployment environments, we empower every learner to graduate as an industry-ready cloud builder.",
  highlights: [
    "Zero-barrier access to real AWS cloud resources and guided sandboxes",
    "Weekly hands-on labs moving from basic compute to microservices",
    "Direct peer mentorship from AWS-certified seniors and alumni",
    "Open-source culture where every project is deployed live",
  ],
};

export const aboutVision = {
  eyebrow: "OUR AMBITION",
  title: "The Premier University Cloud Hub in India",
  description:
    "We envision Lovely Professional University as a benchmark for student-driven cloud innovation. A space where students design resilient architectures, master modern DevOps workflows, pass industry certifications, and build solutions that power real enterprises.",
  highlights: [
    "Active cohorts preparing for AWS Cloud Practitioner and Solutions Architect exams",
    "Collaborative initiatives with AWS User Groups, Community Days, and industry partners",
    "Fostering cross-disciplinary builders across AI, Security, and Big Data",
    "An alumni network driving innovation at top tech companies worldwide",
  ],
};

export const builderCreed = [
  { step: "01", rule: "If you can run it locally, you can scale it globally on AWS." },
  { step: "02", rule: "Architecture is not an afterthought; it is our foundation." },
  { step: "03", rule: "Learn by deploying: fail in dev, test rigorously, excel in prod." },
  { step: "04", rule: "Never build in isolation — true builders grow together." },
];

export const aboutPillars: AboutPillar[] = [
  {
    title: "Community",
    description:
      "A collaborative space for learners, builders and cloud enthusiasts to share ideas, form project teams, and grow together.",
    icon: Users,
    tags: ["Peer Mentoring", "Study Circles", "Discord Huddles"],
    highlight: "Inclusive & Welcoming",
  },
  {
    title: "Learning",
    description:
      "Structured workshops, curated roadmaps, and expert sessions on AWS technologies from foundations to advanced architecture.",
    icon: BookOpen,
    tags: ["AWS Sandboxes", "Live Demos", "System Design"],
    highlight: "Zero-to-Cloud Path",
  },
  {
    title: "Practice",
    description:
      "Hands-on projects, cloud sandbox labs and real-world problem solving that replaces slides with code and architecture diagrams.",
    icon: CodeXml,
    tags: ["Serverless", "Terraform / CDK", "Docker & ECS"],
    highlight: "Hands-on First",
  },
  {
    title: "Growth",
    description:
      "Build your skills, prepare for recognized AWS certifications, polish your portfolio, and gain high-demand engineering exposure.",
    icon: Rocket,
    tags: ["Cert Preps", "Resume Reviews", "Mock Architecture"],
    highlight: "Career Acceleration",
  },
  {
    title: "Opportunities",
    description:
      "Direct exposure to hackathons, AWS Jam competitions, tech conferences, and networking with AWS Community Heroes.",
    icon: Handshake,
    tags: ["AWS Jam", "Cloud Day", "Industry Connect"],
    highlight: "Real Connections",
  },
  {
    title: "Impact",
    description:
      "Harnessing distributed cloud technology to solve real campus challenges and open-sourcing production tools for all.",
    icon: Lightbulb,
    tags: ["Open Source", "Campus Solutions", "Social Impact"],
    highlight: "Shipping for Good",
  },
];

export const cloudDomains: CloudDomain[] = [
  {
    id: "serverless",
    title: "Serverless & Microservices",
    badge: "Most Popular",
    icon: Zap,
    summary:
      "Crafting event-driven architectures that scale automatically from zero to millions of requests with zero server management overhead.",
    services: ["AWS Lambda", "Amazon API Gateway", "Amazon DynamoDB", "EventBridge", "Amazon SQS/SNS"],
    keyOutcomes: [
      "Stateless API design and asynchronous event pipelines",
      "Pay-per-use architectures and auto-scaling mechanisms",
      "Single-digit millisecond latency with DynamoDB",
    ],
  },
  {
    id: "devops",
    title: "DevOps & Cloud Infrastructure",
    badge: "Industry Core",
    icon: GitBranch,
    summary:
      "Automating infrastructure provisioning and reliable deployment pipelines using Infrastructure as Code and modern container tooling.",
    services: ["Terraform", "AWS CDK", "Amazon ECS / EKS", "Docker", "AWS CodePipeline", "CloudFormation"],
    keyOutcomes: [
      "Declarative Infrastructure as Code (IaC) in TypeScript & HCL",
      "Automated CI/CD pipelines with zero-downtime rollouts",
      "Container orchestration with Kubernetes and ECS Fargate",
    ],
  },
  {
    id: "cloud-ai",
    title: "Cloud AI & Generative Intelligence",
    badge: "Cutting Edge",
    icon: BrainCircuit,
    summary:
      "Leveraging state-of-the-art foundation models and managed ML services to build intelligent, context-aware student applications.",
    services: ["Amazon Bedrock", "Amazon SageMaker", "Amazon Rekognition", "LangChain / RAG", "OpenSearch"],
    keyOutcomes: [
      "Retrieval-Augmented Generation (RAG) on cloud documents",
      "Serverless LLM invocation and multi-agent workflows",
      "Model deployment, endpoint tuning, and latency optimization",
    ],
  },
  {
    id: "security",
    title: "Cloud Security, IAM & Architecture",
    badge: "Critical",
    icon: ShieldCheck,
    summary:
      "Embedding security at every tier using AWS Well-Architected Framework, least-privilege IAM policies, and private networking.",
    services: ["AWS IAM", "Amazon VPC", "AWS Secrets Manager", "AWS CloudWatch", "AWS Shield / WAF"],
    keyOutcomes: [
      "Zero-Trust security models and least-privilege policies",
      "VPC Peering, Subnets, and NAT Gateway routing topologies",
      "Continuous audit logging, metrics alarms, and observability",
    ],
  },
  {
    id: "data-analytics",
    title: "Data Engineering & Analytics",
    badge: "Big Data",
    icon: Database,
    summary:
      "Transforming raw telemetry and data streams into high-speed analytics using modern lakehouse architectures on AWS.",
    services: ["Amazon S3", "AWS Glue", "Amazon Athena", "Amazon Kinesis", "Amazon QuickSight"],
    keyOutcomes: [
      "Scalable object storage and modern data lake design",
      "Serverless SQL querying of petabyte-scale datasets",
      "Real-time event stream ingestion and dashboarding",
    ],
  },
];

export const aboutMilestones: AboutMilestone[] = [
  {
    period: "August 2023",
    phase: "Phase 01",
    title: "The Genesis & First Lines of Code",
    description:
      "A small team of AWS enthusiasts at LPU convened to start a dedicated cloud community. The first session on AWS Cloud Practitioner foundations drew 40+ enthusiastic students.",
    metrics: "40+ Attendees • Initial Core Team",
    badge: "Founding",
  },
  {
    period: "February 2024",
    phase: "Phase 02",
    title: "Official Affiliation & Cloud Day",
    description:
      "Recognized officially as an AWS student community chapter at LPU. Hosted the inaugural 'AWS Cloud Day LPU' featuring hands-on EC2 and S3 architecture challenges.",
    metrics: "500+ Active Members • 1st Cloud Day",
    badge: "Recognition",
  },
  {
    period: "October 2024 - 2025",
    phase: "Phase 03",
    title: "Hackathons, AWS Jam & Project Hatchery",
    description:
      "Scaled to regular hands-on project builds. Shipped student open-source software, held university-wide AWS Jam competitions, and launched certification study groups.",
    metrics: "1,200+ Participants • 20+ Shipped Projects",
    badge: "Expansion",
  },
  {
    period: "2026 & Beyond",
    phase: "Phase 04",
    title: "Scale, Enterprise AI & Global Ecosystem",
    description:
      "Expanding to over 2,000 active student builders, launching the AWS GenAI Bedrock incubator, and connecting student talent directly with cloud internship opportunities.",
    metrics: "2,000+ Students • Multi-Track Cohorts",
    badge: "Current Era",
  },
];

export const leadershipPrinciples: LeadershipPrinciple[] = [
  {
    number: "01",
    title: "Learn and Be Curious",
    slogan: "The cloud moves fast; so do we.",
    description:
      "Builders are never done learning. We stay relentlessly curious about new architectures, serverless innovations, and emerging cloud standards.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Bias for Action",
    slogan: "Speed matters in technology.",
    description:
      "We value calculated risk-taking and rapid prototyping. It's better to launch a minimal working architecture on AWS today than debate theoretical specs for a month.",
    icon: Rocket,
  },
  {
    number: "03",
    title: "Student & Peer Obsession",
    slogan: "Built by students, for students.",
    description:
      "We design every workshop, tutorial, and event around the actual needs of our peers. If it doesn't help someone gain real skills or land opportunities, we fix it.",
    icon: Users,
  },
  {
    number: "04",
    title: "Invent and Simplify",
    slogan: "Clarity over needless complexity.",
    description:
      "Great cloud architects take intricate distributed challenges and craft elegant, maintainable, cost-effective solutions that anyone on the team can understand.",
    icon: Lightbulb,
  },
  {
    number: "05",
    title: "Earn Trust & Share Knowledge",
    slogan: "Knowledge kept is knowledge wasted.",
    description:
      "The fastest way to master AWS is to teach it. Senior builders mentor beginners with patience, transparency, and collaborative peer code reviews.",
    icon: Handshake,
  },
  {
    number: "06",
    title: "Think Big & Ship to Prod",
    slogan: "Beyond local sandbox experiments.",
    description:
      "We don't settle for toy projects that live on localhost. We build resilient architectures that handle real traffic, scale gracefully, and solve genuine problems.",
    icon: Award,
  },
];

export const aboutTestimonials: AboutTestimonial[] = [
  {
    name: "Aarav Sharma",
    role: "B.Tech CSE '25",
    achievement: "AWS Certified Solutions Architect",
    quote:
      "Before AWS Builder Group, cloud felt intimidating with all the consoles and services. The hands-on labs and peer study sessions gave me the confidence to pass my Solutions Architect exam and land my dream cloud role.",
    tag: "Certification & Career",
  },
  {
    name: "Rhea Sen",
    role: "B.Tech IT '26",
    achievement: "Shipped Serverless Forge",
    quote:
      "Building real projects alongside seniors who review your CloudFormation templates is an unmatched experience. We deployed our app to real users with zero server downtime.",
    tag: "Open Source Project",
  },
  {
    name: "Karan Patel",
    role: "B.Tech CSE '26",
    achievement: "AWS Jam Top 5 Finalist",
    quote:
      "The AWS Jam organized by the club pushed us to debug live cloud architectures under real time pressure. That was 100x more valuable than reading any textbook.",
    tag: "Competition & Hackathon",
  },
];

export const aboutFaqs: AboutFAQ[] = [
  {
    question: "Do I need prior experience with AWS or coding to join?",
    answer:
      "Not at all! We welcome learners of all levels. We run introductory cohorts specifically designed for beginners with zero cloud experience, teaching the basics of compute, storage, and networking from scratch.",
    category: "Getting Started",
  },
  {
    question: "Is membership free for Lovely Professional University students?",
    answer:
      "Yes, 100% free! All our core community meetups, hands-on workshops, webinars, and open-source project squads are completely free for all LPU students.",
    category: "Membership",
  },
  {
    question: "How does the community help with AWS Certifications?",
    answer:
      "We organize structured study circles for the AWS Certified Cloud Practitioner and AWS Certified Solutions Architect - Associate exams. Members receive curated study paths, practice question breakdowns, and mentorship from seniors who have already cleared the exams.",
    category: "Certifications",
  },
  {
    question: "How can I build and contribute to club projects?",
    answer:
      "You can explore our active repositories on GitHub, join the discussion in our Discord channels, or participate in our semesterly Project Hatchery where we form squads to build and deploy live cloud solutions.",
    category: "Projects",
  },
  {
    question: "How can I become a Core Team member or Lead?",
    answer:
      "We host Core Team recruitment drives at the beginning of each academic semester. Active community contributors who consistently attend events, help peers, or build projects are prioritized for leadership roles.",
    category: "Leadership",
  },
  {
    question: "Where and when do meetups happen?",
    answer:
      "We conduct both in-person workshops on the LPU campus and interactive virtual hack sessions on Discord. Keep an eye on our Events page and Discord announcements for upcoming schedules!",
    category: "Events",
  },
];

export const aboutQuote: AboutQuote = {
  text: "We believe in empowering students to build a better tomorrow, on the cloud.",
  attribution: `${siteConfig.name} ${siteConfig.org}`,
};
