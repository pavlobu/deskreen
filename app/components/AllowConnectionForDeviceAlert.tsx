import React from 'react';
import { Intent, Alert, H4 } from '@blueprintjs/core';
import isProduction from '../utils/isProduction';
import DeviceInfoCallout from './DeviceInfoCallout';

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
      <H4>Device is trying to connect, do you allow?</H4>
      <DeviceInfoCallout
        deviceType={device?.deviceType}
        deviceIP={device?.deviceIP}
        deviceOS={device?.deviceOS}
        sharingSessionID={device?.sharingSessionID}
        deviceBrowser={device?.deviceBrowser}
      />
    </Alert>
  );
}
