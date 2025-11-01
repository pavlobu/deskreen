import { useEffect, useState } from 'react';
import { Text } from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';
import SharingSourcePreviewCard from '../SharingSourcePreviewCard';
import DeviceInfoCallout from '../DeviceInfoCallout';
import { Device } from '../../../../common/Device';
import { IpcEvents } from '../../../../common/IpcEvents.enum';
import { useTranslation } from 'react-i18next';

interface ConfirmStepProps {
  device: Device | null;
}

export default function ConfirmStep(props: ConfirmStepProps) {
  const { device } = props;
  const [
    waitingForConnectionSharingSessionSourceId,
    setWaitingForConnectionSharingSessionSourceId,
  ] = useState<string | undefined>();
  const { t } = useTranslation();

  useEffect(() => {
    window.electron.ipcRenderer
      .invoke(IpcEvents.GetWaitingForConnectionSharingSessionSourceId)
      .then((id) => {
        setWaitingForConnectionSharingSessionSourceId(id);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div style={{ width: '80%', marginTop: '50px' }}>
      <Row style={{ marginBottom: '10px' }}>
        <Col xs={12} style={{ textAlign: 'center' }}>
          <Text>{t('check-if-all-is-ok-and-click-confirm')}</Text>
        </Col>
      </Row>
      <Row middle="xs" center="xs">
        <Col xs={5}>
          <DeviceInfoCallout
            deviceType={device?.deviceType}
            deviceIP={device?.deviceIP}
            deviceOS={device?.deviceOS}
            deviceBrowser={device?.deviceBrowser}
            deviceRoomId={device?.deviceRoomId}
          />
        </Col>
        <Col xs={5}>
          <Text>{t('this-screen-source-will-be-seen-by-the-client')}</Text>
          <SharingSourcePreviewCard
            sharingSourceID={waitingForConnectionSharingSessionSourceId}
          />
        </Col>
      </Row>
    </div>
  );
}
