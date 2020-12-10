export default (
  params: handleDisplayingLoadingSharingIconLoopParams
) => {
  const {
    promptStep,
    url,
    setIsShownLoadingSharingIcon,
    loadingSharingIconType,
    isShownLoadingSharingIcon,
    setLoadingSharingIconType,
  } = params;
  return () => {
    let interval: NodeJS.Timeout;
    if (promptStep === 3 && url === undefined) {
      setIsShownLoadingSharingIcon(true);

      let currentIcon = loadingSharingIconType;
      let isShownIcon = isShownLoadingSharingIcon;
      let isShownWithFadingUIEffect = false;
      interval = setInterval(() => {
        isShownIcon = !isShownIcon;
        setIsShownLoadingSharingIcon(isShownIcon);
        if (isShownWithFadingUIEffect) {
          currentIcon = currentIcon === 'desktop' ? 'application' : 'desktop';
          setLoadingSharingIconType(currentIcon);
          isShownWithFadingUIEffect = false;
        } else {
          isShownWithFadingUIEffect = true;
        }
      }, 1500);
    }

    return () => {
      clearInterval(interval);
    };
  };
};
