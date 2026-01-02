export async function makeGridImageDataUrl(
  dataUrls: string[],
  opts: {
    cols: number;
    cellWidth: number;
    cellHeight: number;
    gap?: number;
    background?: string;
  }
) {
  const { cols, cellWidth, cellHeight, gap = 12, background = '#000' } = opts;

  const rows = Math.ceil(dataUrls.length / cols);
  const canvas = document.createElement('canvas');
  canvas.width = cols * cellWidth + gap * (cols - 1);
  canvas.height = rows * cellHeight + gap * (rows - 1);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const images = await Promise.all(dataUrls.map(loadImage));

  images.forEach((img, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = c * (cellWidth + gap);
    const y = r * (cellHeight + gap);
    ctx.drawImage(img, x, y, cellWidth, cellHeight);
  });

  return canvas.toDataURL('image/png');
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
