import React from 'react';
import { ipcRenderer } from 'electron';
import { Button, Text } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Col, Row } from 'react-flexbox-grid';
import ScanQRStep from './ScanQRStep';
import ChooseAppOrScreeenStep from './ChooseAppOrScreeenStep';
import ConfirmStep from './ConfirmStep';
import { IpcEvents } from '../../main/IpcEvents.enum';

interface IntermediateStepProps {
  activeStep: number;
  steps: string[];
  handleNext: () => void;
  handleBack: () => void;
  handleNextEntireScreen: () => void;
  handleNextApplicationWindow: () => void;
  resetPendingConnectionDevice: () => void;
  resetUserAllowedConnection: () => void;
  connectedDevice: Device | null;
}

function getStepContent(
  t: TFunction,
  stepIndex: number,
  handleNextEntireScreen: () => void,
  handleNextApplicationWindow: () => void,
  connectedDevice: Device | null
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
    case 2:
      return <ConfirmStep device={connectedDevice} />;
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
    connectedDevice,
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
        connectedDevice
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
              // connectedDevicesService.setPendingConnectionDevice(DEVICES[Math.floor(Math.random() * DEVICES.length)]);
            }}
          >
            Connect Test Device
          </Button>
        ) : (
          <></>
        )
      }
      {activeStep !== 0 ? (
        <Row>
          <Col xs={12}>
            <Button
              intent={activeStep === 2 ? 'success' : 'none'}
              onClick={async () => {
                handleNext();
                if (isConfirmStep(activeStep, steps)) {
                  ipcRenderer.invoke(
                    IpcEvents.StartSharingOnWaitingForConnectionSharingSession
                  );
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
          text={t('No, I need to choose other')}
        />
      </Row>
    </Col>
  );
}
