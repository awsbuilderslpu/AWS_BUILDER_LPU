"use client";

import * as React from "react";
import {
  FileText,
  Image as ImageIcon,
  Clock,
  ClipboardList,
  Globe,
} from "lucide-react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminCopy } from "@/data/admin";
import { notify } from "@/lib/admin/notify";
import { DetailDrawer } from "@/components/features/admin/kit/DetailDrawer";
import { DrawerSection } from "@/components/features/admin/kit/DrawerSection";
import { ConfirmDialog } from "@/components/features/admin/kit/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/TextField";
import { SelectField, type SelectOption } from "@/components/ui/SelectField";
import { DateTimeField, ImageUpload, RichTextEditor } from "@/components/features/admin/forms";
import { removeUploaded } from "@/lib/storage/upload";
import { cn } from "@/lib/utils";
import {
  eventFormSchema,
  type EventFormValues,
} from "@/lib/events/validate";
import {
  formFromDetails,
  emptyEventForm,
  showVenue,
  showMeetingUrl,
  showDeadline,
} from "@/lib/events/view-logic";
import type { EventCategory, EventLocationMode, EventDetails } from "@/lib/events/types";
import {
  createEventAction,
  updateEventAction,
  getEventDetailsAction,
} from "@/lib/events/actions";

export interface EventDrawerProps {
  open: boolean;
  mode: "create" | "edit";
  eventId: string | null;
  nowIso: string;
  onClose: () => void;
  onSaved: () => void;
}

const copy = adminCopy.events;

const categoryOptions: SelectOption[] = [
  { value: "workshop", label: copy.categoryLabels.workshop },
  { value: "hackathon", label: copy.categoryLabels.hackathon },
  { value: "talk", label: copy.categoryLabels.talk },
  { value: "competition", label: copy.categoryLabels.competition },
  { value: "community", label: copy.categoryLabels.community },
];

const locationOptions: SelectOption[] = [
  { value: "on_campus", label: copy.locationLabels.on_campus },
  { value: "online", label: copy.locationLabels.online },
  { value: "hybrid", label: copy.locationLabels.hybrid },
];

