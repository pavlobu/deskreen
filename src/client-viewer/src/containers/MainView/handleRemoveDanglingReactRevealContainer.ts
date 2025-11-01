export default (url: undefined | MediaStream) => {
  return () => {
    if (url !== undefined) {
      setTimeout(() => {
        // @ts-ignore
        document.querySelector('.container > div:nth-child(1)').style.display = 'none';
      }, 1000);
    }
  };
};
