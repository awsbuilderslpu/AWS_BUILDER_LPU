import rawReadyList from "./artwork-ready.json";

// Cast to string[] because an empty JSON array [] is inferred as never[] in TypeScript
const readyList = rawReadyList as string[];

export type ArtworkKey =
  | "homeCloudServers"
  | "homeCube"
  | "homeGlobe"
  | "ctaCloudServers"
  | "aboutScene"
  | "eventsCubes"
  | "eventsGlobe"
  | "blogsLaptop"
  | "blogsGlobe"
  | "membersScene"
  | "membersGlobe"
  | "contactScene"
  | "contactGlobe"
  | "authGlobe"
  | "authCampus"
  | "adminSidebarCloud"
  | "adminProfileCover";

export interface ArtworkInfo {
  label: string;
  file: string;
  imageClass: string;
}

// Only the Home and CTA keys are wired in 13a; the rest are wired in 13b and 13c.
export const artworkManifest: Record<ArtworkKey, ArtworkInfo> = {
  homeCloudServers: {
    label: "Home: cloud + servers",
    file: "cloud-servers.webp",
    imageClass: "object-contain object-center xl:object-right",
  },
  homeCube: {
    label: "Home: AWS cube",
    file: "aws-cube.webp",
    imageClass: "object-contain object-left",
  },
  homeGlobe: {
    label: "Home: globe",
    file: "globe-wide.webp",
    imageClass: "object-contain object-left-bottom",
  },
  ctaCloudServers: {
    label: "CTA cloud + servers",
    file: "cloud-servers.webp",
    imageClass: "object-contain object-center lg:object-right",
  },
  aboutScene: {
    label: "About: AWS cube + cloud",
    file: "about-scene.webp",
    imageClass: "object-contain object-right",
  },
  eventsCubes: {
    label: "Events: cloud + cubes",
    file: "events-cubes.webp",
    imageClass: "object-contain",
  },
  eventsGlobe: {
    label: "Events: cubes + globe",
    file: "globe-tall.webp",
    imageClass: "object-cover object-left-bottom",
  },
  blogsLaptop: {
    label: "Blogs: laptop + servers + cloud",
    file: "blogs-laptop.webp",
    imageClass: "object-contain",
  },
  blogsGlobe: {
    label: "Blogs: cube + globe",
    file: "globe-tall.webp",
    imageClass: "object-cover object-left-bottom",
  },
  membersScene: {
    label: "Members: AWS cloud + builders",
    file: "members-builders.webp",
    imageClass: "object-contain",
  },
  membersGlobe: {
    label: "Members: globe",
    file: "globe-tall.webp",
    imageClass: "object-cover object-left-bottom",
  },
  contactScene: {
    label: "Contact: cloud + mail",
    file: "contact-scene.webp",
    imageClass: "object-contain",
  },
  contactGlobe: {
    label: "Contact: globe",
    file: "globe-tall.webp",
    imageClass: "object-cover object-left-bottom",
  },
  authGlobe: {
    label: "Auth: globe + floating clouds",
    file: "globe-tall.webp",
    imageClass: "object-cover object-left-bottom rotate-180",
  },
  authCampus: {
    label: "Auth: campus at night",
    file: "campus-night.webp",
    imageClass: "object-cover object-bottom",
  },
  adminSidebarCloud: {
    label: "Admin: sidebar cloud",
    file: "admin-sidebar-cloud.webp",
    imageClass: "object-contain object-center",
  },
  adminProfileCover: {
    label: "Profile: cover banner",
    file: "profile-cover.webp",
    imageClass: "object-cover object-center",
  },
};

export function getArtworkSrc(key: ArtworkKey): string | undefined {
  const item = artworkManifest[key];
  if (!item) {
    return undefined;
  }
  if (readyList.includes(item.file)) {
    return `/images/artwork/${item.file}`;
  }
  return undefined;
}
