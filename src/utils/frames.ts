import strawberry from "@/assets/frames/strawberry.png";
import kitty from "@/assets/frames/kitty.png";


export const FRAMES = {
  none: {
    label: "없음",
    src: null,
    thumbSrc: null,
  },
  tomato: {
    label: "딸기",
    src: strawberry,
    thumbSrc: strawberry,
  },
  bunny: {
    label: "키티",
    src: kitty,
    thumbSrc: kitty,
  },
} as const;

export type FrameKey = keyof typeof FRAMES;
