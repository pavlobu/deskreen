/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useCallback, useContext, useEffect } from 'react';
import { ipcRenderer, shell } from 'electron';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { Row, Col, Grid } from 'react-flexbox-grid';
import {
  Button,
  Dialog,
  H1,
  H3,
  H4,
  H5,
  Icon,
  Position,
  Spinner,
  Text,
  Tooltip,
} from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useToasts } from 'react-toast-notifications';
import SuccessStep from '../components/StepsOfStepper/SuccessStep';
import IntermediateStep from '../components/StepsOfStepper/IntermediateStep';
import AllowConnectionForDeviceAlert from '../components/AllowConnectionForDeviceAlert';
import DeviceConnectedInfoButton from '../components/StepperPanel/DeviceConnectedInfoButton';
import ColorlibStepIcon, {
  StepIconPropsDeskreen,
} from '../components/StepperPanel/ColorlibStepIcon';
import ColorlibConnector from '../components/StepperPanel/ColorlibConnector';
import { SettingsContext } from './SettingsProvider';
import LanguageSelector from '../components/LanguageSelector';
import { getShuffledArrayOfHello } from '../configs/i18next.config.client';
import ToggleThemeBtnGroup from '../components/ToggleThemeBtnGroup';
import { IpcEvents } from '../main/IpcEvents.enum';

const Fade = require('react-reveal/Fade');

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

function getSteps(t: TFunction) {
  return [t('Connect'), t('Select'), t('Confirm')];
}

