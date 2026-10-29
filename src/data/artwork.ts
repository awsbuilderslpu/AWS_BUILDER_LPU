import rawReadyList from "./artwork-ready.json";

// Cast to string[] because an empty JSON array [] is inferred as never[] in TypeScript
const readyList = rawReadyList as string[];

export type ArtworkKey =
  | "homeCloudServers"
  | "homeCube"
  | "homeGlobe"
  | "ctaCloudServers"
  | "aboutScene"
  | "aboutGlobe"
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
    file: "Futuristic AWS Cloud Infrastructure Network.png",
    imageClass: "object-contain object-center drop-shadow-[0_0_35px_rgba(255,153,0,0.35)]",
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
    file: "Futuristic AWS Cloud Infrastructure Network.png",
    imageClass: "object-contain object-center lg:object-right drop-shadow-[0_0_35px_rgba(255,153,0,0.35)]",
  },
  aboutScene: {
    label: "About: AWS cube + cloud",
    file: "Neon AWS Cloud Network Isometric Illustration.png",
    imageClass: "object-contain object-right",
  },
  aboutGlobe: {
    label: "About: orbital network overlay",
    file: "Neon Orbital Network Overlay.png",
    imageClass: "object-contain object-left",
  },
  eventsCubes: {
    label: "Events: cloud + cubes",
    file: "events-cubes.webp",
    imageClass: "object-contain",
  },
  eventsGlobe: {
    label: "Events: cubes + globe",
    file: "Neon Orbital Network Overlay.png",
    imageClass: "object-contain object-left",
  },
  blogsLaptop: {
    label: "Blogs: laptop + servers + cloud",
    file: "Neon AWS Cloud Computing Network.png",
    imageClass: "object-contain",
  },
  blogsGlobe: {
    label: "Blogs: cube + globe",
    file: "Neon Orbital Network Overlay.png",
    imageClass: "object-contain object-left",
  },
  membersScene: {
    label: "Members: AWS cloud + builders",
    file: "Neon Cloud Network Team.png",
    imageClass: "object-contain drop-shadow-[0_0_35px_rgba(255,153,0,0.35)]",
  },
  membersGlobe: {
    label: "Members: globe",
    file: "Neon Orbital Network Overlay.png",
    imageClass: "object-contain object-left",
  },
  contactScene: {
    label: "Contact: cloud + mail",
    file: "Neon Cyber Contact Network.png",
    imageClass: "object-contain drop-shadow-[0_0_35px_rgba(255,153,0,0.35)]",
  },
  contactGlobe: {
    label: "Contact: globe",
    file: "Neon Orbital Network Overlay.png",
    imageClass: "object-contain object-left",
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
