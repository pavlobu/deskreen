export const ScreenSharingSource = {
  WINDOW: 'window',
  SCREEN: 'screen',
} as const;

export type ScreenSharingSourceType = typeof ScreenSharingSource[keyof typeof ScreenSharingSource];