export function EventDrawer({
  open,
  mode,
  eventId,
  nowIso,
  onClose,
  onSaved,
}: EventDrawerProps) {
  void nowIso;

  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
  const [loadedSlug, setLoadedSlug] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showDiscard, setShowDiscard] = React.useState(false);

  // Track banners uploaded in this drawer session for cleanup on discard
  const sessionUploadsRef = React.useRef<Set<string>>(new Set());

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EventFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(eventFormSchema) as any,
    mode: "onTouched",
    defaultValues: emptyEventForm(),
  });

  const locationMode = useWatch({ control, name: "locationMode" });
  const registrationEnabled = useWatch({ control, name: "registrationEnabled" });

  // Load details in edit mode
  React.useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      setLoadedSlug(null);
      setLoadError(false);
      setLoading(false);
      reset(emptyEventForm());
      return;
    }

    if (mode === "edit" && eventId) {
      let active = true;
      setLoading(true);
      setLoadError(false);

      getEventDetailsAction(eventId)
        .then((data: EventDetails | null) => {
          if (!active) return;
          if (!data) {
            setLoadError(true);
            return;
          }
          setLoadedSlug(data.slug);
          reset(formFromDetails(data));
        })
        .catch(() => {
          if (!active) return;
          setLoadError(true);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }
  }, [open, mode, eventId, reset]);

  const onSubmit = React.useCallback(
    async (values: EventFormValues) => {
      setServerError(null);
      let res;

      if (mode === "create") {
        res = await createEventAction(values);
      } else {
        if (!eventId) return;
        res = await updateEventAction(eventId, values);
      }

      if (!res.ok) {
        const errKey = res.error as keyof typeof copy.errors;
        const msg = copy.errors[errKey] ?? copy.errors.failed;
        setServerError(msg);
        return;
      }

      // Success: clear session uploads so they are kept
      sessionUploadsRef.current.clear();
      notify.success(mode === "create" ? copy.form.created : copy.form.saved);
      onSaved();
      onClose();
    },
    [mode, eventId, onSaved, onClose]
  );

  const handleAttemptClose = React.useCallback(() => {
    if (isDirty) {
      setShowDiscard(true);
    } else {
      sessionUploadsRef.current.clear();
      setServerError(null);
      onClose();
    }
  }, [isDirty, onClose]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        handleAttemptClose();
      }
    },
    [handleAttemptClose]
  );

  const handleDiscardConfirm = React.useCallback(() => {
    for (const path of sessionUploadsRef.current) {
      void removeUploaded("event-banners", path);
    }
    sessionUploadsRef.current.clear();
    setServerError(null);
    setShowDiscard(false);
    onClose();
  }, [onClose]);

  return (
    <>
      <DetailDrawer
        open={open}
        onOpenChange={handleOpenChange}
        title={mode === "create" ? copy.form.createTitle : copy.form.editTitle}
        description={copy.form.subtitle}
        widthClass="sm:max-w-[560px]"
        footer={
          <div className="flex w-full items-center justify-between gap-3 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleAttemptClose}
              disabled={isSubmitting}
              className="h-10 px-4 text-[13px] font-medium cursor-pointer"
            >
              {copy.form.cancel}
            </Button>
            <Button
              type="submit"
              form="event-form"
              disabled={isSubmitting || loading}
              className="h-10 px-5 text-[13px] font-medium cursor-pointer"
            >
              {isSubmitting
                ? copy.form.working
                : mode === "create"
                ? copy.form.submitCreate
                : copy.form.submitEdit}
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="space-y-6 animate-pulse py-4">
            <div className="h-10 w-3/4 rounded bg-card/60 border border-border" />
            <div className="h-32 w-full rounded bg-card/60 border border-border" />
            <div className="h-24 w-full rounded bg-card/60 border border-border" />
            <div className="h-10 w-1/2 rounded bg-card/60 border border-border" />
          </div>
        ) : loadError ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4 p-6 text-center">
            <p className="text-[13.5px] text-muted-foreground">{copy.form.loadFailed}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!eventId) return;
                setLoadError(false);
                setLoading(true);
                getEventDetailsAction(eventId)
                  .then((data: EventDetails | null) => {
                    if (!data) {
                      setLoadError(true);
                      return;
                    }
                    setLoadedSlug(data.slug);
                    reset(formFromDetails(data));
                  })
                  .catch(() => setLoadError(true))
                  .finally(() => setLoading(false));
              }}
              className="h-9 px-4 text-[13px] cursor-pointer"
            >
              {copy.form.retry}
            </Button>
          </div>
        ) : (
          <form
            id="event-form"
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="space-y-6"
            noValidate
          >
            {serverError && (
              <div
                role="alert"
                className="rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[12.5px] text-red-300"
              >
                {serverError}
              </div>
            )}

            {/* 1. Basic information */}
            <DrawerSection title={copy.form.sections.basics} icon={FileText}>
              <div className="space-y-4">
                <TextField
                  id="event-title"
                  label={copy.form.labels.title}
                  required
                  error={errors.title?.message}
                  {...register("title")}
                />

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      id="event-description"
                      label={copy.form.labels.description}
                      hint={copy.form.hints.description}
                      variant="basic"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.description?.message as string | undefined}
                    />
                  )}
                />

                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      id="event-category"
                      label={copy.form.labels.category}
                      required
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.value as EventCategory)
                      }
                      error={errors.category?.message}
                      options={categoryOptions}
                    />
                  )}
                />
              </div>
            </DrawerSection>

            {/* 2. Event banner */}
            <DrawerSection title={copy.form.sections.banner} icon={ImageIcon}>
              <Controller
                name="bannerPath"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    id="event-banner"
                    label={copy.form.labels.banner}
                    bucket="event-banners"
                    aspect={1.9}
                    recommended="1200 x 630"
                    hint={copy.form.hints.banner}
                    value={field.value ?? null}
                    onChange={field.onChange}
                    onUploaded={(path) => sessionUploadsRef.current.add(path)}
                    error={errors.bannerPath?.message}
                  />
                )}
              />
            </DrawerSection>

            {/* 3. Event details */}
            <DrawerSection title={copy.form.sections.details} icon={Clock}>
              <div className="space-y-4">
                <Controller
                  name="startsAt"
                  control={control}
                  render={({ field }) => (
                    <DateTimeField
                      id="event-starts-at"
                      label={copy.form.labels.startsAt}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.startsAt?.message}
                    />
                  )}
                />

                <Controller
                  name="endsAt"
                  control={control}
                  render={({ field }) => (
                    <DateTimeField
                      id="event-ends-at"
                      label={copy.form.labels.endsAt}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.endsAt?.message}
                    />
                  )}
                />

                <Controller
                  name="locationMode"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      id="event-location-mode"
                      label={copy.form.labels.locationMode}
                      required
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.value as EventLocationMode)
                      }
                      error={errors.locationMode?.message}
                      options={locationOptions}
                    />
                  )}
                />

                {showVenue(locationMode) && (
                  <TextField
                    id="event-venue"
                    label={copy.form.labels.venue}
                    required
                    error={errors.venue?.message}
                    {...register("venue")}
                  />
                )}

                {showMeetingUrl(locationMode) && (
                  <TextField
                    id="event-meeting-url"
                    label={copy.form.labels.meetingUrl}
                    inputMode="url"
                    placeholder="https://"
                    required
                    error={errors.meetingUrl?.message}
                    {...register("meetingUrl")}
                  />
                )}
              </div>
            </DrawerSection>

            {/* 4. Registration */}
            <DrawerSection
              title={copy.form.sections.registration}
              icon={ClipboardList}
            >
              <div className="space-y-4">
                <Controller
                  name="registrationEnabled"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <label
                          htmlFor="event-reg-enabled"
                          className="block text-[12.5px] font-medium text-white cursor-pointer"
                        >
                          {copy.form.labels.registrationEnabled}
                        </label>
                        <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                          {copy.form.hints.registration}
                        </p>
                      </div>
                      <button
                        type="button"
                        id="event-reg-enabled"
                        role="switch"
                        aria-checked={Boolean(field.value)}
                        onClick={() => field.onChange(!field.value)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          field.value ? "bg-primary" : "bg-muted/40"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                            field.value ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  )}
                />

                {showDeadline(registrationEnabled) && (
                  <Controller
                    name="registrationDeadline"
                    control={control}
                    render={({ field }) => (
                      <DateTimeField
                        id="event-reg-deadline"
                        label={copy.form.labels.registrationDeadline}
                        hint={copy.form.hints.deadline}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.registrationDeadline?.message}
                      />
                    )}
                  />
                )}
              </div>
            </DrawerSection>

            {/* 5. Publishing */}
            <DrawerSection
              title={copy.form.sections.publishing}
              icon={Globe}
            >
              <div className="space-y-4">
                <Controller
                  name="isPublished"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <label
                          htmlFor="event-published"
                          className="block text-[12.5px] font-medium text-white cursor-pointer"
                        >
                          {copy.form.labels.isPublished}
                        </label>
                        <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                          {copy.form.hints.publish}
                        </p>
                      </div>
                      <button
                        type="button"
                        id="event-published"
                        role="switch"
                        aria-checked={Boolean(field.value)}
                        onClick={() => field.onChange(!field.value)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          field.value ? "bg-primary" : "bg-muted/40"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                            field.value ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  )}
                />

                {mode === "edit" && loadedSlug && (
                  <div className="space-y-1 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[12.5px] font-medium text-muted-foreground">
                        {copy.form.labels.slug}
                      </span>
                      <code className="text-[12px] font-mono text-muted-foreground bg-muted/20 px-2 py-0.5 rounded border border-border/40">
                        /events/{loadedSlug}
                      </code>
                    </div>
                    <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                      {copy.form.hints.slug}
                    </p>
                  </div>
                )}
              </div>
            </DrawerSection>
          </form>
        )}
      </DetailDrawer>

      <ConfirmDialog
        open={showDiscard}
        onOpenChange={setShowDiscard}
        title={copy.form.discardTitle}
        description={copy.form.discardText}
        confirmLabel={copy.form.discard}
        onConfirm={handleDiscardConfirm}
      />
    </>
  );
}
