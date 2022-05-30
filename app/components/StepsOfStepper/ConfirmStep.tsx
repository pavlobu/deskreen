import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { Text } from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';
import { useTranslation } from 'react-i18next';
import SharingSourcePreviewCard from '../SharingSourcePreviewCard';
import DeviceInfoCallout from '../DeviceInfoCallout';
import { IpcEvents } from '../../main/IpcEvents.enum';

interface ConfirmStepProps {
  device: Device | null;
}

export default function ConfirmStep(props: ConfirmStepProps) {
  const { t } = useTranslation();
  const { device } = props;
  const [
    waitingForConnectionSharingSessionSourceId,
    setWaitingForConnectionSharingSessionSourceId,
  ] = useState<string | undefined>();

  useEffect(() => {
    ipcRenderer
      .invoke(IpcEvents.GetWaitingForConnectionSharingSessionSourceId)
      // eslint-disable-next-line promise/always-return
      .then((id) => {
        setWaitingForConnectionSharingSessionSourceId(id);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div style={{ width: '80%', marginTop: '50px' }}>
      <Row style={{ marginBottom: '10px' }}>
        <Col xs={12} style={{ textAlign: 'center' }}>
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
            sharingSourceID={waitingForConnectionSharingSessionSourceId}
          />
        </Col>
      </Row>
    </div>
  );
}
