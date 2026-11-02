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
  signUp: {
    button: string;
    buttonRegistered: string;
    buttonSignIn: string;
    registeredOk: string;
    alreadyRegistered: string;
    cancelledOk: string;
    notMember: string;
    ended: string;
    closed: string;
    full: string;
    registered: string;
    attended: string;
    meetingHint: string;
    fewSpots: (n: number) => string;
    spotsLeft: (n: number) => string;
    cancelConfirmTitle: string;
    cancelConfirmText: string;
    errors: {
      sign_in: string;
      not_member: string;
      closed: string;
      full: string;
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
      button: "Register",
      buttonRegistered: "Cancel registration",
      buttonSignIn: "Sign in to register",
      registeredOk: "You're registered for this event.",
      alreadyRegistered: "You're already registered.",
      cancelledOk: "Your registration was cancelled.",
      notMember: "Registration is open to approved club members.",
      ended: "This event has ended.",
      closed: "Registration for this event is closed.",
      full: "This event has reached full capacity.",
      registered: "You're registered.",
      attended: "You attended this event.",
      meetingHint: "The meeting link will be visible here once you're registered.",
      fewSpots: (n: number) => (n === 1 ? "Only 1 spot left" : `Only ${n} spots left`),
      spotsLeft: (n: number) => `${n} spots left`,
      cancelConfirmTitle: "Cancel registration?",
      cancelConfirmText:
        "You can register again before the deadline if spots are still available.",
      errors: {
        sign_in: "Sign in to register.",
        not_member: "Only approved members can register for events.",
        closed: "Registration for this event is closed.",
        full: "This event has reached full capacity.",
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

