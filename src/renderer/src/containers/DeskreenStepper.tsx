// import SuccessStep from '../components/StepsOfStepper/SuccessStep';
import React, { useState, useCallback, useEffect, ReactNode } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { Row, Col, Grid } from 'react-flexbox-grid';
import { Button, Dialog, H1, H3, H4, H5, Icon, Spinner, Text } from '@blueprintjs/core';
import IntermediateStep from '@renderer/components/StepsOfStepper/IntermediateStep';
import ColorlibConnector from '@renderer/components/StepperPanel/ColorlibConnector';
import { Device } from '../../../common/Device';
import ColorlibStepIcon, {
  StepIconPropsDeskreen,
} from '@renderer/components/StepperPanel/ColorlibStepIcon';
import LanguageSelector from '@renderer/components/LanguageSelector';
import { getShuffledArrayOfHello } from '@renderer/configs/i18next.config.client';
import { IpcEvents } from '../../../common/IpcEvents.enum';
import DeviceConnectedInfoButton from '@renderer/components/StepperPanel/DeviceConnectedInfoButton';
import AllowConnectionForDeviceAlert from '@renderer/components/AllowConnectionForDeviceAlert';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { showMessageFromNewToaster } from '@renderer/utils/showMessageFromNewToaster';

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
  }),
);

function getSteps(t: TFunction): string[] {
  return [t('connect'), t('select'), t('confirm')];
}

interface Props {
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  isAllowDeviceAlertOpen: boolean;
  setIsAllowDeviceAlertOpen: (isOpen: boolean) => void;
  isUserAllowedConnection: boolean;
  setIsUserAllowedConnection: (isAllowed: boolean) => void;
  pendingConnectionDevice: Device | null;
  setPendingConnectionDevice: (device: Device | null) => void;
  handleReset: () => void;
}

