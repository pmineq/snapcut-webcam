// Custom event types for the application
export const SNPCUT_EVENTS = {
  SNAP: 'SNPCUT_SNAP',
  START_CAMERA: 'SNPCUT_START_CAMERA',
  RESTART_CAMERA: 'SNPCUT_RESTART_CAMERA',
} as const;

export type SnpcutEventType = typeof SNPCUT_EVENTS[keyof typeof SNPCUT_EVENTS];
