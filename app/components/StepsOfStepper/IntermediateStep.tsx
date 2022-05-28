import React from 'react';
// import { remote } from 'electron';
import { Button, Text } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Col, Row } from 'react-flexbox-grid';
import DEVICES from '../../constants/test-devices.json';
import ScanQRStep from './ScanQRStep';
import ChooseAppOrScreeenStep from './ChooseAppOrScreeenStep';
import ConfirmStep from './ConfirmStep';
import ConnectedDevicesService from '../../features/ConnectedDevicesService';
import SharingSessionService from '../../features/SharingSessionService';

// const sharingSessionService = remote.getGlobal(
//   'sharingSessionService'
// ) as SharingSessionService;
// const connectedDevicesService = remote.getGlobal(
//   'connectedDevicesService'
// ) as ConnectedDevicesService;

interface IntermediateStepProps {
  activeStep: number;
  steps: string[];
  handleNext: () => void;
  handleBack: () => void;
  handleNextEntireScreen: () => void;
  handleNextApplicationWindow: () => void;
  resetPendingConnectionDevice: () => void;
  resetUserAllowedConnection: () => void;
}

function getStepContent(
  t: TFunction,
  stepIndex: number,
  handleNextEntireScreen: () => void,
  handleNextApplicationWindow: () => void
  // pendingConnectionDevice: Device | null
) {
  switch (stepIndex) {
    case 0:
      return <ScanQRStep />;
    case 1:
      return (
        <>
          <Row center="xs">
            <div style={{ marginBottom: '10px' }}>
              <Text>
                {t('Choose Entire Screen or App window you want to share')}
              </Text>
            </div>
          </Row>
          <ChooseAppOrScreeenStep
            handleNextEntireScreen={handleNextEntireScreen}
            handleNextApplicationWindow={handleNextApplicationWindow}
          />
        </>
      );
    // case 2:
    //   return <ConfirmStep device={pendingConnectionDevice} />;
    default:
      return 'Unknown stepIndex';
  }
}

function isConfirmStep(activeStep: number, steps: string[]) {
  return activeStep === steps.length - 1;
}

export default function IntermediateStep(props: IntermediateStepProps) {
  const { t } = useTranslation();

  const {
    activeStep,
    steps,
    handleNext,
    handleBack,
    handleNextEntireScreen,
    handleNextApplicationWindow,
    resetPendingConnectionDevice,
    resetUserAllowedConnection,
  } = props;

  const connectDevice = (device: Device) => {
    // connectedDevicesService.setPendingConnectionDevice(device);
  };

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
        handleNextApplicationWindow
        // connectedDevicesService.pendingConnectionDevice
      )}

      {
        // eslint-disable-next-line no-nested-ternary
        process.env.NODE_ENV === 'production' &&
        process.env.RUN_MODE !== 'dev' &&
        process.env.RUN_MODE !== 'test' ? (
          <></>
        ) : activeStep === 0 ? (
          // eslint-disable-next-line react/jsx-indent
          <Button
            onClick={() => {
              connectDevice(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                DEVICES[Math.floor(Math.random() * DEVICES.length)]
              );
            }}
          >
            Connect Test Device
          </Button>
        ) : (
          <></>
        )
        // activeStep === 0 ? (
        //   <Button
        //     onClick={() => {
        //       connectDevice(
        //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //         // @ts-ignore
        //         DEVICES[Math.floor(Math.random() * DEVICES.length)]
        //       );
        //     }}
        //   >
        //     Connect Test Device
        //   </Button>
        // ) : (
        //   <></>
        // )
      }
      {
        /**/
        activeStep !== 0 ? (
          <Row>
            <Col xs={12}>
              <Button
                intent={activeStep === 2 ? 'success' : 'none'}
                onClick={async () => {
                  handleNext();
                  if (isConfirmStep(activeStep, steps)) {
                    // if (
                    //   sharingSessionService.waitingForConnectionSharingSession !==
                    //   null
                    // ) {
                    //   const sharingSession =
                    //     sharingSessionService.waitingForConnectionSharingSession;
                    //   sharingSession.callPeer();
                    //   sharingSessionService.changeSharingSessionStatusToSharing(
                    //     sharingSession
                    //   );
                    // }
                    // connectedDevicesService.addDevice(
                    //   connectedDevicesService.pendingConnectionDevice
                    // );
                    // connectedDevicesService.resetPendingConnectionDevice();
                    resetPendingConnectionDevice();
                    resetUserAllowedConnection();
                  }
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
                  ? t('Confirm Button Text')
                  : 'Next'}
              </Button>
            </Col>
          </Row>
        ) : (
          <></>
        )
      }
      <Row style={{ display: activeStep === 2 ? 'inline-block' : 'none' }}>
        <Button
          intent="danger"
          style={{
            marginTop: '10px',
            borderRadius: '100px',
          }}
          onClick={handleBack}
          icon="chevron-left"
          text={t('No, I need to choose other')}
        />
      </Row>
    </Col>
  );
}
