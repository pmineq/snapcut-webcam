import { FILTERS, type FilterKey } from "@/utils/filters";

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

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const scale = Math.max(width / vw, height / vh);
  const sw = width / scale;
  const sh = height / scale;
  const sx = (vw - sw) / 2;
  const sy = (vh - sh) / 2;

  ctx.filter = FILTERS[filter]?.value ?? "none";

  // 디폴트 좌우반전
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, width, height);

  ctx.restore();
  ctx.filter = "none";

  if (frameImage) {
    ctx.drawImage(frameImage, 0, 0, width, height);
  }

  return canvas.toDataURL("image/png");
}
