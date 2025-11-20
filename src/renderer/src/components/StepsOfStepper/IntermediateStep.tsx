import React from 'react';
import { Button, Text } from '@blueprintjs/core';
import { Col, Row } from 'react-flexbox-grid';
import { useTranslation } from 'react-i18next';
import ScanQRStep from './ScanQRStep';
import ChooseAppOrScreenStep from './ChooseAppOrScreenStep';
import ConfirmStep from './ConfirmStep';
import { Device } from '../../../../common/Device';
import { IpcEvents } from '../../../../common/IpcEvents.enum';

interface IntermediateStepProps {
	activeStep: number;
	steps: string[];
	handleBack: () => void;
	handleNextEntireScreen: () => void;
	handleNextApplicationWindow: () => void;
	resetPendingConnectionDevice: () => void;
	resetUserAllowedConnection: () => void;
	connectedDevice: Device | null;
	handleReset: () => void;
}

function getStepContent(
	t: ReturnType<typeof useTranslation>['t'],
	stepIndex: number,
	handleNextEntireScreen: () => void,
	handleNextApplicationWindow: () => void,
	connectedDevice: Device | null,
): React.ReactNode {
	switch (stepIndex) {
		case 0:
			return <ScanQRStep />;
		case 1:
			return (
				<>
					<Row center="xs">
						<div style={{ marginBottom: '10px' }}>
							<Text>
								{t('choose-entire-screen-or-app-window-you-want-to-share')}
							</Text>
						</div>
					</Row>
					<ChooseAppOrScreenStep
						handleNextEntireScreen={handleNextEntireScreen}
						handleNextApplicationWindow={handleNextApplicationWindow}
					/>
				</>
			);
		case 2:
			return <ConfirmStep device={connectedDevice} />;
		default:
			return 'Unknown stepIndex';
	}
}

function isConfirmStep(activeStep: number, steps: string[]): boolean {
	return activeStep === steps.length - 1;
}

export default function IntermediateStep(
	props: IntermediateStepProps,
): React.ReactElement {
	const { t } = useTranslation();

	const {
		activeStep,
		steps,
		handleBack,
		handleNextEntireScreen,
		handleNextApplicationWindow,
		resetPendingConnectionDevice,
		resetUserAllowedConnection,
		connectedDevice,
		handleReset,
	} = props;

	return (
		<Col
			xs={12}
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				height: '260px',
				width: '100%',
			}}
		>
			{getStepContent(
				t,
				activeStep,
				handleNextEntireScreen,
				handleNextApplicationWindow,
				connectedDevice,
			)}
			{process.env.NODE_ENV === 'production' &&
			process.env.RUN_MODE !== 'dev' &&
			process.env.RUN_MODE !== 'test' ? (
				<></>
			) : activeStep === 0 ? (
				<Button
					onClick={() => {
						// connectedDevicesService.setPendingConnectionDevice(DEVICES[Math.floor(Math.random() * DEVICES.length)]);
					}}
				>
					Connect Test Device
				</Button>
			) : (
				<></>
			)}
			{activeStep !== 0 ? (
				<Row>
					<Col xs={12}>
						<Button
							intent={activeStep === 2 ? 'success' : 'none'}
							onClick={async () => {
								if (isConfirmStep(activeStep, steps)) {
									window.electron.ipcRenderer.invoke(
										IpcEvents.StartSharingOnWaitingForConnectionSharingSession,
									);
									resetPendingConnectionDevice();
									resetUserAllowedConnection();
								}
								setTimeout(() => {
									handleReset();
								}, 1000);
							}}
							style={{
								display: activeStep === 1 ? 'none' : 'inline',
								borderRadius: '100px',
								width: '300px',
								textAlign: 'center',
							}}
							rightIcon={
								isConfirmStep(activeStep, steps)
									? 'small-tick'
									: 'chevron-right'
							}
						>
							{isConfirmStep(activeStep, steps)
								? t('confirm-button-text')
								: t('next')}
						</Button>
					</Col>
				</Row>
			) : (
				<></>
			)}
			<Row style={{ display: activeStep === 2 ? 'inline-block' : 'none' }}>
				<Button
					intent="danger"
					style={{
						marginTop: '10px',
						borderRadius: '100px',
					}}
					onClick={handleBack}
					icon="chevron-left"
					text={t('no-i-need-to-choose-other')}
				/>
			</Row>
		</Col>
	);
}
