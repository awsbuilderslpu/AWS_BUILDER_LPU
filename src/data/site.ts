export interface SiteConfig {
  name: string;
  shortName: string;
  org: string;
  university: string;
  email: string;
  website: string;
  address: string;
  joinUrl: string;
  signInUrl: string;
  description: string;
  tagline: string;
  timezone: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLinkItem[];
}

export interface SocialLink {
  name: string;
  href: string;
  icon: string;
}

export const siteConfig: SiteConfig = {
  name: "AWS Student Builders Group",
  shortName: "AWS Builder Group",
  org: "LPU",
  university: "Lovely Professional University",
  email: "awsbuilders.lpu@gmail.com",
  website: "awslpu.in",
  address: "Lovely Professional University, Phagwara, Punjab, India",
  joinUrl: "?auth=register",
  signInUrl: "?auth=signin",
  description:
    "Official student-led community for AWS Student Builder Group LPU. Building, learning, and scaling cloud-native systems.",
  tagline: "A stronger cloud community together.",
  // The club's time zone; all event and publish times are entered and shown in it.
  timezone: "Asia/Kolkata",
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Blogs", href: "/blogs" },
  { label: "Projects", href: "/projects" },
  { label: "Members", href: "/members" },
  { label: "Contact", href: "/contact" },
];

export const footerLinks: FooterLinkGroup[] = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Events", href: "/events" },
      { label: "Blogs", href: "/blogs" },
      { label: "Projects", href: "/projects" },
      { label: "Members", href: "/members" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "AWS Learning Hub", href: "#" },
      { label: "Student Resources", href: "#" },
      { label: "Workshops & Materials", href: "#" },
      { label: "Project Showcase", href: "/projects" },
      { label: "Cloud Guides", href: "#" },
      { label: "Career Opportunities", href: "#" },
      { label: "Join the Club", href: "?auth=register" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Code of Conduct", href: "#" },
      { label: "Community Guidelines", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Become a Member", href: "#" },
      { label: "Volunteer", href: "#" },
      { label: "Alumni", href: "#" },
      { label: "Partner with Us", href: "#" },
    ],
  },
];

export const legalLinks: FooterLinkItem[] = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use", href: "#" },
  { label: "Code of Conduct", href: "#" },
  { label: "Contact", href: "/contact" },
];

export const socialLinks: SocialLink[] = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/awsbuilderslpu",
    icon: "linkedin",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/awsbuilders.lpu/",
    icon: "instagram",
  },
  {
    name: "Discord",
    href: "https://discord.com/channels/1093195608409510009/1204396903605993472",
    icon: "discord",
  },
  {
    name: "GitHub",
    href: "https://github.com/awsbuilderslpu",
    icon: "github",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@AWSCloudCommunityLPU",
    icon: "youtube",
  },
];
