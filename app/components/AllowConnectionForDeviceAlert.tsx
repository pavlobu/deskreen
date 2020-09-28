import React from 'react';
import { Row, Col } from 'react-flexbox-grid';
import { Text, H3, Intent, Alert } from '@blueprintjs/core';
import isProduction from '../utils/isProduction';

interface AllowConnectionForDeviceAlertProps {
  device: Device | null;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function AllowConnectionForDeviceAlert(
  props: AllowConnectionForDeviceAlertProps
) {
  const { device, isOpen, onCancel, onConfirm } = props;

  return (
    <Alert
      className="class-allow-device-to-connect-alert"
      cancelButtonText="Deny"
      confirmButtonText="Allow"
      icon="feed"
      intent={Intent.DANGER}
      isOpen={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
      transitionDuration={isProduction() ? 700 : 0}
    >
      <H3>Device is trying to connect</H3>
      <Row>
        <Col>
          <Text>{`Device IP: `}</Text>
          <span id="allow-connection-device-alert-device-ip-span">
            {device?.deviceIP}
          </span>
        </Col>
      </Row>
      <Row>
        <Col>
          <Text>{`Device Type: ${device?.deviceType}`}</Text>
        </Col>
      </Row>
      <Row>
        <Col>
          <Text>{`Device OS: ${device?.deviceOS}`}</Text>
        </Col>
      </Row>
      <Row>
        <Col>
          <Text>{`session ID: ${device?.sharingSessionID}`}</Text>
        </Col>
      </Row>
    </Alert>
  );
}
