/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import { Callout, Text, H4, Tooltip, Position } from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';

interface DeviceInfoCalloutProps {
  deviceType: string | undefined;
  deviceIP: string | undefined;
  deviceOS: string | undefined;
  sharingSessionID: string | undefined;
  deviceBrowser: string | undefined;
}

function getContentOfTooltip() {
  return (
    <>
      <Text>
        {`This should match with 'Device IP' displayed on the screen of device
        that is trying to connect.`}
      </Text>
      <span style={{ fontWeight: 900 }}>
        <Text>
          {`If IPs don't match click 'Deny' or 'Disconnect' button immediately to
          secure your computer!`}
        </Text>
      </span>
    </>
  );
}

export default function DeviceInfoCallout(props: DeviceInfoCalloutProps) {
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
        Partner Device Info:
      </H4>
      <Callout id="device-info-callout">
        <Row center="xs">
          <Col xs={12}>
            <Text>
              Device Type: <span>{deviceType}</span>
            </Text>
            <Tooltip content={getContentOfTooltip()} position={Position.TOP}>
              <div style={{ fontWeight: 900, backgroundColor: '#00f99273' }}>
                <Text className="bp3-text-large">
                  Device IP: <span className="device-ip-span">{deviceIP}</span>
                </Text>
              </div>
            </Tooltip>
            <Text>
              Device Browser: <span>{deviceBrowser}</span>
            </Text>
            <Text>
              Device OS: <span>{deviceOS}</span>
            </Text>
            <div style={{ width: '200px', margin: '0 auto' }}>
              <Text className="bp3-text-muted" ellipsize>
                Session ID: <span>{sharingSessionID}</span>
              </Text>
            </div>
          </Col>
        </Row>
      </Callout>
    </>
  );
}
