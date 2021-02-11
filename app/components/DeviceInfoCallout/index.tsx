/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import { Callout, Text, H4, Tooltip, Position } from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

interface DeviceInfoCalloutProps {
  deviceType: string | undefined;
  deviceIP: string | undefined;
  deviceOS: string | undefined;
  sharingSessionID: string | undefined;
  deviceBrowser: string | undefined;
}

function getContentOfTooltip(t: TFunction) {
  return (
    <>
      <Text>
        {t(
          'This should match with Device IP displayed on the screen of device that is trying to connect'
        )}
      </Text>
      <span style={{ fontWeight: 900 }}>
        <Text>{t('If IP addresses dont match click Disconnect button')}</Text>
      </span>
    </>
  );
}

export default function DeviceInfoCallout(props: DeviceInfoCalloutProps) {
  const { t } = useTranslation();

  const {
    deviceType,
    deviceIP,
    deviceOS,
    sharingSessionID,
    deviceBrowser,
  } = props;

  return (
    <>
      <H4 style={{ margin: '0 auto', textAlign: 'center' }}>
        {`${t('Partner Device Info')}:`}
      </H4>
      <Callout id="device-info-callout" style={{ borderRadius: '8px' }}>
        <Row center="xs">
          <Col xs={12}>
            <Text>
              {`${t('Device Type')}:`} <span>{deviceType}</span>
            </Text>
            <Tooltip content={getContentOfTooltip(t)} position={Position.TOP}>
              <div
                style={{
                  fontWeight: 900,
                  backgroundColor: '#00f99273',
                  paddingLeft: '10px',
                  paddingRight: '10px',
                  borderRadius: '20px',
                }}
              >
                <Text className="bp3-text-large">
                  {`${t('Device IP')}:`}{' '}
                  <span className="device-ip-span">{deviceIP}</span>
                </Text>
              </div>
            </Tooltip>
            <Text>
              {`${t('Device Browser')}:`} <span>{deviceBrowser}</span>
            </Text>
            <Text>
              {`${t('Device OS')}:`} <span>{deviceOS}</span>
            </Text>
            <div style={{ width: '200px', margin: '0 auto' }}>
              <Text className="bp3-text-muted" ellipsize>
                {`${t('Session ID')}:`} <span>{sharingSessionID}</span>
              </Text>
            </div>
          </Col>
        </Row>
      </Callout>
    </>
  );
}
