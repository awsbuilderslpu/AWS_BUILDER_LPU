// To add an image: put the original in art-source/, then run npm run art.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ART_SOURCE_DIR = path.resolve(process.cwd(), "art-source");
const OUTPUT_DIR = path.resolve(process.cwd(), "public", "images", "artwork");
const READY_JSON_PATH = path.resolve(process.cwd(), "src", "data", "artwork-ready.json");

const MAX_WIDTHS = {
  "globe-tall": 1200,
  "events-cubes": 1000,
  "blogs-laptop": 1200,
  "contact-scene": 1200,
  "campus-night": 1800,
};

const DEFAULT_MAX_WIDTH = 1600;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function processImage(fileName) {
  const sourcePath = path.join(ART_SOURCE_DIR, fileName);
  const ext = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, path.extname(fileName));
  const outputName = baseName.toLowerCase().replace(/\s+/g, "-");
  const outputFile = path.join(OUTPUT_DIR, `${outputName}.webp`);

  const isPhoto = ext === ".jpg" || ext === ".jpeg" || outputName === "campus-night";
  const mode = isPhoto ? "photo" : "glow";
  const maxWidth = MAX_WIDTHS[outputName] || DEFAULT_MAX_WIDTH;

  const srcMetadata = await sharp(sourcePath).metadata();
  const srcStats = fs.statSync(sourcePath);
  const srcSizeDisplay = `${srcMetadata.width}x${srcMetadata.height} (${(srcStats.size / 1024).toFixed(1)} KB)`;

  let checkResult = "OK";
  let borderWarning = null;

  if (mode === "photo") {
    await sharp(sourcePath)
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputFile);
    checkResult = "OK";
  } else {
    // Glow mode
    const { data, info } = await sharp(sourcePath)
      .flatten({ background: "#000000" })
      .resize({ width: maxWidth, withoutEnlargement: true })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;

    // Check (a): Sample the four border lines of the source
    const borderIndices = new Set();
    for (let x = 0; x < width; x++) {
      borderIndices.add((0 * width + x) * channels); // Top
      borderIndices.add(((height - 1) * width + x) * channels); // Bottom
    }
    for (let y = 0; y < height; y++) {
      borderIndices.add((y * width + 0) * channels); // Left
      borderIndices.add((y * width + (width - 1)) * channels); // Right
    }

    let borderAbove24 = 0;
    for (const idx of borderIndices) {
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const m = Math.max(r, g, b);
      if (m > 24) {
        borderAbove24++;
      }
    }

    const borderRatio = borderAbove24 / borderIndices.size;
    if (borderRatio > 0.02) {
      borderWarning = `WARN: ${(borderRatio * 100).toFixed(1)}% border pixels > 24`;
      console.warn(`\n[WARNING] ${outputName}: background is not flat black (${(borderRatio * 100).toFixed(1)}% border pixels > 24). A faint box may be visible.`);
    }

    // Glow transformation
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const m = Math.max(r, g, b);

      if (m <= 6) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
      } else {
        const alpha = clamp((m - 6) / (255 - 6), 0, 1);
        const scale = 255 / m;
        data[i] = Math.min(255, Math.round(r * scale));
        data[i + 1] = Math.min(255, Math.round(g * scale));
        data[i + 2] = Math.min(255, Math.round(b * scale));
        data[i + 3] = Math.round(alpha * 255);
      }
    }

    await sharp(data, {
      raw: {
        width,
        height,
        channels: 4,
      },
    })
      .webp({
        quality: 88,
        alphaQuality: 100,
        smartSubsample: true,
      })
      .toFile(outputFile);

    // Check (b): Read output's four corner pixels back
    const outputCornerCheck = await sharp(outputFile).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const cData = outputCornerCheck.data;
    const cWidth = outputCornerCheck.info.width;
    const cHeight = outputCornerCheck.info.height;
    const cChannels = outputCornerCheck.info.channels;

    const corners = [
      0, // top-left
      (cWidth - 1) * cChannels, // top-right
      ((cHeight - 1) * cWidth) * cChannels, // bottom-left
      ((cHeight - 1) * cWidth + (cWidth - 1)) * cChannels, // bottom-right
    ];

    const allCornersAlphaZero = corners.every((idx) => cData[idx + 3] === 0);
    checkResult = allCornersAlphaZero ? (borderWarning ? borderWarning : "OK") : "WARN (corners not transparent)";
  }

  const outStats = fs.statSync(outputFile);
  const outSizeKb = (outStats.size / 1024).toFixed(1);

  return {
    name: `${outputName}.webp`,
    mode,
    sourceSize: srcSizeDisplay,
    outputSize: `${outSizeKb} KB`,
    checkResult,
  };
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(path.dirname(READY_JSON_PATH))) {
    fs.mkdirSync(path.dirname(READY_JSON_PATH), { recursive: true });
  }

  const validExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
  let sourceFiles = [];

  if (fs.existsSync(ART_SOURCE_DIR)) {
    sourceFiles = fs
      .readdirSync(ART_SOURCE_DIR)
      .filter((file) => validExtensions.has(path.extname(file).toLowerCase()));
  }

  const results = [];

  if (sourceFiles.length === 0) {
    console.log("Note: art-source/ is empty or contains no supported image files (.png, .jpg, .jpeg, .webp).");
  } else {
    for (const file of sourceFiles) {
      try {
        const row = await processImage(file);
        results.push(row);
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }

    console.log("\nArtwork Processing Summary:");
    console.table(results);
  }

  // Update src/data/artwork-ready.json with sorted list of all .webp files in public/images/artwork/
  const readyFiles = fs
    .readdirSync(OUTPUT_DIR)
    .filter((file) => file.endsWith(".webp"))
    .sort();

  fs.writeFileSync(READY_JSON_PATH, JSON.stringify(readyFiles, null, 2) + "\n", "utf-8");
  console.log(`Updated ${path.relative(process.cwd(), READY_JSON_PATH)} (${readyFiles.length} file(s) ready).\n`);
}

main().catch((err) => {
  console.error("Fatal error processing artwork:", err);
  process.exit(1);
});
