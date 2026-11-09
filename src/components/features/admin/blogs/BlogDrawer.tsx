"use client";

import * as React from "react";
import Image from "next/image";
import { Clock, Image as ImageIcon, RotateCcw } from "lucide-react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminCopy } from "@/data/admin";
import { notify } from "@/lib/admin/notify";
import { DetailDrawer } from "@/components/features/admin/kit/DetailDrawer";
import { ConfirmDialog } from "@/components/features/admin/kit/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/TextField";
import { SelectField, type SelectOption } from "@/components/ui/SelectField";
import {
  DateTimeField,
  ImageUpload,
  RichTextEditor,
  RichTextRenderer,
  TagInput,
} from "@/components/features/admin/forms";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CategoryBadge } from "@/components/features/blogs/CategoryBadge";
import { removeUploaded } from "@/lib/storage/upload";
import { publicObjectUrl } from "@/lib/storage/urls";
import { cn } from "@/lib/utils";
import { blogCategories } from "@/lib/blogs/categories";
import { blogFormSchema, type BlogFormValues } from "@/lib/blogs/validate";
import {
  formFromDetails,
  emptyBlogForm,
  featuredToggleAllowed,
} from "@/lib/blogs/view-logic";
import { blogLifecycle, isPubliclyVisible } from "@/lib/blogs/lifecycle";
import { collectImagePaths, orphansFromSession } from "@/lib/blogs/images";
import { estimateReadMinutes } from "@/lib/blogs/reading-time";
import type { BlogDetails } from "@/lib/blogs/types";
import {
  createBlogAction,
  updateBlogAction,
  setBlogsStateAction,
  setFeaturedBlogAction,
  getBlogDetailsAction,
} from "@/lib/blogs/actions";

export interface BlogDrawerProps {
  open: boolean;
  mode: "create" | "edit";
  blogId: string | null;
  nowIso: string;
  onClose: () => void;
  onSaved: () => void;
}

const copy = adminCopy.blogs;

const categoryOptions: SelectOption[] = blogCategories.map((c) => ({
  value: c,
  label: c,
}));

const statusOptions: SelectOption[] = [
  { value: "draft", label: copy.statusLabels.draft },
  { value: "published", label: copy.statusLabels.published },
];

