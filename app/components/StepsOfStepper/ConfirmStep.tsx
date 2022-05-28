import React, { useEffect, useState } from 'react';
// import { remote } from 'electron';
import { Text } from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';
import { useTranslation } from 'react-i18next';
import SharingSourcePreviewCard from '../SharingSourcePreviewCard';
import SharingSessionService from '../../features/SharingSessionService';
import DeviceInfoCallout from '../DeviceInfoCallout';
import SharingSession from '../../features/SharingSessionService/SharingSession';

// const sharingSessionService = remote.getGlobal(
//   'sharingSessionService'
// ) as SharingSessionService;

interface ConfirmStepProps {
  device: Device | null;
}

export default function ConfirmStep(props: ConfirmStepProps) {
  const { t } = useTranslation();
  const { device } = props;
  const [sharingSession, setSharingSession] = useState<
    SharingSession | undefined
  >();

  // useEffect(() => {
  //   if (sharingSessionService.waitingForConnectionSharingSession !== null) {
  //     setSharingSession(
  //       sharingSessionService.waitingForConnectionSharingSession
  //     );
  //   }
  // }, []);

  return (
    <div style={{ width: '80%', marginTop: '50px' }}>
      <Row style={{ marginBottom: '10px' }}>
        <Col xs={12} style={{ textAlign: 'center' }}>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <Text>{t('Check if all is OK and click Confirm')}</Text>
        </Col>
      </Row>
      <Row middle="xs" center="xs">
        <Col xs={5}>
          <DeviceInfoCallout
            deviceType={device?.deviceType}
            deviceIP={device?.deviceIP}
            deviceOS={device?.deviceOS}
            sharingSessionID={device?.sharingSessionID}
            deviceBrowser={device?.deviceBrowser}
          />
        </Col>
        <Col xs={5}>
          <SharingSourcePreviewCard
            sharingSourceID={sharingSession?.desktopCapturerSourceID}
          />
        </Col>
      </Row>
    </div>
  );
}
