import React, { useContext } from 'react';
import { Row, Col } from 'react-flexbox-grid';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../../providers/AppContextProvider';
import {
  DARK_UI_BACKGROUND,
  LIGHT_UI_BACKGROUND,
} from '../../constants/styleConstants';
import MyDeviceInfoCard from '../../components/MyDeviceInfoCard';
import { TFunction } from 'i18next';
import { H3 } from '@blueprintjs/core';
import ConnectingIndicator from '../../components/ConnectingIndicator';

const Slide = require('react-reveal/Slide');

interface ConnectionPropmptsProps {
  myDeviceDetails: DeviceDetails;
  isShownTextPrompt: boolean;
  promptStep: number;
  connectionIconType: ConnectionIconType;
  isShownSpinnerIcon: boolean;
  spinnerIconType: LoadingSharingIconType;
  isOpen: boolean;
}

function getPromptContent(step: number, t: TFunction) {
  switch (step) {
    case 1:
      return (
        <H3>
          {t(
            'Waiting for user to click ALLOW button on screen sharing device...'
          )}
        </H3>
      );
    case 2:
      return <H3>Connected!</H3>;
    case 3:
      return (
        <H3>
          {t(
            'Wating for user to select source to share from screen sharing device...'
          )}
        </H3>
      );
    default:
      return <H3>Error occured :(</H3>;
  }
}

function ConnectionPropmpts(props: ConnectionPropmptsProps) {
  const {
    myDeviceDetails,
    promptStep,
    connectionIconType,
    isShownSpinnerIcon,
    spinnerIconType,
    isOpen
  } = props;

  const { t } = useTranslation();
  const { isDarkTheme } = useContext(AppContext);

  return (
    <Slide
    id="connection-prompts-slide"
    bottom
    when={isOpen}
    duration={1000}
  >
    <div
      style={{
        position: 'absolute',
        zIndex: 10,
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        boxShadow: `0 0 0 5px ${isDarkTheme ? '#000' : '#A7B6C2'}`,
        backgroundColor: isDarkTheme ? DARK_UI_BACKGROUND : LIGHT_UI_BACKGROUND,
      }}
    >
      <Row
        bottom="xs"
        style={{
          height: '50vh',
          width: '100%',
          marginRight: '0px',
          marginLeft: '0px',
        }}
      >
        <Row center="xs" style={{ width: '100%', margin: '0 auto' }}>
          <Col
            xs={12}
            style={{
              marginBottom: '50px',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <div style={{ width: '100%' }}>
              <Row center="xs" style={{ width: '100%', margin: '0 auto' }}>
                <Col md={6} xl={4}>
                  <MyDeviceInfoCard deviceDetails={myDeviceDetails} />
                </Col>
              </Row>
                <div id="prompt-text" style={{ fontSize: '20px' }}>
                  {getPromptContent(promptStep, t)}
                </div>
            </div>
          </Col>
        </Row>
      </Row>
      <ConnectingIndicator
        currentStep={promptStep}
        connectionIconType={connectionIconType}
        isShownSelectingSharingIcon={isShownSpinnerIcon}
        selectingSharingIconType={spinnerIconType}
      />
    </div>
    </Slide>
  );
}

export default ConnectionPropmpts;
