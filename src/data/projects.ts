export type ProjectStatus = "Ongoing" | "Completed" | "Under Review" | "Archived";

export interface ProjectAuthor {
  name: string;
  avatar?: string;
  role?: string;
}

export interface ProjectStats {
  likes: number;
  views: string;
  rating: number;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  status: ProjectStatus;
  featured?: boolean;
  image: string;
  techStack: string[];
  awsServices: string[];
  author: ProjectAuthor;
  team?: ProjectAuthor[];
  startDate: string;
  endDate?: string;
  date: string;
  githubUrl?: string;
  demoUrl?: string;
  stats: ProjectStats;
}

export const projectsCopy = {
  eyebrow: "AWS STUDENT BUILDERS GROUP / LPU",
  titlePrefix: "OUR",
  titleHighlight: "PROJECTS",
  subtitle:
    "Explore production-grade cloud architectures, generative AI tools, and serverless applications built by our student developers at AWS Student Builders Group LPU. Designed for resilience, scalability, and real impact.",
  searchPlaceholder: "Search projects by title, member, technology...",
  allProjectsTab: "All Projects",
  featuredTab: "Featured",
  resetFilters: "Reset",
  statusFilterLabel: "All Status",
  categoryFilterLabel: "All Categories",
  techFilterLabel: "All Technologies",
  memberFilterLabel: "All Members",
  drawerTitle: "Project Details",
  drawerTabs: {
    overview: "Overview",
    techStack: "Tech Stack",
    team: "Team",
    media: "Media",
  },
  meta: {
    category: "Category",
    startDate: "Start Date",
    endDate: "End Date",
    status: "Status",
    description: "Description",
    technologiesUsed: "Technologies Used",
    links: "Links",
    githubRepo: "GitHub Repository",
    liveDemo: "Live Demo",
    likes: "Likes",
    views: "Views",
    rating: "Rating",
  },
  pagination: {
    showing: (from: number, to: number, total: number) =>
      `Showing ${from} to ${to} of ${total} projects`,
    perPage: (count: number) => `${count} / page`,
  },
  empty: {
    title: "No projects found",
    description: "Try adjusting your search query, status tabs, or dropdown filters.",
    reset: "Clear all filters",
  },
};

export const projectStatusTabs = [
  "All Projects",
  "Featured",
  "Ongoing",
  "Completed",
  "Under Review",
  "Archived",
] as const;

export type ProjectStatusTab = (typeof projectStatusTabs)[number];

export const projectCategories = [
  "All Categories",
  "Cloud & AI",
  "Security",
  "Cloud Architecture",
  "AI & ML",
  "IoT",
  "DevOps & CI/CD",
  "Serverless",
];

export const projectTechnologies = [
  "All Technologies",
  "Next.js",
  "React",
  "Node.js",
  "Python",
  "AWS",
  "Docker",
  "MongoDB",
  "Java",
  "Terraform",
  "Arduino",
  "FastAPI",
  "Mapbox",
  "Tailwind",
  "LLM",
  "NLP",
  "Firebase",
];

export const projectStatuses = [
  "All Status",
  "Ongoing",
  "Completed",
  "Under Review",
  "Archived",
];

export const projectMembers = [
  "All Members",
  "MD Arfaa Taj",
  "Sneha Patel",
  "Rohan Verma",
  "Ananya Singh",
  "Vivek Kumar",
  "Priya Nair",
  "Aditya Singh",
];

