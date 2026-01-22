import type { FilterKey } from "./filters";

export function applyFilterToImageData(
  imageData: ImageData,
  filter: FilterKey
): ImageData {
  const data = imageData.data;
  const pixels = data.length / 4;

  switch (filter) {
    case "none":
      return imageData;

    case "mono": {
      // Grayscale with slight contrast boost
      for (let i = 0; i < pixels; i++) {
        const idx = i * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Standard grayscale formula
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Contrast boost (1.1)
        const adjusted = ((gray - 128) * 1.1 + 128);

        data[idx] = data[idx + 1] = data[idx + 2] = Math.max(0, Math.min(255, adjusted));
      }
      break;
    }

    case "warm": {
      // Sepia effect with saturation boost
      for (let i = 0; i < pixels; i++) {
        const idx = i * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Sepia transformation
        let newR = r * 0.393 + g * 0.769 + b * 0.189;
        let newG = r * 0.349 + g * 0.686 + b * 0.168;
        let newB = r * 0.272 + g * 0.534 + b * 0.131;

        // Light sepia (0.25 mix)
        newR = r * 0.75 + newR * 0.25;
        newG = g * 0.75 + newG * 0.25;
        newB = b * 0.75 + newB * 0.25;

        // Saturation boost (1.2)
        const gray = 0.299 * newR + 0.587 * newG + 0.114 * newB;
        newR = gray + (newR - gray) * 1.2;
        newG = gray + (newG - gray) * 1.2;
        newB = gray + (newB - gray) * 1.2;

        data[idx] = Math.max(0, Math.min(255, newR));
        data[idx + 1] = Math.max(0, Math.min(255, newG));
        data[idx + 2] = Math.max(0, Math.min(255, newB));
      }
      break;
    }

    case "cool": {
      // Hue rotate 180deg + saturation
      for (let i = 0; i < pixels; i++) {
        const idx = i * 4;
        const r = data[idx] / 255;
        const g = data[idx + 1] / 255;
        const b = data[idx + 2] / 255;

        // Convert to HSL
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

          switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
          }
        }

        // Rotate hue by 180 degrees
        h = (h + 0.5) % 1;

        // Boost saturation (1.1)
        s = Math.min(1, s * 1.1);

        // Convert back to RGB
        const { r: newR, g: newG, b: newB } = hslToRgb(h, s, l);

        data[idx] = newR;
        data[idx + 1] = newG;
        data[idx + 2] = newB;
      }
      break;
    }

    case "vivid": {
      // Saturation and contrast boost
      for (let i = 0; i < pixels; i++) {
        const idx = i * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Saturation boost (1.4)
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        let newR = gray + (r - gray) * 1.4;
        let newG = gray + (g - gray) * 1.4;
        let newB = gray + (b - gray) * 1.4;

        // Contrast boost (1.15)
        newR = ((newR - 128) * 1.15 + 128);
        newG = ((newG - 128) * 1.15 + 128);
        newB = ((newB - 128) * 1.15 + 128);

        data[idx] = Math.max(0, Math.min(255, newR));
        data[idx + 1] = Math.max(0, Math.min(255, newG));
        data[idx + 2] = Math.max(0, Math.min(255, newB));
      }
      break;
    }

    case "retro": {
      // Sepia with slight contrast
      for (let i = 0; i < pixels; i++) {
        const idx = i * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Sepia transformation
        let newR = r * 0.393 + g * 0.769 + b * 0.189;
        let newG = r * 0.349 + g * 0.686 + b * 0.168;
        let newB = r * 0.272 + g * 0.534 + b * 0.131;

        // Mix with original (0.4 sepia)
        newR = r * 0.6 + newR * 0.4;
        newG = g * 0.6 + newG * 0.4;
        newB = b * 0.6 + newB * 0.4;

        // Contrast boost (1.05)
        newR = ((newR - 128) * 1.05 + 128);
        newG = ((newG - 128) * 1.05 + 128);
        newB = ((newB - 128) * 1.05 + 128);

        data[idx] = Math.max(0, Math.min(255, newR));
        data[idx + 1] = Math.max(0, Math.min(255, newG));
        data[idx + 2] = Math.max(0, Math.min(255, newB));
      }
      break;
    }

    case "soft": {
      // Slight brightness and reduced contrast
      for (let i = 0; i < pixels; i++) {
        const idx = i * 4;
        let r = data[idx];
        let g = data[idx + 1];
        let b = data[idx + 2];

        // Brightness boost (1.05)
        r *= 1.05;
        g *= 1.05;
        b *= 1.05;

        // Contrast reduction (0.95)
        r = ((r - 128) * 0.95 + 128);
        g = ((g - 128) * 0.95 + 128);
        b = ((b - 128) * 0.95 + 128);

        data[idx] = Math.max(0, Math.min(255, r));
        data[idx + 1] = Math.max(0, Math.min(255, g));
        data[idx + 2] = Math.max(0, Math.min(255, b));
      }
      break;
    }
  }

  return imageData;
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}
