"use client";

import * as React from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { adminCopy } from "@/data/admin";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buckets,
  type BucketKey,
} from "@/lib/storage/buckets";
import { buildObjectPath } from "@/lib/storage/paths";
import {
  processImage,
  UploadError,
} from "@/lib/storage/image-process";
import {
  removeUploaded,
  getPreviewUrl,
} from "@/lib/storage/upload";
import { createClient } from "@/lib/supabase/client";

export interface ImageUploadProps {
  id: string;
  label?: string;
  bucket: BucketKey;
  value: string | null; // the stored object path
  onChange: (path: string | null) => void;
  onUploaded?: (path: string) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  aspect?: number;
  recommended?: string; // e.g. "1200 x 630"
  previewShape?: "rect" | "circle";
  disabled?: boolean;
  alt?: string;
  className?: string;
}

function getErrorMessage(error: unknown, bucketKey: BucketKey): string {
  const errCopy = adminCopy.forms.image.errors;
  const bucketConfig = buckets[bucketKey];
  const maxMb = Math.round(bucketConfig.maxBytes / (1024 * 1024));

  if (error instanceof UploadError) {
    switch (error.code) {
      case "type":
        return errCopy.type;
      case "too_large":
        return errCopy.tooLarge(maxMb);
      case "pixels":
        return errCopy.pixels;
      case "unreadable":
        return errCopy.unreadable;
      case "compress":
        return errCopy.compress(maxMb);
      case "upload":
        return errCopy.upload;
      case "signed_out":
        return errCopy.signedOut;
    }
  }
  return errCopy.upload;
}

