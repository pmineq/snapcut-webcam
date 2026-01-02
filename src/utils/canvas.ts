import { FILTERS, type FilterKey } from "@/utils/filters";

export type CaptureOptions = {
  width: number;
  height: number;
  filter: FilterKey;
  frameImage?: HTMLImageElement | null;
};

export function captureToPngDataUrl(
  video: HTMLVideoElement,
  options: CaptureOptions
) {
  const { width, height, filter, frameImage } = options;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  ctx.filter = FILTERS[filter]?.value ?? "none";
  ctx.drawImage(video, 0, 0, width, height);

  ctx.filter = "none";
  if (frameImage) {
    ctx.drawImage(frameImage, 0, 0, width, height);
  }

  return canvas.toDataURL("image/png");
}
