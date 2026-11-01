export interface PublicEventsCopy {
  empty: string;
  lifecycle: {
    upcoming: string;
    ongoing: string;
    completed: string;
  };
  locationLabels: {
    on_campus: string;
    online: string;
    hybrid: string;
  };
  schedule: string;
  location: string;
  venue: string;
  about: string;
  back: string;
  joinOnline: string;
  signInForLink: string;
  signUp?: {
    errors: {
      sign_in: string;
      not_member: string;
      not_found: string;
      failed: string;
    };
  };
}

export interface PublicBlogsCopy {
  empty: string;
  back: string;
  byline: (name: string) => string;
  readTime: (n: number) => string;
  tags: string;
}

export interface PublicCopy {
  events: PublicEventsCopy;
  blogs: PublicBlogsCopy;
}

export const publicCopy: PublicCopy = {
  events: {
    empty: "No events are scheduled yet. Check back soon.",
    lifecycle: {
      upcoming: "Upcoming",
      ongoing: "Happening now",
      completed: "Completed",
    },
    locationLabels: {
      on_campus: "On campus",
      online: "Online",
      hybrid: "Hybrid",
    },
    schedule: "Date and time",
    location: "Location",
    venue: "Venue",
    about: "About this event",
    back: "All events",
    joinOnline: "Join online",
    signInForLink: "Sign in to see the meeting link.",
    signUp: {
      errors: {
        sign_in: "Sign in to register.",
        not_member: "Only approved members can register for events.",
        not_found: "This event is no longer open for registration.",
        failed: "We couldn't complete that. Please try again.",
      },
    },
  },
  blogs: {
    empty: "No articles are published yet. Check back soon.",
    back: "All articles",
    byline: (name: string) => `By ${name}`,
    readTime: (n: number) => `${n} min read`,
    tags: "Tags",
  },
};

