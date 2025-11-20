import React from 'react';
import { Intent, Alert, H4 } from '@blueprintjs/core';
import DeviceInfoCallout from './DeviceInfoCallout';
import { Device } from '../../../common/Device';
import { useTranslation } from 'react-i18next';

interface AllowConnectionForDeviceAlertProps {
	device: Device | null;
	isOpen: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}

const AllowConnectionForDeviceAlert: React.FC<
	AllowConnectionForDeviceAlertProps
> = (props) => {
	const { device, isOpen, onCancel, onConfirm } = props;
	const { t } = useTranslation();
	const denyText = t('deny');
	const allowText = t('allow');

	return (
		<Alert
			className="class-allow-device-to-connect-alert rounded-pill-alert"
			cancelButtonText={denyText}
			confirmButtonText={allowText}
			icon="feed"
			intent={Intent.DANGER}
			isOpen={isOpen}
			onCancel={onCancel}
			onConfirm={onConfirm}
			transitionDuration={0}
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			usePortal={false}
		>
			<H4>{t('someone-is-trying-to-connect-do-you-allow')}</H4>
			<DeviceInfoCallout
				deviceType={device?.deviceType}
				deviceIP={device?.deviceIP}
				deviceOS={device?.deviceOS}
				deviceBrowser={device?.deviceBrowser}
				deviceRoomId={device?.deviceRoomId}
			/>
		</Alert>
	);
};

export default AllowConnectionForDeviceAlert;
