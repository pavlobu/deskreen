import { Row, Col } from 'react-flexbox-grid';
import { Icon, Text, Button, Popover, Tooltip } from '@blueprintjs/core';
import DeviceInfoCallout from '../DeviceInfoCallout';
import { Device } from '../../../../common/Device';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

interface DeviceConnectedInfoButtonProps {
	device: Device;
	onDisconnect: () => void;
}

const getDeviceConnectedPopoverContent = (
	pendingConnectionDevice: Device,
	handleDisconnect: () => void,
	t: TFunction,
) => {
	const disconnectButtonText = t('disconnect');

	return (
		<Row>
			<div style={{ padding: '20px', borderRadius: '100px' }}>
				<Row style={{ margin: '0 px 10px 10px 10px' }}>
					<DeviceInfoCallout
						deviceType={pendingConnectionDevice?.deviceType}
						deviceIP={pendingConnectionDevice?.deviceIP}
						deviceOS={pendingConnectionDevice?.deviceOS}
						deviceBrowser={pendingConnectionDevice?.deviceBrowser}
						deviceRoomId={pendingConnectionDevice?.deviceRoomId}
					/>
				</Row>
				<Row>
					<Col xs={12}>
						<Button
							intent="danger"
							icon="disable"
							onClick={() => {
								handleDisconnect();
							}}
							style={{ width: '100%', borderRadius: '100px' }}
						>
							{disconnectButtonText}
						</Button>
					</Col>
				</Row>
			</div>
		</Row>
	);
};

export default function DeviceConnectedInfoButton(
	props: DeviceConnectedInfoButtonProps,
) {
	const { device, onDisconnect } = props;
	const { t } = useTranslation();

	return (
		<>
			<Popover
				content={getDeviceConnectedPopoverContent(device, onDisconnect, t)}
				position="bottom"
				transitionDuration={0}
			>
				<Tooltip
					content={<Text>Click to see more</Text>}
					position="right"
					hoverOpenDelay={400}
				>
					<Button
						id="connected-device-info-stepper-button"
						intent="success"
						style={{
							width: '150px',
							height: '10px !important',
							borderRadius: '100px',
							position: 'relative',
							margin: '0 auto',
						}}
					>
						<Row>
							<Col xs={1}>
								<Icon icon="info-sign" />
							</Col>
							<Col xs>
								<Text>{t('connected')}</Text>
							</Col>
						</Row>
					</Button>
				</Tooltip>
			</Popover>
		</>
	);
}
