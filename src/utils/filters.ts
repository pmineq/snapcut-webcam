export type FilterKey =
  | "none"
  | "mono"
  | "warm"
  | "cool"
  | "vivid"
  | "retro"
  | "soft";

export const FILTERS: Record<
  FilterKey,
  { label: string; value: string }
> = {
  none:   { label: "기본", value: "none" },
  mono:   { label: "흑백", value: "grayscale(1) contrast(1.1)" },
  warm:   { label: "웜", value: "sepia(10.25) saturate(1.2)" },
  cool:   { label: "쿨", value: "hue-rotate(180deg) saturate(1.1)" },
  vivid:  { label: "비비드", value: "saturate(1.4) contrast(1.15)" },
  retro:  { label: "레트로", value: "sepia(0.4) contrast(1.05)" },
  soft:   { label: "소프트", value: "brightness(1.05) contrast(0.95)" },
};
