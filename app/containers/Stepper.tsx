/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useCallback, useContext, useEffect } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { Row, Col } from 'react-flexbox-grid';
import { Text } from '@blueprintjs/core';

import { useToasts } from 'react-toast-notifications';

import SuccessStep from '../components/StepsOfStepper/SuccessStep';
import IntermediateStep from '../components/StepsOfStepper/IntermediateStep';
import { ConnectedDevicesContext } from './ConnectedDevicesProvider';
import AllowConnectionForDeviceAlert from '../components/AllowConnectionForDeviceAlert';
import DeviceConnectedInfoButton from '../components/StepperPanel/DeviceConnectedInfoButton';
import ColorlibStepIcon, {
  StepIconPropsDeskreen,
} from '../components/StepperPanel/ColorlibStepIcon';
import ColorlibConnector from '../components/StepperPanel/ColorlibConnector';
import { SettingsContext } from './SettingsProvider';
import isProduction from '../utils/isProduction';

const Fade = require('react-reveal/Fade');
const Zoom = require('react-reveal/Zoom');
const Pulse = require('react-reveal/Pulse');

const useStyles = makeStyles(() =>
  createStyles({
    stepContent: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepLabelContent: {
      marginTop: '10px !important',
      height: '110px',
    },
    stepperComponent: {
      paddingBottom: '0px',
    },
  })
);

function getSteps() {
  return ['Connect', 'Select', 'Confirm'];
}

// eslint-disable-next-line react/display-name
const DeskreenStepper = React.forwardRef((_props, ref) => {
  const classes = useStyles();

  const [isInterShow, setIsInterShow] = useState(false);

  const { isDarkTheme } = useContext(SettingsContext);

  const { addToast } = useToasts();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isUserAllowedConnection, setIsUserAllowedConnection] = useState(false);

  const { addPendingConnectedDeviceListener } = useContext(
    ConnectedDevicesContext
  );

  const [
    pendingConnectionDevice,
    setPendingConnectionDevice,
  ] = useState<Device | null>(null);

  useEffect(() => {
    addPendingConnectedDeviceListener((device: Device) => {
      setPendingConnectionDevice(device);
      setIsAlertOpen(true);
    });

    setTimeout(
      () => {
        setIsInterShow(true);
      },
      isProduction() ? 500 : 0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeStep, setActiveStep] = useState(0);
  const [isEntireScreenSelected, setIsEntireScreenSelected] = useState(false);
  const [
    isApplicationWindowSelected,
    setIsApplicationWindowSelected,
  ] = useState(false);
  const steps = getSteps();

  const makeSmoothIntermediateStepTransition = () => {
    if (!isProduction()) return;
    setIsInterShow(false);
    setTimeout(() => {
      setIsInterShow(true);
    }, 500);
  };

  const handleNext = useCallback(() => {
    makeSmoothIntermediateStepTransition();
    if (activeStep === steps.length - 1) {
      setIsEntireScreenSelected(false);
      setIsApplicationWindowSelected(false);
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, [activeStep, steps]);

  const handleNextEntireScreen = useCallback(() => {
    makeSmoothIntermediateStepTransition();
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setIsEntireScreenSelected(true);
  }, []);

  const handleNextApplicationWindow = useCallback(() => {
    makeSmoothIntermediateStepTransition();
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setIsApplicationWindowSelected(true);
  }, []);

  const handleBack = useCallback(() => {
    makeSmoothIntermediateStepTransition();
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  const handleReset = useCallback(() => {
    makeSmoothIntermediateStepTransition();
    setActiveStep(0);
  }, []);

  React.useImperativeHandle(ref, () => ({
    handleReset() {
      handleReset();
    },
  }));

  const handleCancelAlert = () => {
    setIsAlertOpen(false);
  };

  const handleConfirmAlert = useCallback(() => {
    setIsAlertOpen(false);
    setIsUserAllowedConnection(true);
    handleNext();
  }, [handleNext]);

  const handleUserClickedDeviceDisconnectButton = useCallback(() => {
    handleReset();
    setPendingConnectionDevice(null);
    setIsUserAllowedConnection(false);

    addToast(
      <Text>
        Device is successfully disconnected by you. You can connect new device
      </Text>,
      {
        appearance: 'info',
        autoDismiss: true,
        // @ts-ignore: works fine here, ignore
        isdarktheme: `${isDarkTheme}`,
      }
    );
  }, [addToast, handleReset, isDarkTheme]);

  const renderIntermediateOrSuccessStepContent = useCallback(() => {
    return activeStep === steps.length ? (
      <Zoom duration={300} when={isInterShow}>
        <Row middle="xs" center="xs">
          <SuccessStep handleReset={handleReset} />
        </Row>
      </Zoom>
    ) : (
      <Fade duration={isProduction() ? 300 : 0} when={isInterShow}>
        <IntermediateStep
          activeStep={activeStep}
          steps={steps}
          handleNext={handleNext}
          handleBack={handleBack}
          handleNextEntireScreen={handleNextEntireScreen}
          handleNextApplicationWindow={handleNextApplicationWindow}
          resetPendingConnectionDevice={() => setPendingConnectionDevice(null)}
          resetUserAllowedConnection={() => setIsUserAllowedConnection(false)}
        />
      </Fade>
    );
  }, [
    activeStep,
    steps,
    isInterShow,
    handleReset,
    handleNext,
    handleBack,
    handleNextEntireScreen,
    handleNextApplicationWindow,
  ]);

  const renderStepLabelContent = useCallback(
    (label, idx) => {
      return (
        <StepLabel
          id="step-label-deskreen"
          className={classes.stepLabelContent}
          StepIconComponent={ColorlibStepIcon}
          StepIconProps={
            {
              isEntireScreenSelected,
              isApplicationWindowSelected,
            } as StepIconPropsDeskreen
          }
        >
          {pendingConnectionDevice && idx === 0 && isUserAllowedConnection ? (
            <DeviceConnectedInfoButton
              device={pendingConnectionDevice}
              onDisconnect={handleUserClickedDeviceDisconnectButton}
            />
          ) : (
            <Text className="bp3-text-muted">{label}</Text>
          )}
        </StepLabel>
      );
    },
    [
      classes.stepLabelContent,
      handleUserClickedDeviceDisconnectButton,
      isApplicationWindowSelected,
      isEntireScreenSelected,
      isUserAllowedConnection,
      pendingConnectionDevice,
    ]
  );

  return (
    <>
      <Row>
        <Col xs={12}>
          <Pulse top duration={isProduction() ? 1500 : 0}>
            <Stepper
              className={classes.stepperComponent}
              activeStep={activeStep}
              alternativeLabel
              style={{ background: 'transparent' }}
              connector={<ColorlibConnector />}
            >
              {steps.map((label, idx) => (
                <Step key={label}>{renderStepLabelContent(label, idx)}</Step>
              ))}
            </Stepper>
          </Pulse>
        </Col>
        <Col className={classes.stepContent} xs={12}>
          {renderIntermediateOrSuccessStepContent()}
        </Col>
      </Row>
      <AllowConnectionForDeviceAlert
        device={pendingConnectionDevice}
        isOpen={isAlertOpen}
        onCancel={handleCancelAlert}
        onConfirm={handleConfirmAlert}
      />
    </>
  );
});

export default DeskreenStepper;
