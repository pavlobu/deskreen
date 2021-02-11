import React from 'react';
import { Intent, Alert, H4 } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import DeviceInfoCallout from './DeviceInfoCallout';
import isWithReactRevealAnimations from '../utils/isWithReactRevealAnimations';

interface AllowConnectionForDeviceAlertProps {
  device: Device | null;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function AllowConnectionForDeviceAlert(
  props: AllowConnectionForDeviceAlertProps
) {
  const { t } = useTranslation();
  const { device, isOpen, onCancel, onConfirm } = props;
  const denyText = t('Deny');
  const allowText = t('Allow');

  return (
    <Alert
      className="class-allow-device-to-connect-alert"
      cancelButtonText={denyText}
      confirmButtonText={allowText}
      icon="feed"
      intent={Intent.DANGER}
      isOpen={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
      transitionDuration={isWithReactRevealAnimations() ? 700 : 0}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      usePortal={false}
    >
      <H4>{t('Someone is trying to connect, do you allow?')}</H4>
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
