import React from 'react';
import { Text } from '@blueprintjs/core';
import { Row } from 'react-flexbox-grid';
import ConnectingIndicatorIcon from './ConnectingIndicatorIcon';
import SelectSharingIcon from './SelectSharingIcon';

const basePulsingCircleStyles = {
  borderRadius: '100%',
  marginLeft: 'auto',
  marginRight: 'auto',
  left: '0',
  right: '0',
  textAlign: 'center',
  position: 'absolute',
  width: '100px',
  height: '100px',
};

function getConnectingStepContent(
  currentStep: number,
  connectionIconType: 'feed' | 'feed-subscribed',
  selectingSharingIconType: 'desktop' | 'application',
  isShownSelectingSharingIcon: boolean,
) {

  const pulsingCircle1Styles = {
    ...basePulsingCircleStyles,
    zIndex: 1,
    backgroundColor: 'rgba(43, 149, 214, 0.7)',
  } as React.CSSProperties;

  const pulsingCircle2Styles = {
    ...basePulsingCircleStyles,
    zIndex: 2,
    backgroundColor: '#2B95D6',
  } as React.CSSProperties;

  const pulsingCircle3Styles = {
    ...basePulsingCircleStyles,
    backgroundColor: '#15B371',
  } as React.CSSProperties;

  switch (currentStep) {
    case 1:
      return (
        <>
          <div
            id="pulsing-circle-1"
            style={pulsingCircle1Styles}
          ></div>
          <div
            id="pulsing-circle-2"
            style={pulsingCircle2Styles}
          >
            <ConnectingIndicatorIcon connectionIconType={connectionIconType} />
          </div>
        </>
      );
    case 2:
      return (
        <div
          id="pulsing-circle-3"
          className="pulse-3-once"
          style={pulsingCircle3Styles}
        >
          <ConnectingIndicatorIcon connectionIconType={connectionIconType} />
        </div>
      );
    case 3:
      return (
        <SelectSharingIcon
          isShownSelectingSharingIcon={isShownSelectingSharingIcon}
          selectingSharingIconType={selectingSharingIconType}
        />
      );
    default:
      return <Text>Error occured :(</Text>;
  }
}

interface ConnectingIndicatorProps {
  currentStep: number;
  connectionIconType: 'feed' | 'feed-subscribed';
  isShownSelectingSharingIcon: boolean;
  selectingSharingIconType: 'desktop' | 'application';
}

function ConnectingIndicator(props: ConnectingIndicatorProps) {
  const {
    currentStep,
    connectionIconType,
    isShownSelectingSharingIcon,
    selectingSharingIconType,
  } = props;

  return (
    <>
      <Row
        id="connecting-screen"
        top="xs"
        style={{
          height: '50vh',
          width: '100%',
          marginRight: '0px',
          marginLeft: '0px',
        }}
      >
        {getConnectingStepContent(
          currentStep,
          connectionIconType,
          selectingSharingIconType,
          isShownSelectingSharingIcon,
        )}
      </Row>
    </>
  );
}

export default ConnectingIndicator;