const DeskreenStepper = ({
  activeStep,
  setActiveStep,
  isAllowDeviceAlertOpen,
  setIsAllowDeviceAlertOpen,
  isUserAllowedConnection,
  setIsUserAllowedConnection,
  pendingConnectionDevice,
  setPendingConnectionDevice,
  handleReset,
}: Props): ReactNode => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [isEntireScreenSelected, setIsEntireScreenSelected] = useState(false);
  const [isApplicationWindowSelected, setIsApplicationWindowSelected] = useState(false);
  const [isNoWiFiError, setisNoWiFiError] = useState(false);
  const [isSelectLanguageDialogOpen, setIsSelectLanguageDialogOpen] = useState(false);
  const [helloWord, setHelloWord] = useState('Hello');

  useEffect(() => {
    let helloInterval: NodeJS.Timeout;
    async function stepperOpenedCallback(): Promise<void> {
      const isFirstTimeStart = await window.electron.ipcRenderer.invoke(
        IpcEvents.GetIsFirstTimeAppStart,
      );
      setIsSelectLanguageDialogOpen(isFirstTimeStart);
      if (!isFirstTimeStart) return;
      const helloWords = getShuffledArrayOfHello();
      let pos = 0;
      helloInterval = setInterval(() => {
        if (pos + 1 === helloWords.length) {
          pos = 0;
        } else {
          pos += 1;
        }
        setHelloWord(helloWords[pos]);
      }, 4000);
    }
    stepperOpenedCallback();

    return () => {
      clearInterval(helloInterval);
    };
  }, []);

  useEffect(() => {
    const ipInterval = setInterval(async () => {
      const gotIP = await window.electron.ipcRenderer.invoke('get-local-lan-ip');
      if (gotIP === undefined) {
        setisNoWiFiError(true);
      } else {
        setisNoWiFiError(false);
      }
    }, 1000);

    return () => {
      clearInterval(ipInterval);
    };
  }, []);

  const steps = getSteps(t);

  const handleNext = useCallback((): void => {
    if (activeStep === steps.length - 1) {
      setIsEntireScreenSelected(false);
      setIsApplicationWindowSelected(false);
    }
    setActiveStep((prevActiveStep: number): number => prevActiveStep + 1);
  }, [activeStep, setActiveStep, steps]);

  const handleNextEntireScreen = useCallback((): void => {
    setActiveStep((prevActiveStep: number): number => prevActiveStep + 1);
    setIsEntireScreenSelected(true);
  }, [setActiveStep]);

  const handleNextApplicationWindow = useCallback((): void => {
    setActiveStep((prevActiveStep: number): number => prevActiveStep + 1);
    setIsApplicationWindowSelected(true);
  }, [setActiveStep]);

  const handleBack = useCallback((): void => {
    setActiveStep((prevActiveStep: number) => prevActiveStep - 1);
  }, [setActiveStep]);

  const handleCancelAlert = async (): Promise<void> => {
    setIsAllowDeviceAlertOpen(false);
    setActiveStep(0);
    setPendingConnectionDevice(null);
    setIsUserAllowedConnection(false);

    await window.electron.ipcRenderer.invoke(IpcEvents.ResetWaitingForConnectionSharingSession);
    await window.electron.ipcRenderer.invoke(IpcEvents.CreateWaitingForConnectionSharingSession);
  };

  const handleConfirmAlert = useCallback(async () => {
    setIsAllowDeviceAlertOpen(false);
    setIsUserAllowedConnection(true);
    handleNext();
    await window.electron.ipcRenderer.invoke(IpcEvents.SetDeviceConnectedStatus);
  }, [handleNext, setIsAllowDeviceAlertOpen, setIsUserAllowedConnection]);

  useEffect(() => {
    window.electron.ipcRenderer.invoke(IpcEvents.CreateWaitingForConnectionSharingSession);

    const handlePendingConnectionDevice = (_: unknown, device: Device): void => {
      setPendingConnectionDevice(device);
      setIsAllowDeviceAlertOpen(true);
    };

    window.electron.ipcRenderer.on(
      IpcEvents.SetPendingConnectionDevice,
      handlePendingConnectionDevice,
    );

    return () => {
      window.electron.ipcRenderer.removeListener(
        IpcEvents.SetPendingConnectionDevice,
        handlePendingConnectionDevice,
      );
    };
  }, [setIsAllowDeviceAlertOpen, setPendingConnectionDevice]);

  const handleUserClickedDeviceDisconnectButton = useCallback(async (): Promise<void> => {
    handleReset();

    await showMessageFromNewToaster(
      t('device-is-successfully-disconnected-by-you-you-can-connect-a-new-device'),
    );
  }, [handleReset, t]);

  const renderIntermediateOrSuccessStepContent = useCallback(() => {
    return (
      <div id="intermediate-step-container" style={{ width: '100%' }}>
        <IntermediateStep
          activeStep={activeStep}
          steps={steps}
          handleBack={handleBack}
          handleNextEntireScreen={handleNextEntireScreen}
          handleNextApplicationWindow={handleNextApplicationWindow}
          resetPendingConnectionDevice={() => setPendingConnectionDevice(null)}
          resetUserAllowedConnection={() => setIsUserAllowedConnection(false)}
          connectedDevice={pendingConnectionDevice}
          handleReset={handleReset}
        />
      </div>
    );
  }, [
    activeStep,
    steps,
    handleReset,
    handleBack,
    handleNextEntireScreen,
    handleNextApplicationWindow,
    pendingConnectionDevice,
    setIsUserAllowedConnection,
    setPendingConnectionDevice,
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
    ],
  );

  return (
    <>
      <>
        <Row style={{ width: '100%' }}>
          <Col xs={12}>
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
          </Col>
          <Col className={classes.stepContent} xs={12}>
            {renderIntermediateOrSuccessStepContent()}
          </Col>
        </Row>
        <AllowConnectionForDeviceAlert
          device={pendingConnectionDevice}
          isOpen={isAllowDeviceAlertOpen}
          onCancel={handleCancelAlert}
          onConfirm={handleConfirmAlert}
        />
      </>
      <Dialog isOpen={isNoWiFiError} autoFocus usePortal>
        <Grid>
          <div style={{ padding: '10px' }}>
            <Row center="xs" style={{ marginTop: '10px' }}>
              <Icon icon="offline" size={50} color="#8A9BA8" />
            </Row>
            <Row center="xs" style={{ marginTop: '10px' }}>
              <H3>{t('no-wifi-and-lan-connection')}</H3>
            </Row>
            <Row center="xs">
              <H5>{t('deskreen-ce-works-only-with-wifi-and-lan-networks')}</H5>
            </Row>
            <Row center="xs">
              <Spinner size={50} />
            </Row>
            <Row center="xs" style={{ marginTop: '10px' }}>
              <H4>{t('waiting-for-connection')}</H4>
            </Row>
          </div>
        </Grid>
      </Dialog>
      <Dialog isOpen={isSelectLanguageDialogOpen} autoFocus usePortal>
        <Grid>
          <div style={{ padding: '10px' }}>
            <Row center="xs" style={{ marginTop: '10px' }}>
              <H1>{helloWord}</H1>
            </Row>
            <Row>
              <Col xs>
                <Row center="xs" style={{ marginTop: '20px' }}>
                  <Icon icon="translate" size={50} color="#8A9BA8" />
                </Row>
                <Row center="xs" style={{ marginTop: '20px' }}>
                  <H5>{t('language')}</H5>
                </Row>
                <Row center="xs" style={{ marginTop: '10px' }}>
                  <LanguageSelector />
                </Row>
              </Col>
              {/*<Col xs>*/}
              {/*  <Row center="xs" style={{ marginTop: '20px' }}>*/}
              {/*    <Icon icon="style" size={50} color="#8A9BA8" />*/}
              {/*  </Row>*/}
              {/*  <Row center="xs" style={{ marginTop: '20px' }}>*/}
              {/*    <H5>{t('color-theme')}</H5>*/}
              {/*  </Row>*/}
              {/*  <Row center="xs" style={{ marginTop: '10px' }}>*/}
              {/*    <ToggleThemeBtnGroup />*/}
              {/*  </Row>*/}
              {/*</Col>*/}
            </Row>
            <Row center="xs" style={{ marginTop: '20px' }}>
              <Button
                minimal
                rightIcon="chevron-right"
                onClick={() => {
                  setIsSelectLanguageDialogOpen(false);
                  window.electron.ipcRenderer.invoke(IpcEvents.SetAppStartedOnce);
                }}
                style={{ borderRadius: '50px' }}
              >
                {t('continue')}
              </Button>
            </Row>
          </div>
        </Grid>
      </Dialog>
    </>
  );
};

export default DeskreenStepper;
