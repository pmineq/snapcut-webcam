import strawberry from "@/assets/frames/strawberry.png";
import kitty from "@/assets/frames/kitty.png";
import zzal1 from "@/assets/frames/zzal1.png";


export const FRAMES = {
  none: {
    label: "없음",
    src: null,
    thumbSrc: null,
  },
  strawberry: {
    label: "딸기",
    src: strawberry,
    thumbSrc: strawberry,
  },
  kitty: {
    label: "키티",
    src: kitty,
    thumbSrc: kitty,
  },
  zzal1: {
    label: "조크든요",
    src: zzal1,
    thumbSrc: zzal1
  }
} as const;

export type FrameKey = keyof typeof FRAMES;
