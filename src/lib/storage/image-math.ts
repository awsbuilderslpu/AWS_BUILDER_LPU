export const qualitySteps: readonly number[] = [0.85, 0.75, 0.65, 0.55];

export interface Dimensions {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculates downscaled dimensions that fit within maxWidth (and optional maxHeight).
 * Never upscales, preserves the aspect ratio, and rounds to integers (minimum 1).
 */
export function fitWithin(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight?: number
): Dimensions {
  if (width <= 0 || height <= 0 || maxWidth <= 0) {
    return { width: Math.max(1, Math.round(width)), height: Math.max(1, Math.round(height)) };
  }

  const scale =
    maxHeight !== undefined && maxHeight > 0
      ? Math.min(1, maxWidth / width, maxHeight / height)
      : Math.min(1, maxWidth / width);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * Computes the largest centred crop rectangle inside the source dimensions
 * matching the given aspect ratio (width / height).
 */
export function computeCropRect(
  srcW: number,
  srcH: number,
  aspect: number
): Rect {
  if (srcW <= 0 || srcH <= 0 || aspect <= 0) {
    return { x: 0, y: 0, width: Math.max(1, Math.round(srcW)), height: Math.max(1, Math.round(srcH)) };
  }

  const srcAspect = srcW / srcH;

  if (Math.abs(srcAspect - aspect) < 1e-6) {
    return {
      x: 0,
      y: 0,
      width: Math.round(srcW),
      height: Math.round(srcH),
    };
  }

  if (srcAspect > aspect) {
    // Source is wider than target aspect ratio: crop sides
    const height = Math.round(srcH);
    const width = Math.round(srcH * aspect);
    const x = Math.round((srcW - width) / 2);
    return { x, y: 0, width, height };
  }

  // Source is taller than target aspect ratio: crop top/bottom
  const width = Math.round(srcW);
  const height = Math.round(srcW / aspect);
  const y = Math.round((srcH - height) / 2);
  return { x: 0, y, width, height };
}