export function BlogDrawer({
  open,
  mode,
  blogId,
  nowIso,
  onClose,
  onSaved,
}: BlogDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<"write" | "settings" | "preview">("write");
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
  const [isArchived, setIsArchived] = React.useState(false);
  const [loadedSlug, setLoadedSlug] = React.useState<string | null>(null);
  const [isFeaturedState, setIsFeaturedState] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showDiscard, setShowDiscard] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [isFeaturing, setIsFeaturing] = React.useState(false);
  const [currentDetails, setCurrentDetails] = React.useState<BlogDetails | null>(null);

  // Track session uploads vs initially saved paths
  const sessionPathsRef = React.useRef<Set<string>>(new Set());
  const savedPathsRef = React.useRef<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<BlogFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(blogFormSchema) as any,
    mode: "onTouched",
    defaultValues: emptyBlogForm(),
  });

  const watchedBody = useWatch({ control, name: "body" });
  const watchedTitle = useWatch({ control, name: "title" });
  const watchedExcerpt = useWatch({ control, name: "excerpt" });
  const watchedCategory = useWatch({ control, name: "category" });
  const watchedImage = useWatch({ control, name: "featuredImagePath" });
  const watchedMetaTitle = useWatch({ control, name: "metaTitle" });
  const watchedMetaDesc = useWatch({ control, name: "metaDescription" });

  const readMinutesLive = React.useMemo(() => {
    return estimateReadMinutes(watchedBody);
  }, [watchedBody]);

  // Load details in edit mode
  React.useEffect(() => {
    if (!open) return;
    setActiveTab("write");
    setServerError(null);

    if (mode === "create") {
      setLoadedSlug(null);
      setLoadError(false);
      setLoading(false);
      setIsArchived(false);
      setIsFeaturedState(false);
      setCurrentDetails(null);
      savedPathsRef.current = [];
      sessionPathsRef.current.clear();
      reset(emptyBlogForm());
      return;
    }

    if (mode === "edit" && blogId) {
      let active = true;
      setLoading(true);
      setLoadError(false);

      getBlogDetailsAction(blogId)
        .then((data) => {
          if (!active) return;
          if (!data) {
            setLoadError(true);
            return;
          }
          setCurrentDetails(data);
          setLoadedSlug(data.slug);
          setIsArchived(data.status === "archived");
          setIsFeaturedState(data.isFeatured);

          const initialImage = data.featuredImagePath ? [data.featuredImagePath] : [];
          const initialBodyImages = collectImagePaths(data.body);
          savedPathsRef.current = [...initialImage, ...initialBodyImages];
          sessionPathsRef.current.clear();

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
  }, [open, mode, blogId, reset]);

  const handleRestore = async () => {
    if (!blogId) return;
    setIsRestoring(true);
    setServerError(null);
    const res = await setBlogsStateAction({ ids: [blogId], action: "restore" });
    setIsRestoring(false);
    if (res.ok) {
      notify.success(copy.results.done.restore(1));
      onSaved();
      onClose();
    } else {
      const errKey = res.error as keyof typeof copy.errors;
      setServerError(copy.errors[errKey] ?? copy.errors.failed);
    }
  };

  const handleToggleFeatured = async () => {
    if (!blogId || isFeaturing) return;
    const nextFeatured = !isFeaturedState;
    setIsFeaturing(true);
    const res = await setFeaturedBlogAction({ id: blogId, featured: nextFeatured });
    setIsFeaturing(false);
    if (res.ok) {
      setIsFeaturedState(nextFeatured);
      notify.success(copy.results.featuredDone);
      onSaved();
    } else {
      const errKey = res.error as keyof typeof copy.errors;
      notify.error(copy.errors[errKey] ?? copy.errors.failed);
    }
  };

  const onSubmit = React.useCallback(
    async (values: BlogFormValues) => {
      setServerError(null);
      let res;

      if (mode === "create") {
        res = await createBlogAction(values);
      } else {
        if (!blogId) return;
        res = await updateBlogAction({ id: blogId, ...values });
      }

      if (!res.ok) {
        const errKey = res.error as keyof typeof copy.errors;
        setServerError(copy.errors[errKey] ?? copy.errors.failed);
        return;
      }

      sessionPathsRef.current.clear();
      notify.success(mode === "create" ? copy.form.created : copy.form.saved);
      onSaved();
      onClose();
    },
    [mode, blogId, onSaved, onClose]
  );

  const handleAttemptClose = React.useCallback(() => {
    if (isDirty) {
      setShowDiscard(true);
    } else {
      sessionPathsRef.current.clear();
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
    const orphans = orphansFromSession(
      Array.from(sessionPathsRef.current),
      savedPathsRef.current
    );
    for (const path of orphans) {
      void removeUploaded("blog-images", path);
    }
    sessionPathsRef.current.clear();
    setServerError(null);
    setShowDiscard(false);
    onClose();
  }, [onClose]);

  const nowMs = React.useMemo(() => Date.parse(nowIso), [nowIso]);
  const currentLifecycle = currentDetails ? blogLifecycle(currentDetails, nowMs) : "draft";
  const canFeature = currentDetails ? isPubliclyVisible(currentDetails, nowMs) && featuredToggleAllowed(currentLifecycle) : false;

  const previewImageUrl = watchedImage ? publicObjectUrl("blog-images", watchedImage) : null;

  return (
    <>
      <DetailDrawer
        open={open}
        onOpenChange={handleOpenChange}
        title={mode === "create" ? copy.form.createTitle : copy.form.editTitle}
        widthClass="sm:max-w-3xl"
        footer={
          !isArchived && !loading && !loadError ? (
            <div className="flex w-full items-center justify-between gap-3">
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
                form="blog-form"
                disabled={isSubmitting || loading}
                className="h-10 px-5 text-[13px] font-medium cursor-pointer"
              >
                {isSubmitting
                  ? copy.form.working
                  : mode === "create"
                  ? copy.form.saveCreate
                  : copy.form.saveEdit}
              </Button>
            </div>
          ) : undefined
        }
      >
        {loading ? (
          <div className="space-y-6 animate-pulse py-4">
            <div className="h-10 w-3/4 rounded bg-card/60 border border-border" />
            <div className="h-32 w-full rounded bg-card/60 border border-border" />
            <div className="h-24 w-full rounded bg-card/60 border border-border" />
          </div>
        ) : loadError ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4 p-6 text-center">
            <p className="text-[13.5px] text-muted-foreground">{copy.form.loadFailed}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!blogId) return;
                setLoadError(false);
                setLoading(true);
                getBlogDetailsAction(blogId)
                  .then((data) => {
                    if (!data) {
                      setLoadError(true);
                      return;
                    }
                    setCurrentDetails(data);
                    setLoadedSlug(data.slug);
                    setIsArchived(data.status === "archived");
                    setIsFeaturedState(data.isFeatured);
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
        ) : isArchived ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center space-y-5 p-6 text-center">
            <p className="text-[14px] text-muted-foreground max-w-md leading-relaxed">
              {copy.form.archivedNotice}
            </p>
            <Button
              type="button"
              onClick={handleRestore}
              disabled={isRestoring}
              className="h-10 px-5 text-[13px] font-medium cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="size-4" />
              <span>{isRestoring ? copy.form.working : copy.form.restore}</span>
            </Button>
            {serverError && (
              <p role="alert" className="text-sm text-destructive mt-2">
                {serverError}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {serverError && (
              <div
                role="alert"
                className="rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[12.5px] text-red-300"
              >
                {serverError}
              </div>
            )}

            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as "write" | "settings" | "preview")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-muted/60 p-1">
                <TabsTrigger value="write" className="text-xs font-medium cursor-pointer">
                  {copy.form.tabs.write}
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs font-medium cursor-pointer">
                  {copy.form.tabs.settings}
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs font-medium cursor-pointer">
                  {copy.form.tabs.preview}
                </TabsTrigger>
              </TabsList>

              <form
                id="blog-form"
                onSubmit={(e) => void handleSubmit(onSubmit)(e)}
                noValidate
                className="mt-4"
              >
                {/* 1. WRITE TAB */}
                <TabsContent
                  value="write"
                  forceMount
                  className={cn("space-y-4 pt-2", activeTab !== "write" && "hidden")}
                >
                  <TextField
                    id="blog-title"
                    label={copy.form.labels.title}
                    required
                    error={errors.title?.message}
                    {...register("title")}
                  />

                  {/* Excerpt with 200 character counter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="blog-excerpt" className="block text-[12.5px] font-medium text-foreground select-none">
                        {copy.form.labels.excerpt}
                      </label>
                      <span
                        className={cn(
                          "text-[11px] tabular-nums",
                          (watchedExcerpt?.length ?? 0) > 200
                            ? "text-destructive font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {copy.form.hints.counter(watchedExcerpt?.length ?? 0, 200)}
                      </span>
                    </div>
                    <textarea
                      id="blog-excerpt"
                      rows={3}
                      placeholder={copy.form.hints.excerpt}
                      className={cn(
                        "w-full rounded-md border border-border bg-background/60 px-3 py-2 text-[13px] text-foreground placeholder:text-[12px] placeholder:text-muted-foreground/75 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 resize-y",
                        errors.excerpt && "border-red-400/70"
                      )}
                      {...register("excerpt")}
                    />
                    {errors.excerpt && (
                      <p role="alert" className="text-[11.5px] text-destructive">
                        {errors.excerpt.message}
                      </p>
                    )}
                  </div>

                  {/* Body with article rich text editor */}
                  <Controller
                    name="body"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor
                        id="blog-content"
                        label={copy.form.labels.content}
                        variant="article"
                        value={field.value}
                        onChange={field.onChange}
                        onImageUploaded={(path) => sessionPathsRef.current.add(path)}
                        error={errors.body?.message as string | undefined}
                      />
                    )}
                  />

                  {/* Live Read Minutes */}
                  <div className="text-[12px] text-muted-foreground flex items-center gap-1.5 pt-0.5 pb-1">
                    <Clock className="size-3.5 text-primary" />
                    <span>{copy.form.hints.readTime(readMinutesLive)}</span>
                  </div>

                  {/* Featured Image */}
                  <Controller
                    name="featuredImagePath"
                    control={control}
                    render={({ field }) => (
                      <ImageUpload
                        id="blog-featured-image"
                        label={copy.form.labels.featuredImage}
                        bucket="blog-images"
                        aspect={1200 / 630}
                        recommended="1200 x 630"
                        hint={copy.form.hints.featuredImage}
                        value={field.value ?? null}
                        onChange={field.onChange}
                        onUploaded={(path) => sessionPathsRef.current.add(path)}
                        error={errors.featuredImagePath?.message}
                      />
                    )}
                  />

                  {/* Category SelectField */}
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        id="blog-category"
                        label={copy.form.labels.category}
                        required
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        error={errors.category?.message}
                        options={categoryOptions}
                      />
                    )}
                  />

                  {/* Tags Input */}
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        id="blog-tags"
                        label={copy.form.labels.tags}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.tags?.message}
                      />
                    )}
                  />

                  {/* Status SelectField */}
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        id="blog-status"
                        label={copy.form.labels.status}
                        required
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        error={errors.status?.message}
                        options={statusOptions}
                        hint={copy.form.publishNowHint}
                      />
                    )}
                  />

                  {/* Publish Date */}
                  <Controller
                    name="publishAt"
                    control={control}
                    render={({ field }) => (
                      <DateTimeField
                        id="blog-publish-at"
                        label={copy.form.labels.publishAt}
                        hint={copy.form.hints.publishAt}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.publishAt?.message}
                      />
                    )}
                  />
                </TabsContent>

                {/* 2. SEO & SETTINGS TAB */}
                <TabsContent
                  value="settings"
                  forceMount
                  className={cn("space-y-4 pt-2", activeTab !== "settings" && "hidden")}
                >
                  <TextField
                    id="blog-author-name"
                    label={copy.form.labels.authorName}
                    hint={copy.form.hints.authorName}
                    required
                    error={errors.authorName?.message}
                    {...register("authorName")}
                  />

                  {/* Meta Title with 70 character counter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="blog-meta-title" className="block text-[12.5px] font-medium text-foreground select-none">
                        {copy.form.labels.metaTitle}
                      </label>
                      <span
                        className={cn(
                          "text-[11px] tabular-nums",
                          (watchedMetaTitle?.length ?? 0) > 70
                            ? "text-destructive font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {copy.form.hints.counter(watchedMetaTitle?.length ?? 0, 70)}
                      </span>
                    </div>
                    <input
                      id="blog-meta-title"
                      type="text"
                      placeholder={copy.form.hints.metaTitle}
                      className={cn(
                        "w-full rounded-md border border-border bg-background/60 px-3 py-2 text-[13px] text-foreground placeholder:text-[12px] placeholder:text-muted-foreground/75 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30",
                        errors.metaTitle && "border-red-400/70"
                      )}
                      {...register("metaTitle")}
                    />
                    {errors.metaTitle && (
                      <p role="alert" className="text-[11.5px] text-destructive">
                        {errors.metaTitle.message}
                      </p>
                    )}
                  </div>

                  {/* Meta Description with 160 character counter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="blog-meta-desc" className="block text-[12.5px] font-medium text-foreground select-none">
                        {copy.form.labels.metaDescription}
                      </label>
                      <span
                        className={cn(
                          "text-[11px] tabular-nums",
                          (watchedMetaDesc?.length ?? 0) > 160
                            ? "text-destructive font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {copy.form.hints.counter(watchedMetaDesc?.length ?? 0, 160)}
                      </span>
                    </div>
                    <textarea
                      id="blog-meta-desc"
                      rows={3}
                      placeholder={copy.form.hints.metaDescription}
                      className={cn(
                        "w-full rounded-md border border-border bg-background/60 px-3 py-2 text-[13px] text-foreground placeholder:text-[12px] placeholder:text-muted-foreground/75 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 resize-y",
                        errors.metaDescription && "border-red-400/70"
                      )}
                      {...register("metaDescription")}
                    />
                    {errors.metaDescription && (
                      <p role="alert" className="text-[11.5px] text-destructive">
                        {errors.metaDescription.message}
                      </p>
                    )}
                  </div>

                  {/* Slug in edit mode */}
                  {mode === "edit" && loadedSlug && (
                    <div className="space-y-1 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[12.5px] font-medium text-muted-foreground select-none">
                          {copy.form.labels.slug}
                        </span>
                        <code className="text-[12px] font-mono text-muted-foreground bg-muted/20 px-2 py-0.5 rounded border border-border/40">
                          /blogs/{loadedSlug}
                        </code>
                      </div>
                      <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                        {copy.form.hints.slug}
                      </p>
                    </div>
                  )}

                  {/* Featured Switch (edit mode only) */}
                  {mode === "edit" && (
                    <div className="space-y-2 pt-3 border-t border-border/60">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <label
                            htmlFor="blog-featured-toggle"
                            className={cn(
                              "block text-[12.5px] font-medium select-none",
                              canFeature ? "text-foreground cursor-pointer" : "text-muted-foreground cursor-not-allowed"
                            )}
                          >
                            {copy.form.labels.featured}
                          </label>
                          <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                            {canFeature ? copy.form.hints.featured : copy.form.hints.featureDisabled}
                          </p>
                        </div>
                        <button
                          type="button"
                          id="blog-featured-toggle"
                          role="switch"
                          aria-checked={isFeaturedState}
                          disabled={!canFeature || isFeaturing}
                          title={!canFeature ? copy.form.hints.featureDisabled : undefined}
                          onClick={handleToggleFeatured}
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            canFeature ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
                            isFeaturedState ? "bg-primary" : "bg-muted/40"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                              isFeaturedState ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* 3. PREVIEW TAB */}
                <TabsContent
                  value="preview"
                  forceMount
                  className={cn("space-y-5 pt-2", activeTab !== "preview" && "hidden")}
                >
                  <div className="rounded-lg border border-border bg-card/60 p-5 space-y-4">
                    {previewImageUrl ? (
                      <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-md border border-border">
                        <Image
                          src={previewImageUrl}
                          alt={watchedTitle || "Blog thumbnail"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[1200/630] w-full items-center justify-center rounded-md border border-dashed border-border/80 bg-muted/20 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon className="size-8 stroke-[1.5]" />
                          <span className="text-xs">{copy.table.noImage}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {watchedCategory && (
                        <CategoryBadge tone="blue">{watchedCategory}</CategoryBadge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {copy.table.readTime(readMinutesLive)}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-foreground leading-snug">
                      {watchedTitle || "Untitled Blog Post"}
                    </h2>

                    {watchedExcerpt && (
                      <p className="text-[13.5px] text-muted-foreground leading-relaxed italic border-l-2 border-primary/60 pl-3">
                        {watchedExcerpt}
                      </p>
                    )}

                    <div className="border-t border-border/60 pt-4">
                      <RichTextRenderer doc={watchedBody} variant="article" />
                    </div>

                    <p className="text-[11px] text-muted-foreground/70 italic border-t border-border/40 pt-3">
                      Note: Public post page styling arrives in Step 22.
                    </p>
                  </div>
                </TabsContent>
              </form>
            </Tabs>
          </div>
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

