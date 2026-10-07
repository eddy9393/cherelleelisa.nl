import sharp from "sharp";
import { existsSync, renameSync, rmSync } from "node:fs";

const keepSources = process.argv.includes("--keep-sources");

const images = [
  {
    input: "public/Herkenning.jpg",
    output: "public/Herkenning.webp",
    maxSize: 1900,
    quality: 82,
    removeSource: true,
  },
  {
    input: "public/Thuiskomen.jpg",
    output: "public/Thuiskomen.webp",
    maxSize: 2200,
    quality: 82,
    removeSource: true,
  },
  {
    input: "public/HeroCherelle.webp",
    output: "public/HeroCherelle.webp",
    maxSize: 2560,
    quality: 82,
    removeSource: false,
  },
  {
    input: "public/Overmij.webp",
    output: "public/Overmij.webp",
    maxSize: 2200,
    quality: 82,
    removeSource: false,
  },
];

async function optimizeImage({ input, output, maxSize, quality, removeSource }) {
  if (!existsSync(input)) {
    if (existsSync(output)) {
      console.log(`✓ ${output} bestaat al`);
      return;
    }

    throw new Error(`Bronafbeelding ontbreekt: ${input}`);
  }

  const sameFile = input === output;
  const target = sameFile ? `${output}.tmp.webp` : output;

  await sharp(input)
    .rotate()
    .resize({
      width: maxSize,
      height: maxSize,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 5,
      smartSubsample: true,
    })
    .toFile(target);

  if (sameFile) {
    renameSync(target, output);
  }

  if (!keepSources && removeSource && input !== output && existsSync(input)) {
    rmSync(input);
  }

  console.log(`✓ geoptimaliseerd: ${output}`);
}

for (const image of images) {
  await optimizeImage(image);
}
