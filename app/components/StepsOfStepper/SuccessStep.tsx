/* eslint-disable react/destructuring-assignment */
import React, { useCallback, useEffect } from 'react';
import { Button, H5, Icon, Text } from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';
import { useTranslation } from 'react-i18next';

interface SuccessStepProps {
  handleReset: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = (props: SuccessStepProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    document
      .querySelector('#top-panel-connected-devices-list-button')
      ?.classList.remove('pulse-not-infinite');

    document
      .querySelector('#top-panel-connected-devices-list-button')
      ?.classList.add('pulse-not-infinite');

    setTimeout(() => {
      document
        .querySelector('#top-panel-connected-devices-list-button')
        ?.classList.remove('pulse-not-infinite');
    }, 4000);
  }, []);

  const handleTextConnectedListMouseEnter = useCallback(() => {
    document
      .querySelector('#top-panel-connected-devices-list-button')
      ?.classList.add('pulsing');
  }, []);

  const handleTextConnectedListMouseLeave = useCallback(() => {
    document
      .querySelector('#top-panel-connected-devices-list-button')
      ?.classList.remove('pulsing');
  }, []);

  return (
    <Col
      xs={8}
      md={6}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Row center="xs">
        <Col xs={12}>
          <Icon icon="endorsed" iconSize={35} color="#0F9960" />
          <H5>{t('Done!')}</H5>
        </Col>
      </Row>
      <Row center="xs">
        <Col xs={10}>
          <div style={{ marginBottom: '10px' }}>
            <Text>{t('Now you can see your screen on other device')}</Text>
          </div>
          <div
            id="connected-devices-list-text-success"
            onMouseEnter={handleTextConnectedListMouseEnter}
            onMouseLeave={handleTextConnectedListMouseLeave}
            style={{
              marginBottom: '25px',
              textDecoration: 'underline dotted',
            }}
          >
            <Text className="">
              {t(
                'You can manage connected devices by clicking Connected Devices button in top panel'
              )}
            </Text>
          </div>
        </Col>
      </Row>
      <Button
        intent="primary"
        onClick={props.handleReset}
        icon="repeat"
        style={{ borderRadius: '100px' }}
      >
        {t('Connect New Device')}
      </Button>
    </Col>
  );
};

export default SuccessStep;
