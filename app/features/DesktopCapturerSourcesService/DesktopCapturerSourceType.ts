enum DesktopCapturerSourceType {
  WINDOW,
  SCREEN,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDesktopCapturerSourceTypeFromSourceID = (_id: string) => {
  // TODO: implement this function!
  return DesktopCapturerSourceType.WINDOW;
};

export default DesktopCapturerSourceType;
