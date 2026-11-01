import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicEvent, getMeetingLinkForSignedInUser } from "@/lib/public/events.server";
import { getCurrentAccount } from "@/lib/auth/server";
import { eventLifecycle } from "@/lib/events/lifecycle";
import { publicObjectUrl } from "@/lib/storage/urls";
import { docToPlainText } from "@/lib/richtext";
import { EventDetail } from "@/components/features/public/EventDetail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEvent(slug);

  if (!event) {
    return {
      title: "Event not found",
    };
  }

  const description = docToPlainText(event.description, 160);

  return {
    title: event.title,
    ...(description ? { description } : {}),
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);

  if (!event) {
    notFound();
  }

  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const lifecycle = eventLifecycle(
    {
      startsAt: event.starts_at,
      endsAt: event.ends_at,
      archivedAt: null,
    },
    nowMs
  );

  const account = await getCurrentAccount();
  const signedIn = account !== null;

  let meetingUrl: string | null = null;
  if (event.location_mode === "online" || event.location_mode === "hybrid") {
    meetingUrl = await getMeetingLinkForSignedInUser(slug);
  }

  const bannerUrl = event.banner_path
    ? publicObjectUrl("event-banners", event.banner_path)
    : null;

  return (
    <EventDetail
      event={event}
      lifecycle={lifecycle}
      signedIn={signedIn}
      meetingUrl={meetingUrl}
      bannerUrl={bannerUrl}
    />
  );
}