export function ImageUpload({
  id,
  label,
  bucket,
  value,
  onChange,
  onUploaded,
  required = false,
  error,
  hint,
  aspect,
  recommended,
  previewShape = "rect",
  disabled = false,
  alt = "",
  className,
}: ImageUploadProps) {
  const { account } = useAuth();
  const copy = adminCopy.forms.image;
  const bucketConfig = buckets[bucket];
  const maxMb = Math.round(bucketConfig.maxBytes / (1024 * 1024));

  const [status, setStatus] = React.useState<"idle" | "processing" | "uploading">("idle");
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState<string | null>(null);

  // References for cleanup and session tracking
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const localBlobUrlRef = React.useRef<string | null>(null);
  const sessionUploadsRef = React.useRef<Set<string>>(new Set());

  const revokeLocalBlob = React.useCallback(() => {
    if (localBlobUrlRef.current) {
      URL.revokeObjectURL(localBlobUrlRef.current);
      localBlobUrlRef.current = null;
    }
  }, []);

  // Revoke object URLs on unmount
  React.useEffect(() => {
    return () => {
      revokeLocalBlob();
    };
  }, [revokeLocalBlob]);

  // Load preview URL asynchronously when an existing value is present
  React.useEffect(() => {
    let cancelled = false;

    if (!value) {
      revokeLocalBlob();
      return;
    }

    if (localBlobUrlRef.current) {
      return;
    }

    void getPreviewUrl(bucket, value).then((url) => {
      if (cancelled) return;
      if (url) {
        setPreviewUrl(url);
        setPreviewFailed(false);
      } else {
        setPreviewUrl(null);
        setPreviewFailed(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [value, bucket, revokeLocalBlob]);

  const activeError = error || uploadError;
  const errorId = activeError ? `${id}-error` : undefined;
  const hintId = `${id}-hint`;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const defaultHint = copy.hint(copy.types, maxMb, recommended);
  const displayHint = hint || defaultHint;

  const handleFile = async (file: File) => {
    if (disabled || status !== "idle") return;

    if (bucketConfig.ownerFolder && !account?.id) {
      setUploadError(copy.errors.signedOut);
      return;
    }

    setUploadError(null);
    setStatus("processing");

    try {
      const processed = await processImage(file, {
        maxWidth: bucketConfig.maxWidth,
        maxBytes: bucketConfig.maxBytes,
        aspect: aspect ?? bucketConfig.aspect,
      });

      setStatus("uploading");

      const ext = processed.mime === "image/webp" ? "webp" : "jpg";
      const path = buildObjectPath({
        bucket,
        userId: account?.id ?? undefined,
        ext,
      });

      const supabase = createClient();
      const cacheControl = bucketConfig.isPublic ? "31536000" : "3600";

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(path, processed.blob, {
          contentType: processed.mime,
          cacheControl,
          upsert: false,
        });

      if (uploadErr) {
        throw new UploadError("upload", uploadErr.message);
      }

      // If replacing an image previously uploaded in THIS session, delete it from storage
      if (value && sessionUploadsRef.current.has(value)) {
        void removeUploaded(bucket, value);
        sessionUploadsRef.current.delete(value);
      }

      revokeLocalBlob();
      const newBlobUrl = URL.createObjectURL(processed.blob);
      localBlobUrlRef.current = newBlobUrl;
      setPreviewUrl(newBlobUrl);
      setPreviewFailed(false);

      sessionUploadsRef.current.add(path);
      onChange(path);
      onUploaded?.(path);
      setAnnouncement(copy.uploaded);
    } catch (err) {
      console.error("Image upload failed:", err);
      setUploadError(getErrorMessage(err, bucket));
    } finally {
      setStatus("idle");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleRemove = () => {
    if (disabled) return;

    // Delete from storage ONLY if uploaded in this session, never an incoming record
    if (value && sessionUploadsRef.current.has(value)) {
      void removeUploaded(bucket, value);
      sessionUploadsRef.current.delete(value);
    }

    revokeLocalBlob();
    setPreviewUrl(null);
    setPreviewFailed(false);
    setUploadError(null);
    onChange(null);
    setAnnouncement(copy.removed);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isWorking = status !== "idle";
  const isFilled = Boolean(value) && !isWorking;

  const content = (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Hidden file input for file picker access */}
      <input
        ref={fileInputRef}
        id={`${id}-file`}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={handleFileInputChange}
      />

      {/* Screen-reader live announcement region */}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>

      {isWorking ? (
        /* Working State */
        <div
          className="flex min-h-[140px] flex-col items-center justify-center rounded-lg border border-dashed border-accent/60 bg-card/20 p-6 text-center"
          aria-busy="true"
        >
          <Loader2
            className="mb-2 size-7 animate-spin text-white motion-reduce:animate-none"
            aria-hidden="true"
          />
          <p className="text-[14.5px] font-medium text-white">
            {status === "processing" ? copy.processing : copy.uploading}
          </p>
        </div>
      ) : isFilled ? (
        /* Filled State */
        <div className="flex flex-col items-start gap-3">
          {previewShape === "circle" ? (
            <div className="relative size-[140px] overflow-hidden rounded-full border border-border bg-card/20">
              {previewFailed ? (
                <div className="flex size-full items-center justify-center p-2 text-center">
                  <p className="text-xs text-muted-foreground">
                    {copy.previewFailed}
                  </p>
                </div>
              ) : previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element -- blob: and signed storage URLs cannot go through next/image */
                <img
                  src={previewUrl}
                  alt={alt}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Loader2
                    className="size-5 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
          ) : (
            <div
              className="relative w-full max-w-[480px] overflow-hidden rounded-lg border border-border bg-card/20"
              style={{
                aspectRatio: aspect ? `${aspect}` : "1200 / 630",
              }}
            >
              {previewFailed ? (
                <div className="flex size-full items-center justify-center p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    {copy.previewFailed}
                  </p>
                </div>
              ) : previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element -- blob: and signed storage URLs cannot go through next/image */
                <img
                  src={previewUrl}
                  alt={alt}
                  className="size-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Loader2
                    className="size-6 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
            >
              {copy.replace}
            </Button>
            <button
              type="button"
              disabled={disabled}
              onClick={handleRemove}
              className="text-xs font-medium text-red-400 transition-colors hover:text-red-300 disabled:opacity-50 cursor-pointer"
            >
              {copy.remove}
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled && status === "idle") setIsDragging(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled && status === "idle") setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (disabled || status !== "idle") return;
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) {
              void handleFile(dropped);
            }
          }}
          aria-describedby={describedBy}
          className={cn(
            "flex min-h-[140px] w-full flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-accent/60 bg-card/20 hover:bg-accent/5"
          )}
        >
          <UploadCloud
            className="mb-2 size-7 text-white"
            aria-hidden="true"
          />
          <p className="text-[14.5px] font-medium text-white">
            {copy.title}{" "}
            <span className="font-normal text-muted-foreground">
              {copy.dragHint}
            </span>
          </p>
          <p id={hintId} className="mt-1 text-[13px] text-muted-foreground">
            {displayHint}
          </p>
        </button>
      )}

      {/* Error alert message */}
      {activeError && (
        <p
          id={errorId}
          role="alert"
          className="text-[13px] leading-snug text-red-400"
        >
          {activeError}
        </p>
      )}
    </div>
  );

  if (label) {
    return (
      <FormField id={id} label={label} required={required}>
        {content}
      </FormField>
    );
  }

  return content;
}
