import React from 'react';
import { Row, Col } from 'react-flexbox-grid';
import { Icon, Text, Button, Popover, Tooltip } from '@blueprintjs/core';
import isProduction from '../../utils/isProduction';
import DeviceInfoCallout from '../DeviceInfoCallout';

interface DeviceConnectedInfoButtonProps {
  device: Device;
  onDisconnect: () => void;
}

const getDeviceConnectedPopoverContent = (
  pendingConnectionDevice: Device,
  handleDisconnect: () => void
) => {
  return (
    <Row>
      <div style={{ padding: '20px', borderRadius: '100px' }}>
        <Row style={{ margin: '0 px 10px 10px 10px' }}>
          <DeviceInfoCallout
            deviceType={pendingConnectionDevice?.deviceType}
            deviceIP={pendingConnectionDevice?.deviceIP}
            deviceOS={pendingConnectionDevice?.deviceOS}
            sharingSessionID={pendingConnectionDevice?.sharingSessionID}
            deviceBrowser={pendingConnectionDevice?.deviceBrowser}
          />
        </Row>
        <Row>
          <Col xs={12}>
            <Button
              intent="danger"
              icon="disable"
              onClick={() => {
                handleDisconnect();
              }}
              style={{ width: '100%', borderRadius: '5px' }}
            >
              Disconnect
            </Button>
          </Col>
        </Row>
      </div>
    </Row>
  );
};

export default function DeviceConnectedInfoButton(
  props: DeviceConnectedInfoButtonProps
) {
  const { device, onDisconnect } = props;

  return (
    <>
      <Popover
        content={getDeviceConnectedPopoverContent(device, onDisconnect)}
        position="bottom"
        inheritDarkTheme={false}
        transitionDuration={isProduction() ? 700 : 0}
      >
        <Tooltip
          content={<Text>Click to manage</Text>}
          position="right"
          hoverOpenDelay={400}
        >
          <Button
            id="connected-device-info-stepper-button"
            intent="success"
            style={{
              width: '120px',
              height: '10px !important',
              borderRadius: '100px',
              position: 'relative',
              margin: '0 auto',
            }}
          >
            <Row>
              <Col xs={1}>
                <Icon icon="info-sign" />
              </Col>
              <Col xs>
                <Text>Connected</Text>
              </Col>
            </Row>
          </Button>
        </Tooltip>
      </Popover>
    </>
  );
}
