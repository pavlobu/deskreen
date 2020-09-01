/* eslint-disable react/destructuring-assignment */
import React, { useContext } from 'react';
import { Button } from '@blueprintjs/core';
import { Col } from 'react-flexbox-grid';
import DEVICES from '../../constants/test-devices.json';
import ScanQRStep from './ScanQRStep';
import ChooseAppOrScreeenStep from './ChooseAppOrScreeenStep';
import ConfirmStep from './ConfirmStep';
import { ConnectedDevicesContext } from '../../containers/ConnectedDevicesProvider';

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
  stepIndex: number,
  handleNextEntireScreen: () => void,
  handleNextApplicationWindow: () => void,
  pendingConnectionDevice: Device | null
) {
  switch (stepIndex) {
    case 0:
      return <ScanQRStep />;
    case 1:
      return (
        <ChooseAppOrScreeenStep
          handleNextEntireScreen={handleNextEntireScreen}
          handleNextApplicationWindow={handleNextApplicationWindow}
        />
      );
    case 2:
      return <ConfirmStep device={pendingConnectionDevice} />;
    default:
      return 'Unknown stepIndex';
  }
}

function isConfirmStep(activeStep: number, steps: string[]) {
  return activeStep === steps.length - 1;
}

export default function IntermediateStep(props: IntermediateStepProps) {
  const {
    devices,
    setPendingConnectionDeviceHook,
    setDevicesHook,
    pendingConnectionDevice,
    resetPendingConnectionDeviceHook,
  } = useContext(ConnectedDevicesContext);

  const connectDevice = (device: Device) => {
    setPendingConnectionDeviceHook(device);
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
      }}
    >
      {getStepContent(
        props.activeStep,
        props.handleNextEntireScreen,
        props.handleNextApplicationWindow,
        pendingConnectionDevice
      )}

      {
        /* TODO: (REMOVE: process.env.NODE_ENV === 'production') !!!!!!!!!)
        Connect Test Device button, displayed only when RUN_MODE is 'dev' or 'test' */
        props.activeStep === 0 &&
        (process.env.RUN_MODE === 'dev' ||
          process.env.RUN_MODE === 'test' ||
          process.env.NODE_ENV === 'production') ? (
          // eslint-disable-next-line react/jsx-indent
          <Button
            onClick={() => {
              connectDevice(
                DEVICES[Math.floor(Math.random() * DEVICES.length)]
              );
            }}
          >
            Connect Test Device
          </Button>
        ) : (
          <></>
        )
      }
      {
        /**/
        props.activeStep !== 0 ? (
          <Button
            intent={props.activeStep === 2 ? 'success' : 'none'}
            onClick={() => {
              props.handleNext();
              if (isConfirmStep(props.activeStep, props.steps)) {
                setDevicesHook([...devices, pendingConnectionDevice as Device]);
                resetPendingConnectionDeviceHook();
                props.resetPendingConnectionDevice();
                props.resetUserAllowedConnection();
              }
            }}
            style={{
              display: props.activeStep === 1 ? 'none' : 'inline',
              borderRadius: '100px',
              width: '100%',
              textAlign: 'center',
            }}
            rightIcon={
              isConfirmStep(props.activeStep, props.steps)
                ? 'small-tick'
                : 'chevron-right'
            }
          >
            {isConfirmStep(props.activeStep, props.steps) ? 'Confirm' : 'Next'}
          </Button>
        ) : (
          <></>
        )
      }
      <Button
        intent="danger"
        style={{
          marginTop: '10px',
          display: props.activeStep === 2 ? 'inline-block' : 'none',
          borderRadius: '100px',
        }}
        onClick={props.handleBack}
        icon="chevron-left"
        text="No, I need to share other thing"
      />
    </Col>
  );
}