// eslint-disable-next-line react/display-name
const DeskreenStepper = React.forwardRef((_props, ref) => {
  const { t } = useTranslation();

  const classes = useStyles();

  const { isDarkTheme } = useContext(SettingsContext);

  const { addToast } = useToasts();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isUserAllowedConnection, setIsUserAllowedConnection] = useState(false);
  const [isNoWiFiError, setisNoWiFiError] = useState(false);
  const [isSelectLanguageDialogOpen, setIsSelectLanguageDialogOpen] = useState(
    false
  );
  const [
    isStandForUkraineDialogOpen,
    setIsStandForUkraineDialogOpen,
  ] = useState(true);
  const [isDisplayHelloWord, setIsDisplayHelloWord] = useState(true);
  const [helloWord, setHelloWord] = useState('Hello');

  const [
    pendingConnectionDevice,
    setPendingConnectionDevice,
  ] = useState<Device | null>(null);

  useEffect(() => {
    const ipInterval = setInterval(async () => {
      const gotIP = await ipcRenderer.invoke('get-local-lan-ip');
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

  useEffect(() => {
    ipcRenderer.invoke(IpcEvents.CreateWaitingForConnectionSharingSession);
    ipcRenderer.on(IpcEvents.SetPendingConnectionDevice, (_, device) => {
      setPendingConnectionDevice(device);
      setIsAlertOpen(true);
    });
  }, []);

  useEffect(() => {
    let helloInterval: NodeJS.Timeout;
    async function stepperOpenedCallback() {
      const isFirstTimeStart = await ipcRenderer.invoke(
        IpcEvents.GetIsFirstTimeAppStart
      );
      setIsSelectLanguageDialogOpen(isFirstTimeStart);
      if (!isFirstTimeStart) return;
      const helloWords = getShuffledArrayOfHello();
      let pos = 0;
      helloInterval = setInterval(() => {
        setIsDisplayHelloWord(false);
        if (pos + 1 === helloWords.length) {
          pos = 0;
        } else {
          pos += 1;
        }
        setHelloWord(helloWords[pos]);
        setIsDisplayHelloWord(true);
      }, 4000);
    }
    stepperOpenedCallback();

    return () => {
      clearInterval(helloInterval);
    };
  }, []);

  const [activeStep, setActiveStep] = useState(0);
  const [isEntireScreenSelected, setIsEntireScreenSelected] = useState(false);
  const [
    isApplicationWindowSelected,
    setIsApplicationWindowSelected,
  ] = useState(false);
  const steps = getSteps(t);

  const handleNext = useCallback(() => {
    if (activeStep === steps.length - 1) {
      setIsEntireScreenSelected(false);
      setIsApplicationWindowSelected(false);
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, [activeStep, steps]);

  const handleNextEntireScreen = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setIsEntireScreenSelected(true);
  }, []);

  const handleNextApplicationWindow = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setIsApplicationWindowSelected(true);
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  const handleReset = useCallback(() => {
    setActiveStep(0);

    ipcRenderer.invoke(IpcEvents.CreateWaitingForConnectionSharingSession);
  }, []);

  const handleResetWithSharingSessionRestart = useCallback(() => {
    setActiveStep(0);
    setPendingConnectionDevice(null);
    setIsUserAllowedConnection(false);

    ipcRenderer.invoke(IpcEvents.ResetWaitingForConnectionSharingSession);
    ipcRenderer.invoke(IpcEvents.CreateWaitingForConnectionSharingSession);
  }, []);

  React.useImperativeHandle(ref, () => ({
    handleReset() {
      handleResetWithSharingSessionRestart();
    },
  }));

  const handleCancelAlert = async () => {
    setIsAlertOpen(false);
    setActiveStep(0);
    setPendingConnectionDevice(null);
    setIsUserAllowedConnection(false);

    ipcRenderer.invoke(IpcEvents.ResetWaitingForConnectionSharingSession);
    ipcRenderer.invoke(IpcEvents.CreateWaitingForConnectionSharingSession);
  };

  const handleConfirmAlert = useCallback(async () => {
    setIsAlertOpen(false);
    setIsUserAllowedConnection(true);
    handleNext();

    ipcRenderer.invoke(IpcEvents.SetDeviceConnectedStatus);
  }, [handleNext]);

  const handleUserClickedDeviceDisconnectButton = useCallback(async () => {
    handleResetWithSharingSessionRestart();

    addToast(
      <Text>
        {t(
          'Device is successfully disconnected by you You can connect a new device'
        )}
      </Text>,
      {
        appearance: 'info',
        autoDismiss: true,
        // @ts-ignore: works fine here
        isdarktheme: `${isDarkTheme}`,
      }
    );
  }, [addToast, handleResetWithSharingSessionRestart, isDarkTheme, t]);

  const renderIntermediateOrSuccessStepContent = useCallback(() => {
    return activeStep === steps.length ? (
      <div style={{ width: '100%' }}>
        <Row middle="xs" center="xs">
          <SuccessStep handleReset={handleReset} />
        </Row>
      </div>
    ) : (
      <div id="intermediate-step-container" style={{ width: '100%' }}>
        <IntermediateStep
          activeStep={activeStep}
          steps={steps}
          handleNext={handleNext}
          handleBack={handleBack}
          handleNextEntireScreen={handleNextEntireScreen}
          handleNextApplicationWindow={handleNextApplicationWindow}
          resetPendingConnectionDevice={() => setPendingConnectionDevice(null)}
          resetUserAllowedConnection={() => setIsUserAllowedConnection(false)}
          connectedDevice={pendingConnectionDevice}
        />
      </div>
    );
  }, [
    activeStep,
    steps,
    handleReset,
    handleNext,
    handleBack,
    handleNextEntireScreen,
    handleNextApplicationWindow,
    pendingConnectionDevice,
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
        isOpen={isAlertOpen}
        onCancel={handleCancelAlert}
        onConfirm={handleConfirmAlert}
      />
      <Dialog isOpen={isNoWiFiError} autoFocus usePortal>
        <Grid>
          <div style={{ padding: '10px' }}>
            <Row center="xs" style={{ marginTop: '10px' }}>
              <Icon icon="offline" iconSize={50} color="#8A9BA8" />
            </Row>
            <Row center="xs" style={{ marginTop: '10px' }}>
              <H3>No WiFi and LAN connection.</H3>
            </Row>
            <Row center="xs">
              <H5>Deskreen works only with WiFi and LAN networks.</H5>
            </Row>
            <Row center="xs">
              <Spinner size={50} />
            </Row>
            <Row center="xs" style={{ marginTop: '10px' }}>
              <H4>Waiting for connection.</H4>
            </Row>
          </div>
        </Grid>
      </Dialog>
      <Dialog isOpen={isSelectLanguageDialogOpen} autoFocus usePortal>
        <Grid>
          <div style={{ padding: '10px' }}>
            <Row center="xs" style={{ marginTop: '10px' }}>
              <Fade collapse opposite when={isDisplayHelloWord} duration={700}>
                <H1>{helloWord}</H1>
              </Fade>
            </Row>
            <Row>
              <Col xs>
                <Row center="xs" style={{ marginTop: '20px' }}>
                  <Icon icon="translate" iconSize={50} color="#8A9BA8" />
                </Row>
                <Row center="xs" style={{ marginTop: '20px' }}>
                  <H5>{t('Language')}</H5>
                </Row>
                <Row center="xs" style={{ marginTop: '10px' }}>
                  <LanguageSelector />
                </Row>
              </Col>
              <Col xs>
                <Row center="xs" style={{ marginTop: '20px' }}>
                  <Icon icon="style" iconSize={50} color="#8A9BA8" />
                </Row>
                <Row center="xs" style={{ marginTop: '20px' }}>
                  <H5>{t('Color Theme')}</H5>
                </Row>
                <Row center="xs" style={{ marginTop: '10px' }}>
                  <ToggleThemeBtnGroup />
                </Row>
              </Col>
            </Row>
            <Row center="xs" style={{ marginTop: '20px' }}>
              <Button
                minimal
                rightIcon="chevron-right"
                onClick={() => {
                  setIsSelectLanguageDialogOpen(false);
                  ipcRenderer.invoke(IpcEvents.SetAppStartedOnce);
                }}
                style={{ borderRadius: '50px' }}
              >
                {t('Continue')}
              </Button>
            </Row>
          </div>
        </Grid>
      </Dialog>
      <Dialog
        isOpen={isStandForUkraineDialogOpen}
        autoFocus
        usePortal
        style={{
          width: '98%',
          height: '98%',
        }}
      >
        <Grid>
          <div
            style={{
              height: '98%',
              maxHeight: '500px',
              overflowY: 'scroll',
            }}
          >
            <Row center="xs" middle="xs">
              <Col xs={2}>
                <Tooltip
                  content="Click to translate"
                  position={Position.BOTTOM}
                >
                  <Button
                    style={{
                      backgroundColor: '#3DCC91',
                      borderRadius: '50px',
                      width: '60px',
                      height: '60px',
                    }}
                    onClick={() => {
                      shell.openExternal(
                        `https://translate.google.com/?sl=en&tl=auto&text=DESKREEN%20CREATOR%20IS%20A%20UKRAINIAN.%20UKRAINE%20NEEDS%20YOUR%20HELP%21%0A%E2%99%A5%EF%B8%8F%20Follow%20this%20link%20to%20support%20Ukraine%21%20%E2%99%A5%EF%B8%8F%0AIf%20you%20don%27t%20live%20in%20a%20cave%20and%20aware%20of%20what%20is%20going%20on%20in%20the%20world%2C%20Russian%20government%20had%20started%20global%20armed%20invasion%20on%20the%20territory%20of%20Ukraine%20on%20the%2024th%20of%20February%202022.%20This%20is%20for%20real%2C%20this%20is%20a%20WAR.%20Russian%20army%20is%20killing%20Ukrainian%20soldiers%2C%20Ukrainian%20civil%20citizens%20and%20Ukrainian%20children%20RIGHT%20NOW%20because%20Russian%20government%20gave%20them%20an%20order%20to%20do%20so.%20You%20can%20search%20online%20for%20thousands%20of%20videos%20of%20what%20is%20going%20on%20in%20Ukraine.%0AUkrainians%20fight%20brave%20for%20their%20land%20and%20will%20never%20give%20up.%20But%20you%20must%20understand%20that%20our%20country%20is%20fighting%20here%20not%20for%20our%20land%20only%2C%20but%20for%20the%20safety%20of%20the%20whole%20world.%20If%20Ukraine%20fails%20in%20this%20war%20with%20Russian%20army%20and%20Russian%20government%2C%20the%20security%20of%20all%20countries%20in%20the%20world%20will%20be%20under%20the%20threat%21%20Russian%20government%20and%20it%27s%20vicious%20allies%20and%20governments%20from%20other%20countries%20will%20be%20moving%20their%20armies%20to%20YOUR%20land%2C%20sooner%20or%20later.%0AYou%20must%20understand%20that%20now%20Ukraine%20has%20more%20people%20here%20willing%20to%20fight%20than%20weapons%2C%20military%20supplies%20and%20other%20inventory%20for%20them.%20If%20you%20CAN%20and%20WANT%20to%20support%20Ukraine%20and%20Ukrainian%20army%2C%20here%20is%20a%20tweet%20with%20instructions%20from%20OFFICIAL%20account%20of%20Ukraine%0A%E2%99%A5%EF%B8%8F%20Follow%20this%20link%20to%20support%20Ukraine%21%20%E2%99%A5%EF%B8%8F%0AGLORY%20TO%20UKRAINE%21%20GLORY%20TO%20UKRAINIAN%20HEROES%21%0AYOU%20MUST%20UNDERSTAND%20THAT%20THIS%20WAR%20WITH%20UKRAINE%20STARTED%20NOT%20THE%20PEOPLE%20OF%20RUSSIA%2C%20BUT%20THE%20EVIL%20RUSSIAN%20GOVERNMENT%21%20MOST%20OF%20RUSSIAN%20PEOPLE%20ARE%20PEACEFUL%20AND%20VERY%20KIND%21%20IT%20IS%20A%20RUSSIAN%20GOVERNMENT%20THAT%20STARTED%20A%20WAR%20WITH%20THE%20WORLD%20THAT%20STARTED%20IN%20UKRAINE%20ON%20THE%2024TH%20OF%20FEBRUARY%202022`
                      );
                      setIsStandForUkraineDialogOpen(false);
                    }}
                  >
                    <Icon icon="translate" iconSize={40} color="white" />
                  </Button>
                </Tooltip>
              </Col>
              <Col xs={10}>
                <H3>
                  DESKREEN CREATOR IS A UKRAINIAN. 🇺🇦 UKRAINE 🇺🇦 NEEDS YOUR
                  HELP!
                </H3>
                <Button
                  style={{ fontSize: '20px', color: 'rgb(0, 255, 255)' }}
                  onClick={() => {
                    shell.openExternal(
                      'https://twitter.com/Ukraine/status/1497294840110977024'
                    );
                  }}
                >
                  <i>
                    <b>♥️ CLICK HERE TO DONATE TO UKRAINE! ♥️</b>
                  </i>
                </Button>
              </Col>
            </Row>
            <Row center="xs">
              <p style={{ fontSize: '14px' }}>
                If you don&apos;t live in a cave and aware of what is going on
                in the world 🌍 , Russian 🇷🇺 government had started global armed
                invasion on the territory of Ukraine on the 24th of February
                2022.
                <b>
                  <i>
                    This is for real, this is a WAR. Russian army is killing
                    Ukrainian soldiers, Ukrainian civil citizens and Ukrainian
                    children RIGHT NOW because Russian government gave them an
                    order to do so.
                  </i>
                </b>
                You can search online for thousands of videos of what is going
                on in Ukraine.
              </p>
              <p style={{ fontSize: '14px' }}>
                {' '}
                Ukrainians fight brave for their land and will never give up.
                But you must understand that our country is fighting here not
                for our land only, but for the safety of the whole world.
                ❗️❗️❗️
                <b>
                  <i>
                    {' '}
                    If Ukraine fails in this war with Russian army and Russian
                    government, the security of all countries in the world 🌍
                    will be under the threat! Russian government and it&apos;s
                    vicious allies and governments from other countries will be
                    moving their armies to YOUR land, sooner or later
                  </i>
                </b>
                ❗️❗️❗
              </p>
              <p style={{ fontSize: '14px' }}>
                You must understand that now Ukraine has more people here
                willing to fight than weapons, military supplies and other
                inverntory for them. If you CAN and WANT to support Ukraine 🇺🇦
                and Ukrainian army, here is a tweet with instructions from
                OFFICIAL ✅ account of Ukraine 🇺🇦
              </p>
            </Row>
            <Row center="xs">
              <Button
                style={{ fontSize: '20px', color: 'rgb(0, 255, 255)' }}
                onClick={() => {
                  shell.openExternal(
                    'https://twitter.com/Ukraine/status/1497294840110977024'
                  );
                }}
              >
                <i>
                  <b>♥️ CLICK HERE TO GO TO A TWEET TO DONATE TO UKRAINE! ♥️</b>
                </i>
              </Button>
            </Row>
            <Row center="xs">
              <p style={{ fontSize: '10px' }}>
                YOU MUST UNDERSTAND THAT THIS WAR WITH UKRAINE STARTED NOT THE
                PEOPLE OF RUSSIA, BUT THE EVIL RUSSIAN GOVERNMENT! MOST OF
                RUSSIAN PEOPLE ARE PEACEFUL AND VERY KIND! IT IS A RUSSIAN
                GOVERNMENT THAT STARTED A WAR WITH THE WORLD THAT STARTED IN
                UKRAINE ON THE 24TH OF FEBRUARY 2022
              </p>
            </Row>
            <Row center="xs" style={{ marginTop: '5px' }}>
              <Button
                minimal
                rightIcon="chevron-right"
                onClick={() => {
                  setIsStandForUkraineDialogOpen(false);
                }}
                style={{
                  borderRadius: '50px',
                  backgroundColor: '#137CBD',
                  color: 'white',
                }}
              >
                {t('GLORY TO UKRAINE! GLORY TO UKRAINIAN HEROES!')}
              </Button>
            </Row>
          </div>
        </Grid>
      </Dialog>
    </>
  );
});

export default DeskreenStepper;
