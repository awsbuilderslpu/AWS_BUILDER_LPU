"use client";

import {
  allowedInputTypes,
  maxInputBytes,
  maxInputPixels,
} from "./buckets";
import {
  fitWithin,
  computeCropRect,
  qualitySteps,
} from "./image-math";
import { UploadError } from "./errors";

export { UploadError, type UploadErrorCode } from "./errors";

export interface ProcessImageOptions {
  maxWidth: number;
  maxBytes: number;
  aspect?: number;
}

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
  mime: "image/webp" | "image/jpeg";
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

/**
 * Prepares and optimizes an image file for storage in the browser.
 * Validates mime type and file size, decodes with orientation correction,
 * checks pixel dimensions, applies aspect cropping and downscaling (never upscaling),
 * strips all metadata (EXIF/GPS) by redrawing onto an HTML5 canvas,
 * and compresses as WebP (or fallback JPEG with white background) within maxBytes.
 */
export async function processImage(
  file: File,
  options: ProcessImageOptions
): Promise<ProcessedImage> {
  // 1. Reject mime type outside allowedInputTypes
  if (!allowedInputTypes.includes(file.type)) {
    throw new UploadError("type");
  }

  // 2. Reject file size above maxInputBytes
  if (file.size > maxInputBytes) {
    throw new UploadError("too_large");
  }

  // 3. Decode bitmap with orientation correction fallback
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw new UploadError("unreadable");
    }
  }

  // 4. Check total pixel count
  if (bitmap.width * bitmap.height > maxInputPixels) {
    bitmap.close();
    throw new UploadError("pixels");
  }

  try {
    // 5. Compute crop rect when aspect is provided
    const crop =
      options.aspect !== undefined && options.aspect > 0
        ? computeCropRect(bitmap.width, bitmap.height, options.aspect)
        : { x: 0, y: 0, width: bitmap.width, height: bitmap.height };

    // 6. Scale dimensions with fitWithin (never upscales)
    const target = fitWithin(crop.width, crop.height, options.maxWidth);

    // 7. Draw onto normal HTML canvas (not OffscreenCanvas)
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new UploadError("unreadable");
    }

    ctx.drawImage(
      bitmap,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      target.width,
      target.height
    );

    // Re-encoding drops all metadata (EXIF, GPS), which is intended for privacy and security.

    // 8. Encode WebP stepping through qualitySteps until blob.size <= maxBytes
    let webpSupported = true;
    for (const quality of qualitySteps) {
      const blob = await canvasToBlob(canvas, "image/webp", quality);
      if (!blob || blob.type !== "image/webp") {
        webpSupported = false;
        break;
      }
      if (blob.size <= options.maxBytes) {
        return {
          blob,
          width: target.width,
          height: target.height,
          mime: "image/webp",
        };
      }
    }

    if (webpSupported) {
      // Browser produced WebP, but file could not be compressed under maxBytes
      throw new UploadError("compress");
    }

    // Fallback: If browser cannot produce WebP, fill white first and encode JPEG
    const jpgCanvas = document.createElement("canvas");
    jpgCanvas.width = target.width;
    jpgCanvas.height = target.height;
    const jpgCtx = jpgCanvas.getContext("2d");
    if (!jpgCtx) {
      throw new UploadError("unreadable");
    }

    jpgCtx.fillStyle = "white";
    jpgCtx.fillRect(0, 0, target.width, target.height);
    jpgCtx.drawImage(canvas, 0, 0);

    for (const quality of qualitySteps) {
      const blob = await canvasToBlob(jpgCanvas, "image/jpeg", quality);
      if (blob && blob.size <= options.maxBytes) {
        return {
          blob,
          width: target.width,
          height: target.height,
          mime: "image/jpeg",
        };
      }
    }

    throw new UploadError("compress");
  } finally {
    // Always close the bitmap to release system resources
    bitmap.close();
  }
}
