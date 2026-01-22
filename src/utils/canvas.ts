import type { FilterKey } from "@/utils/filters";
import { applyFilterToImageData } from "@/utils/imageFilters";

export type CaptureOptions = {
  width: number;
  height: number;
  filter: FilterKey;
  frameImage?: HTMLImageElement | null;
};

export function captureToPngDataUrl(video: HTMLVideoElement, options: CaptureOptions) {
  const { width, height, filter, frameImage } = options;

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) throw new Error("Video metadata not ready");

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context not available");

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const scale = Math.max(width / vw, height / vh);
  const sw = width / scale;
  const sh = height / scale;
  const sx = (vw - sw) / 2;
  const sy = (vh - sh) / 2;

  // 디폴트 좌우반전
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, width, height);

  ctx.restore();

  // iOS Safari 호환을 위해 ImageData를 직접 조작하여 필터 적용
  if (filter !== "none") {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const filteredData = applyFilterToImageData(imageData, filter);
    ctx.putImageData(filteredData, 0, 0);
  }

  if (frameImage) {
    ctx.drawImage(frameImage, 0, 0, width, height);
  }

  return canvas.toDataURL("image/png");
}
