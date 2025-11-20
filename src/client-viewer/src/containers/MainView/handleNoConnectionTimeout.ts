import { DUMMY_MY_DEVICE_DETAILS } from '../../constants/appConstants';

export default (
	myDeviceDetails: DeviceDetails,
	setIsErrorDialogOpen: (_: boolean) => void,
) => {
	return () => {
		const timeout = setTimeout(() => {
			if (myDeviceDetails === DUMMY_MY_DEVICE_DETAILS) {
				setIsErrorDialogOpen(true);
			}
		}, 10000);
		return () => {
			clearTimeout(timeout);
		};
	};
};
