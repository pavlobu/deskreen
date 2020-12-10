export default (
  url: undefined | MediaStream
) => {
  return () => {
    if (url !== undefined) {
      setTimeout(() => {
        // @ts-ignore
        document.querySelector('.container > .react-reveal').style.display =
          'none';
      }, 1000);
    }
  };
};
