"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/features/admin/kit/ConfirmDialog";
import { publicCopy } from "@/data/public";
import { cn } from "@/lib/utils";
import {
  publicRegistrationState,
  type PublicRegistrationState,
} from "@/lib/event-registrations/state";
import { spotsState } from "@/lib/event-registrations/spots";
import {
  registerForEventAction,
  cancelEventRegistrationAction,
} from "@/lib/event-registrations/actions";
import type { MyStatus } from "@/lib/event-registrations/types";
import type { ViewerKind } from "@/lib/event-registrations/viewer";

export interface EventRegistrationPanelProps {
  eventId: string;
  slug: string;
  viewer: ViewerKind;
  myStatus: MyStatus;
  spotsLeft: number | null;
  registrationOpen: boolean;
  hasEnded: boolean;
  isFull: boolean;
  className?: string;
}

export function EventRegistrationPanel({
  eventId,
  slug,
  viewer,
  myStatus,
  spotsLeft,
  registrationOpen,
  hasEnded,
  isFull,
  className,
}: EventRegistrationPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [confirmCancelOpen, setConfirmCancelOpen] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "status" | "error";
    text: string;
  } | null>(null);

  const state: PublicRegistrationState = publicRegistrationState({
    viewer,
    myStatus,
    isPublished: true,
    isArchived: false,
    registrationOpen,
    isFull,
    hasEnded,
  });

  const renderSpots = () => {
    const s = spotsState(spotsLeft);
    if (s === "unlimited" || spotsLeft === null) {
      return null;
    }
    if (s === "full") {
      return (
        <p className="text-xs text-muted-foreground">
          {publicCopy.events.signUp.full}
        </p>
      );
    }
    if (s === "few") {
      return (
        <p className="text-xs font-medium text-primary">
          {publicCopy.events.signUp.fewSpots(spotsLeft)}
        </p>
      );
    }
    return (
      <p className="text-xs text-muted-foreground">
        {publicCopy.events.signUp.spotsLeft(spotsLeft)}
      </p>
    );
  };

  const handleRegister = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await registerForEventAction(eventId);
      if (res.ok) {
        if (res.outcome === "already_registered") {
          setFeedback({
            type: "status",
            text: publicCopy.events.signUp.alreadyRegistered,
          });
        } else {
          setFeedback({
            type: "status",
            text: publicCopy.events.signUp.registeredOk,
          });
        }
        router.refresh();
      } else {
        if (res.outcome === "closed" || res.error === "closed") {
          setFeedback({
            type: "error",
            text: publicCopy.events.signUp.closed,
          });
        } else if (res.outcome === "full" || res.error === "full") {
          setFeedback({
            type: "error",
            text: publicCopy.events.signUp.full,
          });
        } else {
          const errKey = res.error as keyof typeof publicCopy.events.signUp.errors;
          const msg =
            publicCopy.events.signUp.errors[errKey] ??
            publicCopy.events.signUp.errors.failed;
          setFeedback({
            type: "error",
            text: msg,
          });
        }
      }
    });
  };

  const handleCancelConfirm = async () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await cancelEventRegistrationAction(eventId);
      if (res.ok) {
        setFeedback({
          type: "status",
          text: publicCopy.events.signUp.cancelledOk,
        });
        router.refresh();
      } else {
        const errKey = res.error as keyof typeof publicCopy.events.signUp.errors;
        const msg =
          publicCopy.events.signUp.errors[errKey] ??
          publicCopy.events.signUp.errors.failed;
        setFeedback({
          type: "error",
          text: msg,
        });
      }
    });
  };

  return (
    <div className={cn("p-5 space-y-3", className)}>
      {/* State-specific UI */}
      {state === "sign-in" && (
        <div className="space-y-2">
          <Button asChild className="w-full" size="default">
            <Link
              href={
                "/?auth=signin&next=" +
                encodeURIComponent("/events/" + slug)
              }
              scroll={false}
            >
              {publicCopy.events.signUp.buttonSignIn}
            </Link>
          </Button>
        </div>
      )}

      {state === "not-member" && (
        <p className="text-sm text-muted-foreground">
          {publicCopy.events.signUp.notMember}
        </p>
      )}

      {state === "ended" && (
        <p className="text-sm text-muted-foreground">
          {publicCopy.events.signUp.ended}
        </p>
      )}

      {state === "registered" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {publicCopy.events.signUp.registered}
            </p>
            {renderSpots()}
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isPending}
            aria-busy={isPending}
            onClick={() => setConfirmCancelOpen(true)}
          >
            {isPending && (
              <LoaderCircle
                className="size-4 animate-spin shrink-0 mr-2"
                aria-hidden="true"
              />
            )}
            {publicCopy.events.signUp.buttonRegistered}
          </Button>
          <ConfirmDialog
            open={confirmCancelOpen}
            onOpenChange={setConfirmCancelOpen}
            title={publicCopy.events.signUp.cancelConfirmTitle}
            description={publicCopy.events.signUp.cancelConfirmText}
            confirmLabel={publicCopy.events.signUp.buttonRegistered}
            tone="default"
            pending={isPending}
            onConfirm={handleCancelConfirm}
          />
        </div>
      )}

      {state === "attended" && (
        <p className="text-sm font-medium text-foreground">
          {publicCopy.events.signUp.attended}
        </p>
      )}

      {state === "closed" && (
        <p className="text-sm text-muted-foreground">
          {publicCopy.events.signUp.closed}
        </p>
      )}

      {state === "full" && (
        <p className="text-sm text-muted-foreground">
          {publicCopy.events.signUp.full}
        </p>
      )}

      {state === "open" && (
        <div className="space-y-3">
          {renderSpots()}
          <Button
            type="button"
            variant="default"
            className="w-full font-semibold"
            disabled={isPending}
            aria-busy={isPending}
            onClick={handleRegister}
          >
            {isPending && (
              <LoaderCircle
                className="size-4 animate-spin shrink-0 mr-2"
                aria-hidden="true"
              />
            )}
            {publicCopy.events.signUp.button}
          </Button>
        </div>
      )}

      {/* Outcome feedback */}
      {feedback && feedback.type === "status" && (
        <p role="status" className="text-xs text-muted-foreground mt-2">
          {feedback.text}
        </p>
      )}
      {feedback && feedback.type === "error" && (
        <p role="alert" className="text-xs text-destructive mt-2">
          {feedback.text}
        </p>
      )}
    </div>
  );
}