export const projects: Project[] = [
  {
    slug: "thefleetfly",
    title: "TheFleetFly",
    tagline: "Smart Fleet Management Platform with real-time tracking, analytics and AI insights.",
    description:
      "TheFleetFly is a smart fleet management platform that leverages AWS cloud services, real-time tracking, and AI-driven analytics to optimize fleet operations, reduce costs, and improve efficiency.",
    category: "Cloud & AI",
    status: "Ongoing",
    featured: true,
    image: "/images/projects/thefleetfly.jpg",
    techStack: ["Next.js", "React", "Node.js", "MongoDB", "AWS", "Mapbox", "Tailwind", "Docker"],
    awsServices: ["AWS IoT Core", "Amazon DynamoDB", "AWS Lambda", "Amazon ECS"],
    author: {
      name: "MD Arfaa Taj",
      role: "Lead Full-Stack Developer",
    },
    team: [
      { name: "MD Arfaa Taj", role: "Full-Stack & Cloud Architect" },
      { name: "Sneha Patel", role: "AI & Telemetry Engineer" },
      { name: "Rohan Verma", role: "DevOps & Deployment" },
    ],
    startDate: "01 Jun 2025",
    endDate: "—",
    date: "Aug 2025",
    githubUrl: "https://github.com/ArfaaTaj-savas",
    demoUrl: "https://thefleetfly.vercel.app",
    stats: {
      likes: 24,
      views: "1.2K",
      rating: 4.8,
    },
  },
  {
    slug: "vulnix",
    title: "Vulnix",
    tagline: "AI-powered code security reviewer to detect and explain vulnerabilities.",
    description:
      "Vulnix is an autonomous code security reviewer powered by LLMs and static analysis to detect vulnerabilities, explain exploit chains, and propose remediation patches before deployment.",
    category: "Security",
    status: "Ongoing",
    featured: true,
    image: "/images/projects/vulnix.jpg",
    techStack: ["Python", "FastAPI", "React", "LLM", "AWS", "Docker"],
    awsServices: ["Amazon Bedrock", "AWS Lambda", "Amazon S3", "Amazon CloudWatch"],
    author: {
      name: "Sneha Patel",
      role: "Security & AI Researcher",
    },
    team: [
      { name: "Sneha Patel", role: "Lead AI Security Engineer" },
      { name: "Ananya Singh", role: "Vulnerability Database Analyst" },
    ],
    startDate: "15 May 2025",
    endDate: "—",
    date: "Jul 2025",
    githubUrl: "https://github.com/awsbuilderslpu",
    demoUrl: "https://awslpu.in",
    stats: {
      likes: 37,
      views: "2.1K",
      rating: 4.9,
    },
  },
  {
    slug: "cloud-architecture-basics",
    title: "Cloud Architecture Basics",
    tagline: "A beginner-friendly guide and hands-on project for AWS cloud deployment.",
    description:
      "A modular hands-on curriculum and production blueprint for students learning AWS core services, infrastructure as code, and containerized microservices deployment with automated CI/CD.",
    category: "Cloud Architecture",
    status: "Completed",
    featured: false,
    image: "/images/projects/cloud-architecture-basics.jpg",
    techStack: ["AWS", "Terraform", "DevOps", "Docker", "Linux"],
    awsServices: ["Amazon EC2", "Amazon VPC", "AWS Auto Scaling", "Amazon S3"],
    author: {
      name: "Rohan Verma",
      role: "Cloud Infrastructure Lead",
    },
    team: [
      { name: "Rohan Verma", role: "Infrastructure Architect" },
      { name: "MD Arfaa Taj", role: "Curriculum Reviewer" },
    ],
    startDate: "10 Jan 2025",
    endDate: "15 Jun 2025",
    date: "Jun 2025",
    githubUrl: "https://github.com/awsbuilderslpu",
    demoUrl: "https://awslpu.in",
    stats: {
      likes: 18,
      views: "980",
      rating: 4.7,
    },
  },
  {
    slug: "steganography-tool",
    title: "Steganography Tool",
    tagline: "A Java-based tool to hide and extract secret messages in images.",
    description:
      "A cryptographic image processing tool implementing LSB steganography and AES-256 encryption to discreetly conceal payload data inside standard image formats without perceptible distortion.",
    category: "Security",
    status: "Ongoing",
    featured: false,
    image: "/images/projects/steganography-tool.jpg",
    techStack: ["Java", "Cryptography", "Image Processing"],
    awsServices: ["Amazon S3", "AWS Key Management Service (KMS)"],
    author: {
      name: "Ananya Singh",
      role: "Cybersecurity Analyst",
    },
    team: [{ name: "Ananya Singh", role: "Algorithm & UI Engineer" }],
    startDate: "01 Feb 2025",
    endDate: "—",
    date: "May 2025",
    githubUrl: "https://github.com/awsbuilderslpu",
    demoUrl: "https://awslpu.in",
    stats: {
      likes: 27,
      views: "1.6K",
      rating: 4.6,
    },
  },
  {
    slug: "ai-resume-analyzer",
    title: "AI Resume Analyzer",
    tagline: "Analyze resumes using AI and provide skill gap and improvement suggestions.",
    description:
      "Intelligent resume evaluator utilizing natural language processing and LLM embeddings to evaluate student profiles against current industry tech roles and suggest targeted skill enhancements.",
    category: "AI & ML",
    status: "Under Review",
    featured: false,
    image: "/images/projects/ai-resume-analyzer.jpg",
    techStack: ["Python", "NLP", "Streamlit", "LLM"],
    awsServices: ["Amazon Bedrock", "Amazon Textract", "AWS Lambda"],
    author: {
      name: "Vivek Kumar",
      role: "Machine Learning Engineer",
    },
    team: [
      { name: "Vivek Kumar", role: "NLP Pipeline Developer" },
      { name: "Sneha Patel", role: "Prompt Engineering Lead" },
    ],
    startDate: "20 Mar 2025",
    endDate: "—",
    date: "May 2025",
    githubUrl: "https://github.com/awsbuilderslpu",
    demoUrl: "https://awslpu.in",
    stats: {
      likes: 31,
      views: "1.9K",
      rating: 4.5,
    },
  },
  {
    slug: "smart-campus-iot",
    title: "Smart Campus IoT",
    tagline: "IoT-based solution for smart classroom and resource management at LPU.",
    description:
      "IoT sensor hub and real-time dashboard for monitoring environmental telemetry, classroom occupancy, and energy conservation across university auditoriums and computational laboratories.",
    category: "IoT",
    status: "Completed",
    featured: false,
    image: "/images/projects/smart-campus-iot.jpg",
    techStack: ["Arduino", "IoT", "React", "Firebase"],
    awsServices: ["AWS IoT Greengrass", "Amazon Timestream", "Amazon QuickSight"],
    author: {
      name: "Priya Nair",
      role: "Embedded Systems Specialist",
    },
    team: [
      { name: "Priya Nair", role: "Hardware & Firmware Lead" },
      { name: "Rohan Verma", role: "Cloud Bridge Integration" },
    ],
    startDate: "12 Nov 2024",
    endDate: "20 Apr 2025",
    date: "Apr 2025",
    githubUrl: "https://github.com/awsbuilderslpu",
    demoUrl: "https://awslpu.in",
    stats: {
      likes: 14,
      views: "870",
      rating: 4.8,
    },
  },
  {
    slug: "cloudpulse-attendance",
    title: "CloudPulse",
    tagline: "Serverless QR Event Check-in & Real-Time Analytics system.",
    description:
      "High-concurrency event check-in system engineered for campus tech symposiums. Handles concurrent QR ticket validation with sub-100ms DynamoDB single-digit latency and live CloudWatch telemetry.",
    category: "Serverless",
    status: "Completed",
    featured: false,
    image: "/images/projects/cloudpulse-attendance.jpg",
    techStack: ["Next.js", "TypeScript", "Tailwind", "AWS CDK"],
    awsServices: ["AWS Lambda", "Amazon DynamoDB", "Amazon API Gateway", "Amazon S3"],
    author: {
      name: "MD Arfaa Taj",
      role: "Lead Full-Stack Developer",
    },
    team: [
      { name: "MD Arfaa Taj", role: "Full-Stack Lead" },
      { name: "Rohan Verma", role: "Backend Architect" },
    ],
    startDate: "15 Oct 2024",
    endDate: "15 Jan 2025",
    date: "Jan 2025",
    githubUrl: "https://github.com/awsbuilderslpu",
    demoUrl: "https://awslpu.in",
    stats: {
      likes: 48,
      views: "3.2K",
      rating: 4.9,
    },
  },
  {
    slug: "autoscaler-x",
    title: "AutoScalerX",
    tagline: "Spot Fleet Cost Optimization Engine for development clusters.",
    description:
      "Autonomous infrastructure controller monitoring spot termination notices to gracefully drain workloads, checkpoint state, and spin up replacement capacity, trimming dev compute bills by 68%.",
    category: "DevOps & CI/CD",
    status: "Ongoing",
    featured: false,
    image: "/images/projects/autoscaler-x.jpg",
    techStack: ["Python", "Docker", "Terraform", "AWS"],
    awsServices: ["Amazon EC2 Spot", "AWS Auto Scaling", "Amazon CloudWatch", "Amazon SNS"],
    author: {
      name: "Rohan Verma",
      role: "DevOps Engineer",
    },
    team: [{ name: "Rohan Verma", role: "Systems Architect" }],
    startDate: "01 Sep 2024",
    endDate: "—",
    date: "Dec 2024",
    githubUrl: "https://github.com/awsbuilderslpu",
    demoUrl: "https://awslpu.in",
    stats: {
      likes: 52,
      views: "2.4K",
      rating: 4.8,
    },
  },
  {
    slug: "kubeforge-eks",
    title: "KubeForge",
    tagline: "Multi-Tenant GitOps on Amazon EKS for student development teams.",
    description:
      "Declarative Kubernetes cluster scaffolding with ArgoCD, AWS Load Balancer Controller, and external-secrets integration for automated student team microservice deployments.",
    category: "Cloud Architecture",
    status: "Completed",
    featured: false,
    image: "/images/projects/kubeforge-eks.jpg",
    techStack: ["Docker", "Terraform", "React", "AWS"],
    awsServices: ["Amazon EKS", "Amazon ECR", "AWS IAM Roles for Service Accounts (IRSA)"],
    author: {
      name: "Aditya Singh",
      role: "Cloud Platform Engineer",
    },
    team: [{ name: "Aditya Singh", role: "Kubernetes Admin" }],
    startDate: "15 Aug 2024",
    endDate: "30 Nov 2024",
    date: "Nov 2024",
    githubUrl: "https://github.com/awsbuilderslpu",
    demoUrl: "https://awslpu.in",
    stats: {
      likes: 39,
      views: "1.8K",
      rating: 4.7,
    },
  },
  {
    slug: "docuextract-ocr",
    title: "DocuExtract OCR",
    tagline: "Serverless Intelligent Document Processing pipeline with AWS Textract.",
    description:
      "Event-driven optical character recognition pipeline extracting key-value pairs, tables, and handwritten annotations from student scholarship and identity documents.",
    category: "AI & ML",
    status: "Archived",
    featured: false,
    image: "/images/projects/docuextract-ocr.jpg",
    techStack: ["Python", "FastAPI", "React", "AWS"],
    awsServices: ["Amazon Textract", "Amazon S3", "AWS Step Functions"],
    author: {
      name: "Vivek Kumar",
      role: "AI Developer",
    },
    team: [{ name: "Vivek Kumar", role: "OCR Pipeline Engineer" }],
    startDate: "01 Jul 2024",
    endDate: "01 Oct 2024",
    date: "Oct 2024",
    githubUrl: "https://github.com/awsbuilderslpu",
    demoUrl: "https://awslpu.in",
    stats: {
      likes: 22,
      views: "1.3K",
      rating: 4.4,
    },
  },
  {
    slug: "secureguard-iam",
    title: "SecureGuard IAM",
    tagline: "Autonomous Least-Privilege IAM Policy Analyzer & Auditor.",
    description:
      "Security scanning daemon inspecting AWS CloudTrail audit logs and Access Advisor data to synthesize minimal IAM policies and eliminate over-privileged service roles.",
    category: "Security",
    status: "Under Review",
    featured: false,
    image: "/images/projects/secureguard-iam.jpg",
    techStack: ["Python", "React", "Tailwind", "AWS"],
    awsServices: ["AWS IAM Access Analyzer", "AWS CloudTrail", "AWS Lambda"],
    author: {
      name: "Ananya Singh",
      role: "Security Researcher",
    },
    team: [{ name: "Ananya Singh", role: "IAM Policy Engineer" }],
    startDate: "10 Jun 2024",
    endDate: "—",
    date: "Sep 2024",
    githubUrl: "https://github.com/awsbuilderslpu",
    demoUrl: "https://awslpu.in",
    stats: {
      likes: 44,
      views: "2.0K",
      rating: 4.6,
    },
  },
  {
    slug: "ecostream-iot",
    title: "EcoStream",
    tagline: "Campus Environmental Monitoring & Smart Water Telemetry.",
    description:
      "Low-power sensor mesh transmitting water consumption and atmospheric quality data across student residences to a central analytics dashboard.",
    category: "IoT",
    status: "Archived",
    featured: false,
    image: "/images/projects/ecostream-iot.jpg",
    techStack: ["Arduino", "IoT", "Node.js", "AWS"],
    awsServices: ["AWS IoT Core", "Amazon DynamoDB", "Amazon CloudWatch"],
    author: {
      name: "Priya Nair",
      role: "Hardware Engineer",
    },
    team: [{ name: "Priya Nair", role: "Sensors & Telemetry" }],
    startDate: "15 Apr 2024",
    endDate: "15 Aug 2024",
    date: "Aug 2024",
    githubUrl: "https://github.com/awsbuilderslpu",
    demoUrl: "https://awslpu.in",
    stats: {
      likes: 29,
      views: "1.1K",
      rating: 4.4,
    },
  },
];
