export default (url: MediaStream | null) => {
	return () => {
		if (url !== null) {
			setTimeout(() => {
				// @ts-ignore
				document.querySelector('.container > div:nth-child(1)').style.display =
					'none';
			}, 1000);
		}
	};
};
