import { FILTERS, type FilterKey } from "@/utils/filters";

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

  // 좌우반전
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);

  ctx.filter = FILTERS[filter]?.value ?? "none";
  ctx.drawImage(video, 0, 0, width, height);

  ctx.restore(); // 좌우반전 종료

  // 프레임은 정상 방향으로 덮기
  if (frameImage) {
    ctx.drawImage(frameImage, 0, 0, width, height);
  }

  return canvas.toDataURL("image/png");
}
